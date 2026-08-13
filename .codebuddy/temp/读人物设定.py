# -*- coding: utf-8 -*-
import glob, docx, os

base = os.getcwd()
files = glob.glob(os.path.join(base, '*.docx'))
print("DOCX文件:", files)

target = None
for f in files:
    if '人物' in f:
        target = f
if target is None and files:
    target = files[0]

print("选中:", target)
d = docx.Document(target)
t = '\n'.join(p.text for p in d.paragraphs)
out = os.path.join(base, '.codebuddy', 'temp', '人物设定.txt')
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, 'w', encoding='utf-8').write(t)
print("字符数:", len(t))
