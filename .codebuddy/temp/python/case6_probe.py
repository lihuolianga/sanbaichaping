# -*- coding: utf-8 -*-
import os

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"

# 1. 案卷目录里找案件六
catalog = os.path.join(base, "案卷目录.md")
if os.path.exists(catalog):
    text = open(catalog, encoding="utf-8-sig", errors="replace").read()
    lines = text.splitlines()
    for i, l in enumerate(lines):
        if "案件六" in l or "第六" in l or "案件6" in l:
            print(f"[案卷目录 L{i+1}] {l.strip()}")
            for j in range(max(0, i - 3), min(len(lines), i + 8)):
                print(f"    | {lines[j].strip()}")

# 2. 第一卷的案件文件夹
vol1 = os.path.join(base, "第一卷")
if os.path.isdir(vol1):
    dirs = sorted([x for x in os.listdir(vol1) if "案件" in x])
    print("\n[第一卷案件文件夹]")
    for x in dirs:
        print("   ", x)

# 3. 案件六文件夹内容
for d in dirs:
    if "六" in d:
        case_dir = os.path.join(vol1, d)
        files = sorted(os.listdir(case_dir))
        print(f"\n[{d}] 共{len(files)}个文件")
        for f in files:
            print("   ", f)
