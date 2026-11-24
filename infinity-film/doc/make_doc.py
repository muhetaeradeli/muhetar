#!/usr/bin/env python3
"""The reading script for the narrator: every sentence the film reads, in order, with its id and where it falls
in the film, plus how to record it. Writes doc/Дикторлық-мәтін.docx (and a .pdf when LibreOffice is installed).
   python3 doc/make_doc.py   (run from the film folder; reads cut.js, script.js and score.js)"""
import json, os, subprocess
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
node = lambda js: json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))
score = node("const S=require('./score.js'); console.log(JSON.stringify({cut: S.CUT, dur: S.DURATION, lines: S.lines.map(l=>({id:l.id,kind:l.kind,t:l.t,dur:l.dur,scene:l.scene}))}))")
script = node("console.log(JSON.stringify(require('./script.js')))")
say = {l['id']: l.get('say', l['text']) for sc in script for l in sc['lines'] if l.get('id')}
mmss = lambda t: f'{int(t // 60)}:{int(t % 60):02d}'

d = Document()
s = d.sections[0]; s.page_width, s.page_height = Cm(21), Cm(29.7)
s.left_margin, s.right_margin, s.top_margin, s.bottom_margin = Cm(2.2), Cm(1.5), Cm(1.8), Cm(1.8)
st = d.styles['Normal']; st.font.name = 'Times New Roman'; st.font.size = Pt(13)
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman'); st.element.rPr.rFonts.set(qn('w:cs'), 'Times New Roman')
def para(text, bold=False, align=WD_ALIGN_PARAGRAPH.LEFT, size=13, after=2, italic=False, color=None):
    p = d.add_paragraph(); p.alignment = align; p.paragraph_format.space_after = Pt(after); p.paragraph_format.line_spacing = 1.2
    r = p.add_run(text); r.bold = bold; r.italic = italic; r.font.size = Pt(size)
    if color: r.font.color.rgb = RGBColor(*color)
C = WD_ALIGN_PARAGRAPH.CENTER
para('ҚАЗАҚТЫҢ ДӘСТҮРЛІ ҚОЛӨНЕРІНДЕГІ ШЕКСІЗДІК ПЕН МӘҢГІЛІК ИДЕЯСЫ', True, C, 15)
n = len(score['lines'])
para(f'Дикторлық мәтін · видео {mmss(score["dur"])} · {n} сөйлем — бәрі мәтіннің өз сөйлемдері, өзгеріссіз және мәтіндегі ретімен', False, C, 11, 10, color=(110, 110, 110))
para('Қалай жазып алу керек', True, size=13)
for t in [
    'Бір тәсілді таңдаңыз (араластыруға да болады):',
    '1) Бүкіл мәтінді бір рет оқып жазыңыз → файлдың атауы all.m4a.',
    '2) Әр бөлімді бөлек жазыңыз → атауы кестедегі бөлім коды, мысалы c02.m4a.',
    '3) Әр сөйлемді бөлек жазыңыз → атауы сөйлемнің id-і, мысалы L011.m4a.',
    'Әр сөйлемнен кейін 1 секундтай кідіріс жасаңыз: бағдарлама жазбаны сол кідірістерден сөйлемдерге бөледі. '
    'Тақырыптарды да оқыңыз (кестеде қалың әріппен). Тыныш бөлмеде, телефонды аузыңыздан 20–30 см қашықтықта ұстап жазыңыз.',
    'Видео сіздің дауысыңыздың қарқынына қарай өзі қайта жиналады: әр сурет пен жазу дәл өз сөзіне келеді. '
    'Сондықтан асықпай, өз қарқыныңызбен оқи беріңіз; «Уақыт» бағаны тек бағдар үшін (синтездік дауыс бойынша).',
]: para(t, size=12)
t = d.add_table(rows=1, cols=5); t.style = 'Table Grid'
for c, h in zip(t.rows[0].cells, ['№', 'id', 'Бөлім', 'Уақыт', 'Оқылатын мәтін']): c.text = h; c.paragraphs[0].runs[0].bold = True
for i, l in enumerate(score['lines'], 1):
    r = t.add_row().cells
    r[0].text, r[1].text, r[2].text, r[3].text = str(i), l['id'], l['scene'], mmss(l['t'])
    run = r[4].paragraphs[0].add_run(say[l['id']]); run.bold = l['kind'] in ('title', 'heading')
WIDTHS = [Cm(0.9), Cm(1.4), Cm(1.5), Cm(1.6), Cm(11.9)]
t.autofit = False
for col, w in zip(t.columns, WIDTHS): col.width = w
for gc, w in zip(t._tbl.tblGrid.findall(qn('w:gridCol')), WIDTHS): gc.set(qn('w:w'), str(int(w.twips)))
for row in t.rows:
    for c, w in zip(row.cells, WIDTHS):
        c.width = w
        for p in c.paragraphs:
            for r in p.runs: r.font.size = Pt(11)
out = os.path.join(ROOT, 'doc', 'Дикторлық-мәтін.docx'); d.save(out); print(out)
try:
    subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', os.path.dirname(out), out], check=True, capture_output=True, timeout=180)
    print(out.replace('.docx', '.pdf'))
except Exception as e:
    print('pdf skipped:', e)
