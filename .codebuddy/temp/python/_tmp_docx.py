# -*- coding: utf-8 -*-
import zipfile, re, sys, os

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"

def read_docx(path):
    with zipfile.ZipFile(path) as z:
        xml = z.read("word/document.xml").decode("utf-8", errors="ignore")
    # 提取段落文本
    xml = xml.replace("</w:p>", "\n")
    # 去掉标签
    text = re.sub(r"<[^>]+>", "", xml)
    return text

files = [
    "玄衡界世界观设定总表.docx",
    "《师父飞升后留下三百个差评》人物设定总表.docx",
]

for fn in files:
    p = os.path.join(base, fn)
    print("="*60)
    print("FILE:", fn)
    print("="*60)
    txt = read_docx(p)
    print(txt[:6000])
    print("\n\n")
