# -*- coding: utf-8 -*-
import os, re

root = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
vol1 = os.path.join(root, "第一卷")

# 找案件五目录
case5 = None
for x in os.listdir(vol1):
    if "案件五" in x:
        case5 = os.path.join(vol1, x)
        break

print("案件五目录:", case5 if case5 else "未找到")
if case5:
    files = sorted(os.listdir(case5))
    nums = []
    print("文件数:", len(files))
    for f in files:
        m = re.match(r"第(\d+)章\s+(.+)\.md", f)
        if m:
            nums.append(int(m.group(1)))
            print(f"  第{m.group(1)}章 {m.group(2)}")
        else:
            print(f"  [非章节] {f}")
    if nums:
        print("\n章号范围:", min(nums), "-", max(nums), "共", len(nums), "章")
        print("连续:", nums == list(range(min(nums), max(nums)+1)))
        # 检查每章破折号
        total_dash = 0
        for n in nums:
            for f in os.listdir(case5):
                if f.startswith("第{}章".format(n)) and f.endswith(".md"):
                    t = open(os.path.join(case5, f), encoding="utf-8-sig").read()
                    d = t.count("——")
                    if d:
                        total_dash += d
                        print(f"  第{n}章 破折号{d}处")
                    break
        print("\n破折号总计:", total_dash)
