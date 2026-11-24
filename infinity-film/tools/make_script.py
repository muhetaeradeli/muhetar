#!/usr/bin/env python3
"""Build script.js from the text itself: every sentence of the document becomes one narration line, in order.
   python3 tools/make_script.py <the .docx>
- every heading is read as its own line and opens a chapter (the film shows it as a title card);
- the two tables are read row by row, the numbered list item by item; the two figures (Сызба 4, 5) are
  placed where they stand in the text and shown as animated diagrams (they have no narration);
- what is read is exactly what the subtitle shows. The only differences from the printed text are listed in
  NOTES below (section numbers and bracketed references are not read; two unfinished sentences are completed).
Line ids are L001, L002, … in reading order: a recording saved as my-voice/L001.m4a replaces that line."""
import json, os, re, sys
import docx
from docx.oxml.ns import qn

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]

# headings that open a paragraph (printed in italics in the text), and the stand-alone ones
SUB = ['Шексіздік ұғымының мәні.', 'Мәңгілік ұғымының мәні.', 'Уақыттың циклдік сипаты.', 'Циклдік уақыт және кеңістік туралы түсінік.',
       'Кеңістік туралы түсінік.', 'Табиғаттағы айналым және мәңгілік қозғалыс.', 'Адам, табиғат және ғарыш бірлігі.',
       'Ұрпақ сабақтастығы және мәдени мәңгілік.', 'Ою-өрнектегі шексіздік идеясы.', 'Шеңбер символикасы.', 'Төрт бағыт және әлемнің тұтастығы.',
       'Уақыт пен кеңістіктің өзара байланысы.', 'Уақытты табиғи құбылыстар арқылы анықтау.', 'Маусымдық және шаруашылық уақыт.',
       'Қоныс кеңістігінің ұйымдастырылуы.', 'Киіз үйдің ішкі кеңістігі.', 'Әлеуметтік және ғұрыптық уақыт.', 'Уақыт пен кеңістіктің қолөнерге әсері.',
       'Бейімдеу ұғымы.', 'Дәстүрлі дереккөзді зерттеу.', 'Композициялық құрылымды талдау.', 'Стилизациялау тәсілдері.', 'Түс пен материалға бейімдеу.',
       'Өнім түрлеріне бейімдеу.', 'Заманауи технологияларды пайдалану.', 'Мәдени және этикалық талаптар.', 'Бейімдеу реті.', 'Бейімделген өнімді бағалау.',
       'Символдың шығу тегі.', 'Шексіздік символдарының дәстүрлі негізі.', 'Символдың мағыналық ерекшелігі.', 'Қолөнердегі композициялық көрінісі.',
       'Қазіргі этнодизайндағы бейімделуі.', 'Материал мен технологияның әсері.', 'Цифрлық ортадағы көрінісі.', 'Мәдени жауапкершілік.']
SUB_STANDALONE = ['Шексіздік пен мәңгіліктің көркемдік айырмашылығы']
CAPTIONS = ['Дәстүрлі қолөнердегі үздіксіздік идеясының көркемдік берілуі', 'Кесте. Бейімделген этнодизайн өнімін бағалау өлшемдері']
PARTS = {  # top-level headings: part number shown on the card, not read
    '2.1 Шексіздік пен мәңгілік ұғымдарының дүниетанымдық негіздері': '2.1',
    '2.2 Қазақ халқының дәстүрлі дүниетанымындағы уақыт пен кеңістік.': '2.2',
    'Дәстүрлі қазақ дүниетанымындағы уақыт пен кеңістік': '',
    'Шексіздік символдарын заманауи этнодизайнға бейімдеу': '',
    '3. Шексіздік белгілерін қолданудағы мәдени және этикалық талаптар': '3',
}
NOTES = []
FIX = {  # the two sentences that stop mid-way in the text, completed with the word they need
    'мәдени ақпаратты сақтайтын таңбалық жүйе қызметін де': 'мәдени ақпаратты сақтайтын таңбалық жүйе қызметін де атқарады.',
    'олардың көркемдік көрінісінде белгілі бір айырмашылық': 'олардың көркемдік көрінісінде белгілі бір айырмашылық бар.',
}

def clean(s):
    s = s.replace(' ', ' ').replace('–', '—').replace(' - ', ' — ')
    s = re.sub(r'\s*\[\d+,\s*[\d–—-]+-б\.\]', '', s)                      # [1, 195–202-б.]
    s = re.sub(r'\s*\(Шайгозова, Наурзбаева және Нехвядович, 2024\)', '', s)
    return re.sub(r'\s+', ' ', s).strip()

def sentences(p):
    # split after . ! ? before a capital or «, but not after an initial such as «З.»
    out, cur = [], ''
    for tok in re.split(r'(?<=[.!?])\s+', p):
        cur = (cur + ' ' + tok).strip() if cur else tok
        if re.search(r'(^|\s)[А-ЯӘҒҚҢӨҰҮҺІ]\.$', cur): continue
        out.append(cur); cur = ''
    if cur: out.append(cur)
    return out

d = docx.Document(SRC)
items = []  # (kind, text, extra)
tables = iter(d.tables)
for el in d.element.body.iterchildren():
    tag = el.tag.split('}')[1]
    if tag == 'tbl':
        tb = next(tables); rows = [[clean(c.text) for c in r.cells] for r in tb.rows]
        items.append(('table', rows, None)); continue
    if tag != 'p': continue
    has_img = any(True for _ in el.iter(qn('w:drawing')))
    txt = clean(''.join(t.text or '' for t in el.iter(qn('w:t'))))
    if has_img and not txt: items.append(('figure', None, None))
    if has_img and txt: items.append(('figure-after-list', None, None))  # Сызба 5 sits in «Бейімдеу реті»: show it after the list
    if not txt: continue
    numbered = el.find('.//' + qn('w:numPr')) is not None
    items.append(('list' if numbered else 'para', txt, None))

lines, chapters, cur = [], [], None
def chapter(title, part=None, kind='sub'):
    global cur
    cur = {'title': title.rstrip('.'), 'part': part, 'kind': kind, 'lines': []}; chapters.append(cur)
def add(text, kind='s', say=None, extra=None):
    for k, v in FIX.items():
        if text.endswith(k): NOTES.append(f'«…{k}» — мәтінде сөйлем аяқталмаған; оқылатыны: «…{v}»'); text = text[: -len(k)] + v
    ln = {'kind': kind, 'text': text}
    if say: ln['say'] = say
    if extra: ln.update(extra)
    cur['lines'].append(ln)

first = True; list_n = 0; table_n = 0; fig_n = 0; deferred = False
for kind, txt, _ in items:
    if kind == 'figure-after-list': deferred = True; continue
    if deferred and kind != 'list' and list_n:
        fig_n += 1; cur['lines'].append({'kind': 'figure', 'figure': 3 + fig_n, 'text': ''}); deferred = False
    if first:  # the title of the text
        chapter('ҚАЗАҚТЫҢ ДӘСТҮРЛІ ҚОЛӨНЕРІНДЕГІ ШЕКСІЗДІК ПЕН МӘҢГІЛІК ИДЕЯСЫ', None, 'title')
        add('Қазақтың дәстүрлі қолөнеріндегі шексіздік пен мәңгілік идеясы.', 'title'); first = False; continue
    if kind == 'figure':
        fig_n += 1; cur['lines'].append({'kind': 'figure', 'figure': 3 + fig_n, 'text': ''}); continue
    if kind == 'table':
        table_n += 1; rows = txt
        for i, r in enumerate(rows):
            if i == 0: text = ', '.join(r) + '.'; text = text[0].upper() + text[1:]
            elif len(r) == 3: text = f'{r[0]}: {r[1][0].lower() + r[1][1:]}; {r[2][0].lower() + r[2][1:]}.'
            else: text = f'{r[0]}: {r[1][0].lower() + r[1][1:]}'
            add(text, 'row', extra={'table': table_n, 'row': i})
        continue
    if kind == 'list':
        list_n += 1; t = txt[0].upper() + txt[1:]
        add(t, 'item', extra={'n': list_n}); continue
    # paragraphs: a top-level heading, a stand-alone heading, a caption, or sentences (maybe opened by a sub-heading)
    hit = next((h for h in PARTS if txt.startswith(h)), None)
    if hit:
        title = re.sub(r'^\d(\.\d)?\.?\s*', '', hit).rstrip('.')
        chapter(title, PARTS[hit] or None, 'part'); add(title + '.', 'heading')
        txt = txt[len(hit):].strip()
        if not txt: continue
    if txt in SUB_STANDALONE: chapter(txt, None, 'sub'); add(txt + '.', 'heading'); continue
    if txt in CAPTIONS: add(txt.rstrip('.') + '.', 'caption'); continue
    sub = next((h for h in SUB if txt.startswith(h)), None)
    if sub:
        chapter(sub); add(sub, 'heading'); txt = txt[len(sub):].strip()
    for s in sentences(txt):
        say = None
        if s.startswith('З. Шайгозова, А. Наурзбаева және Л. Нехвядович'):
            say = s.replace('З. Шайгозова, А. Наурзбаева және Л. Нехвядович', 'Шайгозова, Наурзбаева және Нехвядович')
        add(s, 's', say)

# ids in reading order (figures are not read and get no id)
n = 0
for c in chapters:
    for ln in c['lines']:
        if ln['kind'] != 'figure': n += 1; ln['id'] = f'L{n:03d}'
NOTES.insert(0, 'Бөлім нөмірлері (2.1, 2.2, 3) мен жақшадағы сілтемелер оқылмайды; «З. Шайгозова, А. Наурзбаева және Л. Нехвядович» жолында синтезделген дауыс бас әріптерді оқымайды.')
words = sum(len(ln['text'].split()) for c in chapters for ln in c['lines'])
js = ['// THE SCRIPT (generated by tools/make_script.py from the text — do not edit by hand): every sentence of',
      '// «Қазақтың дәстүрлі қолөнеріндегі шексіздік пен мәңгілік идеясы», in order. One chapter per heading.',
      '// `text` is what is read and what the subtitle shows; `say` (rare) is how the text-to-speech must read it.',
      '// To use YOUR OWN VOICE: save each line as my-voice/<id>.m4a (L001.m4a, …), then python3 tools/build_voice.py && node song.js',
      '(function () {', '  const SCRIPT = ' + json.dumps([{'scene': f'c{i:02d}', **{k: v for k, v in c.items()}} for i, c in enumerate(chapters)], ensure_ascii=False, indent=1) + ';',
      '  const NOTES = ' + json.dumps(NOTES, ensure_ascii=False) + ';',
      "  if (typeof module !== 'undefined') { module.exports = SCRIPT; module.exports.NOTES = NOTES; } else globalThis.SCRIPT = SCRIPT;", '})();', '']
open(os.path.join(ROOT, 'script.js'), 'w').write('\n'.join(js))
print(f'{len(chapters)} chapters, {n} lines, {words} words')
for x in NOTES: print(' NOTE:', x)
