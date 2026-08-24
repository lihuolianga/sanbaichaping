# -*- coding: utf-8 -*-
import os

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
out = r"C:\Users\Administrator\case6_info.txt"
buf = []

# 1. 第一卷所有案件文件夹（带序号）
vol1 = os.path.join(base, "第一卷")
dirs = sorted([x for x in os.listdir(vol1) if "案件" in x])
buf.append("=== 第一卷案件文件夹 ===")
for i, x in enumerate(dirs, 1):
    buf.append(f"{i}. {x}")

# 2. 找案件六文件夹（文件名含"六"）
case6_dir = None
for x in dirs:
    if "六" in x:
        case6_dir = os.path.join(vol1, x)
        buf.append(f"\n=== 案件六文件夹: {x} ===")
        files = sorted(os.listdir(case6_dir))
        buf.append(f"共{len(files)}个文件:")
        for f in files:
            buf.append(f"   {f}")
        break

# 3. 案卷目录中案件六附近的行
catalog = os.path.join(base, "案卷目录.md")
if os.path.exists(catalog):
    text = open(catalog, encoding="utf-8-sig", errors="replace").read()
    lines = text.splitlines()
    buf.append("\n=== 案卷目录: 含'案件六'/'66'或案件六标题附近的行 ===")
    # 先找案件六标题
    for i, l in enumerate(lines):
        if "案件六" in l and "章" in l:
            buf.append(f"\n--- 案件六标题 @L{i+1} ---")
            for j in range(max(0, i - 2), min(len(lines), i + 25)):
                buf.append(f"{j+1}: {lines[j].strip()}")

with open(out, "w", encoding="utf-8") as f:
    f.write("\n".join(buf))
print("written", out)
