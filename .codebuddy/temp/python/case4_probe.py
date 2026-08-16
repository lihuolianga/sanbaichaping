# -*- coding: utf-8 -*-
import os, re

root = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
vol1 = os.path.join(root, "第一卷")

# 找案件四目录
case4 = None
for x in os.listdir(vol1):
    if "案件四" in x:
        case4 = os.path.join(vol1, x)
        break

print("案件四目录:", case4 if case4 else "未找到")
if case4:
    files = sorted(os.listdir(case4))
    nums = []
    print("文件数:", len(files))
    for f in files:
        m = re.match(r"第(\d+)章\s+(.+)\.md", f)
        if m:
            nums.append(int(m.group(1)))
            print(f"  第{m.group(1)}章 {m.group(2)}")
        else:
            print(f"  [非章节文件] {f}")
    if nums:
        print("\n章号范围:", min(nums), "-", max(nums), "共", len(nums), "章")
        print("连续:", nums == list(range(min(nums), max(nums)+1)))
