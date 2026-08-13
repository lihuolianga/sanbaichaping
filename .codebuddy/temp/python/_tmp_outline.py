# -*- coding: utf-8 -*-
import os

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"

# 列出所有 .md 文件（含书名号等特殊字符的文件）
files = os.listdir(base)
print("根目录 .md 文件:")
for f in files:
    if f.endswith(".md"):
        full = os.path.join(base, f)
        print(f"  {f}  ({os.path.getsize(full)} 字节)")

# 找到大纲文件
outline = None
for f in files:
    if "1187" in f and f.endswith(".md"):
        outline = os.path.join(base, f)
        break

if outline:
    txt = open(outline, encoding="utf-8").read()
    lines = txt.splitlines()
    print(f"\n大纲文件: {os.path.basename(outline)}")
    print(f"总行数: {len(lines)}")
    print("---- 前 30 行 ----")
    for i, line in enumerate(lines[:30]):
        print(f"{i+1}: {line}")
