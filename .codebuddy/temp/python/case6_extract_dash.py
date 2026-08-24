# -*- coding: utf-8 -*-
import os, re

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
case_dir = os.path.join(base, "第一卷", "案件六 照真镜拆家")
out = r"C:\Users\Administrator\case6_dash_ctx.txt"
buf = []

files = sorted([f for f in os.listdir(case_dir) if f.endswith(".md")])
for f in files:
    p = os.path.join(case_dir, f)
    t = open(p, encoding="utf-8-sig", errors="replace").read()
    # 逐行找破折号
    lines = t.splitlines()
    buf.append(f"\n===== {f} =====")
    idx = 0
    for ln in lines:
        if "——" in ln:
            # 找该行所有破折号位置
            for m in re.finditer("——", ln):
                s = max(0, m.start() - 28)
                e = min(len(ln), m.end() + 28)
                ctx = ln[s:e]
                # 用丨标记破折号位置
                ctx_marked = ctx.replace("——", "【——】", 1) if ctx.count("——") >= 1 else ctx
                buf.append(f"  L{idx+1} | ...{ctx_marked}...")
        idx += 1

with open(out, "w", encoding="utf-8") as fo:
    fo.write("\n".join(buf))
print("written", out)
