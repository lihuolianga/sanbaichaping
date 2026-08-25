# -*- coding: utf-8 -*-
"""删除 chapters 目录下案件8的旧标题 txt 文件（残留导致上传用错标题）"""
import os, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

d = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\.codebuddy\tools\fanqie-publisher-cli\chapters"

old = [
    "091-第91章 客户没有说完的话.txt",
    "092-第92章 第一次修补失败.txt",
    "095-第95章 责任不再落给无辜者.txt",
]
for fn in old:
    p = os.path.join(d, fn)
    if os.path.exists(p):
        os.remove(p)
        print(f"删除: {fn}")
    else:
        print(f"跳过(不存在): {fn}")

print("--- chapters 目录 087-096 文件 ---")
for f in sorted(os.listdir(d)):
    if f.startswith("08") and f.endswith(".txt") and (f.startswith("087") or f.startswith("088") or f.startswith("089") or f.startswith("090") or f.startswith("091") or f.startswith("092") or f.startswith("093") or f.startswith("094") or f.startswith("095") or f.startswith("096")):
        print(f)
