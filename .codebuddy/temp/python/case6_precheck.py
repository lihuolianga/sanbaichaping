# -*- coding: utf-8 -*-
import os

TOOL = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\.codebuddy\tools\fanqie-publisher-cli"
chapters = os.path.join(TOOL, "chapters")
out = r"C:\Users\Administrator\case6_precheck.txt"
buf = []

if os.path.isdir(chapters):
    files = sorted([f for f in os.listdir(chapters) if f.endswith(".txt")])
    buf.append(f"chapters 目录共 {len(files)} 个txt")
    for f in files:
        buf.append("  " + f)
else:
    buf.append("chapters 目录不存在!")

# 检查工具脚本
for s in ["batch_upload.js", "publish_schedule.js", "launch_batch.py", "read_log.py"]:
    p = os.path.join(TOOL, s) if s.endswith(".js") else os.path.join(r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\.codebuddy\temp\python", s)
    buf.append(f"{s}: {'OK' if os.path.exists(p) else 'MISSING'} -> {p}")

with open(out, "w", encoding="utf-8") as fo:
    fo.write("\n".join(buf))
print("done")
