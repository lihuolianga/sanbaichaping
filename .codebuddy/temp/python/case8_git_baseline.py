# -*- coding: utf-8 -*-
"""记录案件八修改前的 git 基线"""
import subprocess, os

ROOT = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"

def run(args):
    r = subprocess.run(args, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return r.stdout + r.stderr

if __name__ == "__main__":
    print("=== git status --short ===")
    print(run(["git", "status", "--short"]))
    print("=== git diff --stat ===")
    print(run(["git", "diff", "--stat"]))
    print("=== 目标文件哈希 ===")
    case8 = os.path.join(ROOT, "第一卷", "案件八 求子符让男人怀孕")
    for fn in sorted(os.listdir(case8)):
        if fn.endswith(".md"):
            p = os.path.join(case8, fn)
            h = subprocess.run(["git", "hash-object", p], cwd=ROOT, capture_output=True, text=True, encoding="utf-8").stdout.strip()
            print(f"{h}  {fn}")
