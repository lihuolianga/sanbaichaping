# -*- coding: utf-8 -*-
import os, re

root = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
case5 = os.path.join(root, "第一卷", "案件五 替死纸人拒绝替死")
chapters_dir = os.path.join(root, ".codebuddy", "tools", "fanqie-publisher-cli", "chapters")

os.makedirs(chapters_dir, exist_ok=True)
for f in os.listdir(chapters_dir):
    os.remove(os.path.join(chapters_dir, f))

total_dash = 0
for n in range(57, 66):
    md_path = None
    for f in os.listdir(case5):
        if f.startswith("第{}章".format(n)) and f.endswith(".md"):
            md_path = os.path.join(case5, f)
            break
    if not md_path:
        print("缺失第{}章".format(n))
        continue

    raw = open(md_path, encoding="utf-8-sig").read()
    lines = raw.split("\n")
    first = lines[0].strip().lstrip("#").strip()
    body = "\n".join(lines[1:]).replace("**", "").strip()
    dash = body.count("——")
    total_dash += dash

    out = first + "\n\n" + body + "\n"
    outname = "{:03d}-{}.txt".format(n, first)
    with open(os.path.join(chapters_dir, outname), "w", encoding="utf-8") as w:
        w.write(out)

    flag = " [破折号{}处]".format(dash) if dash else ""
    print("第{}章 -> {}{}".format(n, first, flag))

print("\n破折号总计:", total_dash)
print("chapters 目录文件数:", len(os.listdir(chapters_dir)))
