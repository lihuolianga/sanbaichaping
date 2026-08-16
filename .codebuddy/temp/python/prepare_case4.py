# -*- coding: utf-8 -*-
import os, re

root = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
case4 = os.path.join(root, "第一卷", "案件四 聚财阵只招耗子")
chapters_dir = os.path.join(root, ".codebuddy", "tools", "fanqie-publisher-cli", "chapters")

title_map = {
    51: "欠薪木牌上的七个名字",
    52: "撕毁十四条保养券",
    55: "自己的债自己还",
}

os.makedirs(chapters_dir, exist_ok=True)
for f in os.listdir(chapters_dir):
    os.remove(os.path.join(chapters_dir, f))

print("生成案件四 txt...")
total_dash = 0
for n in range(48, 57):
    # 找第n章md
    md_path = None
    for f in os.listdir(case4):
        if f.startswith("第{}章".format(n)) and f.endswith(".md"):
            md_path = os.path.join(case4, f)
            break
    if not md_path:
        print("  缺失第{}章".format(n))
        continue

    raw = open(md_path, encoding="utf-8-sig").read()
    lines = raw.split("\n")
    # 第一行是 "# 第N章 原标题"
    first = lines[0].strip().lstrip("#").strip()
    # 提取原标题
    m = re.match(r"第\s*\d+\s*章\s*[:：、.\-\s]*(.+)$", first)
    orig_title = m.group(1).strip() if m else first

    # 用新标题覆盖（如果有）
    if n in title_map:
        new_title = title_map[n]
        title_line = "第{}章 {}".format(n, new_title)
    else:
        title_line = "第{}章 {}".format(n, orig_title)

    body = "\n".join(lines[1:]).replace("**", "").strip()
    dash = body.count("——")
    total_dash += dash

    out = title_line + "\n\n" + body + "\n"
    outname = "{:03d}-{}.txt".format(n, title_line)
    with open(os.path.join(chapters_dir, outname), "w", encoding="utf-8") as w:
        w.write(out)

    flag = " [破折号{}处]".format(dash) if dash else ""
    note = " [改标题:{}]".format(new_title) if n in title_map else ""
    print("  第{}章 {} -> {}{}{}".format(n, orig_title, title_line, note, flag))

print("\n破折号总计:", total_dash)
print("\nchapters 目录:")
for f in sorted(os.listdir(chapters_dir)):
    print("  ", f)
