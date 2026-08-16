# -*- coding: utf-8 -*-
import os

root = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
case5 = os.path.join(root, "第一卷", "案件五 替死纸人拒绝替死")

out = []
for n in range(57, 66):
    fname = None
    for f in os.listdir(case5):
        if f.startswith("第{}章".format(n)) and f.endswith(".md"):
            fname = f
            break
    if not fname:
        continue
    raw = open(os.path.join(case5, fname), encoding="utf-8-sig").read()
    cnt = raw.count("——")
    if cnt == 0:
        continue
    out.append("\n===== 第{}章 破折号{}处 =====".format(n, cnt))
    idx = 0
    num = 0
    while True:
        i = raw.find("——", idx)
        if i == -1:
            break
        num += 1
        ctx = raw[max(0, i - 25):i + 25].replace("\n", "|")
        out.append("[{}] ...{}...".format(num, ctx))
        idx = i + 2

with open(r"C:\Users\Administrator\case5_dash_ctx.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(out))
print("已写入 case5_dash_ctx.txt")
