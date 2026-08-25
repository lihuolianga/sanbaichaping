# -*- coding: utf-8 -*-
"""案件八 3个md文件重命名（标题与番茄侧重复，改名避免发布硬阻塞）"""
import os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
d = os.path.join(base, "第一卷", "案件八 求子符让男人怀孕")

pairs = [
    ("第91章 客户没有说完的话.md", "第91章 账册最后三页.md"),
    ("第92章 第一次修补失败.md", "第92章 逆阵让老丁入髓.md"),
    ("第95章 责任不再落给无辜者.md", "第95章 复诊日期写进祠堂.md"),
]
for a, b in pairs:
    pa, pb = os.path.join(d, a), os.path.join(d, b)
    if os.path.exists(pa):
        os.rename(pa, pb)
        print(f"重命名: {a} -> {b}")
    else:
        print(f"跳过(不存在): {a}")

print("--- 案件八所有md文件 ---")
for f in sorted(os.listdir(d)):
    if f.endswith(".md"):
        print(f)
