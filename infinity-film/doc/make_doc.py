#!/usr/bin/env python3
"""Write the narration as a Word document: the essay itself, then a table of lines for recording.
   python3 doc/make_doc.py   (run from the film folder; reads script.js and voice-timing.js)"""
import json, os, subprocess
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
script = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./script.js')))"], cwd=ROOT))
vot = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./voice-timing.js')))"], cwd=ROOT))
d = Document()
s = d.sections[0]; s.page_width, s.page_height = Cm(21), Cm(29.7)
s.left_margin, s.right_margin, s.top_margin, s.bottom_margin = Cm(3), Cm(1.5), Cm(2), Cm(2)
st = d.styles['Normal']; st.font.name = 'Times New Roman'; st.font.size = Pt(14)
st.element.rPr.rFonts.set(qn('w:eastAsia'), 'Times New Roman'); st.element.rPr.rFonts.set(qn('w:cs'), 'Times New Roman')
def para(text, bold=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, indent=True, size=14, after=0, before=0, italic=False, color=None):
    p = d.add_paragraph(); f = p.paragraph_format
    f.line_spacing = 1.5; f.space_after = Pt(after); f.space_before = Pt(before); p.alignment = align
    if indent: f.first_line_indent = Cm(1.25)
    r = p.add_run(text); r.bold = bold; r.italic = italic; r.font.size = Pt(size); r.font.name = 'Times New Roman'
    if color: r.font.color.rgb = RGBColor(*color)
    return p
C = WD_ALIGN_PARAGRAPH.CENTER
para('ШЕКСІЗДІК ПЕН МӘҢГІЛІК', True, C, False, 16)
para('Қазақтың дәстүрлі қолөнеріндегі идея', False, C, False, 14, italic=True)
para('Дикторлық мәтін (6 минуттық видеоға)', False, C, False, 12, after=10, color=(110, 110, 110))
for sc in script:
    para(sc['title'], True, WD_ALIGN_PARAGRAPH.LEFT, True, 14, before=6)
    para(' '.join(l['text'] for l in sc['lines']))
total = sum(vot.values())
d.add_page_break()
para('Жазып алуға арналған кесте', True, C, False, 14, after=4)
para(f'Әр жолды бөлек файл етіп жазыңыз (атауы — кестедегі «id», мысалы o1.m4a) және my-voice/ қалтасына салыңыз. '
     f'Видео сіздің дауысыңыздың ұзақтығына қарай өзі қайта жиналады. Синтезделген дауыстың жалпы ұзақтығы — {total:.0f} с.', size=12)
t = d.add_table(rows=1, cols=3); t.style = 'Table Grid'
for c, h in zip(t.rows[0].cells, ['id', 'Мәтін', 'с']): c.text = h; c.paragraphs[0].runs[0].bold = True
for sc in script:
    for l in sc['lines']:
        r = t.add_row().cells; r[0].text = l['id']; r[1].text = l['text']; r[2].text = f"{vot.get(l['id'], 0):.1f}"
for row in t.rows:
    row.cells[0].width, row.cells[1].width, row.cells[2].width = Cm(1.4), Cm(13.6), Cm(1.5)
    for c in row.cells:
        for p in c.paragraphs:
            for r in p.runs: r.font.size = Pt(11)
out = os.path.join(ROOT, 'doc', 'Дикторлық-мәтін.docx'); d.save(out); print(out)
