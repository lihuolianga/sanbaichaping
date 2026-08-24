# -*- coding: utf-8 -*-
import os, glob

CHAPTERS = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\.codebuddy\tools\fanqie-publisher-cli\chapters"
out = r"C:\Users\Administrator\case6_txt_check.txt"
buf = []

files = sorted(glob.glob(os.path.join(CHAPTERS, "0{6,7}-*.txt")) + glob.glob(os.path.join(CHAPTERS, "06[6-9]-*.txt")) + glob.glob(os.path.join(CHAPTERS, "07[0-5]-*.txt")))
# 更准确：06x 和 07x
files = sorted([f for f in os.listdir(CHAPTERS) if f[:3] in [f"{i:03d}" for i in range(66, 76)] and f.endswith(".txt")])

for f in files:
    p = os.path.join(CHAPTERS, f)
    t = open(p, encoding="utf-8").read()
    lines = t.strip().split("\n")
    first = lines[0].strip()
    dash = t.count("——")
    star = t.count("**")
    body = "\n".join(lines[2:])
    han = len([c for c in body if '\u4e00' <= c <= '\u9fff'])
    buf.append(f"{f}")
    buf.append(f"   首行: {first[:50]}")
    buf.append(f"   破折号: {dash} | 加粗残留: {star} | 正文字数: {han}")

with open(out, "w", encoding="utf-8") as fo:
    fo.write("\n".join(buf))
print("done")
