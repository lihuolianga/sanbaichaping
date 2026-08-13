# -*- coding: utf-8 -*-
import os, shutil

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
target = os.path.join(base, ".codebuddy", "temp", "python")
os.makedirs(target, exist_ok=True)

files = [
    "_tmp_analyze.py",
    "_tmp_count.py",
    "_tmp_docx.py",
    "_tmp_outline.py",
    "_tmp_rename.py",
    "_tmp_restruct.py",
]

for fn in files:
    src = os.path.join(base, fn)
    if os.path.exists(src):
        shutil.move(src, os.path.join(target, fn))
        print("moved:", fn)
    else:
        print("skip (不存在):", fn)

# 最后把自己也移进去
self_src = os.path.join(base, "_tmp_move.py")
shutil.move(self_src, os.path.join(target, "_tmp_move.py"))
print("moved self: _tmp_move.py")

print("完成。目标目录内容：")
for fn in sorted(os.listdir(target)):
    print("  ", fn)
