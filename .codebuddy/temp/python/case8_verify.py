# -*- coding: utf-8 -*-
"""案件八优化后验证：只读边界、绝对用词、git diff --check"""
import subprocess, os, re

ROOT = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
CASE8 = os.path.join(ROOT, "第一卷", "案件八 求子符让男人怀孕")
READONLY = [
    os.path.join(ROOT, "第一卷", "案件七 镇水符让河神失业", "第86章 泄洪名单指向下一页.md"),
    os.path.join(ROOT, "第一卷", "案件九 灵剑认仇家为主", "第97章 灵剑认仇家为主.md"),
]

def run(args):
    r = subprocess.run(args, cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace")
    return r.stdout + r.stderr

def read_utf8(p):
    for enc in ("utf-8-sig", "utf-8"):
        try:
            with open(p, "r", encoding=enc) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    return ""

print("=== git diff --check ===")
print(run(["git", "diff", "--check"]))

print("=== 只读边界文件是否被修改 ===")
status = run(["git", "status", "--short"])
for ro in READONLY:
    rel = os.path.relpath(ro, ROOT)
    print(f"{rel}: {'修改!' if rel in status else '未修改'}")

print("=== 绝对用词扫描 ===")
abs_words = ["全部归位", "所有人同意", "充分知情", "责任已完成", "案件正式结案",
             "彻底解决", "完全康复", "没有遗憾", "所有风险已清零", "已经结束"]
for fn in sorted(os.listdir(CASE8)):
    if not fn.endswith(".md"):
        continue
    text = read_utf8(os.path.join(CASE8, fn))
    hits = [w for w in abs_words if w in text]
    if hits:
        print(f"{fn}: {hits}")

print("=== 全局扫描完成 ===")
