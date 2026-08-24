# -*- coding: utf-8 -*-
import os, re

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
case_dir = os.path.join(base, "第一卷", "案件六 照真镜拆家")
out = r"C:\Users\Administrator\case6_wordcount.txt"
buf = []

files = sorted([f for f in os.listdir(case_dir) if f.endswith(".md")])
total_han = 0
total_char = 0
for f in files:
    p = os.path.join(case_dir, f)
    t = open(p, encoding="utf-8-sig", errors="replace").read()
    m = re.search(r"^#\s*(.+)$", t, re.M)
    title = m.group(1).strip() if m else f
    pure = re.sub(r"^第\d+章\s*", "", title)
    body = re.sub(r"^#.*$", "", t, flags=re.M)
    han = len(re.findall(r"[\u4e00-\u9fff]", body))
    chars = len(re.sub(r"\s", "", body))  # 去掉空白后的总字符数
    total_han += han
    total_char += chars
    buf.append(f"{f}")
    buf.append(f"   标题: {pure}")
    buf.append(f"   汉字数: {han} | 正文总字符(含标点): {chars}")

buf.append(f"\n合计: 汉字 {total_han} | 总字符 {total_char}")
with open(out, "w", encoding="utf-8") as fo:
    fo.write("\n".join(buf))
print("done")
