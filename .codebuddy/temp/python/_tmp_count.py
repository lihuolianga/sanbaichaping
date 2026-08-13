# -*- coding: utf-8 -*-
import os, re, sys

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"

dirs = ["第一卷", "第二卷", "第三卷", "第四卷"]

total_files = 0
all_nums = []
for d in dirs:
    p = os.path.join(base, d)
    if not os.path.isdir(p):
        print(f"{d}: 不存在")
        continue
    files = [f for f in os.listdir(p) if f.endswith(".md")]
    nums = []
    for f in files:
        m = re.match(r"^第(\d+)章", f)
        if m:
            nums.append(int(m.group(1)))
    nums.sort()
    dups = sorted(set(n for n in nums if nums.count(n) > 1))
    print(f"{d}: 文件数={len(files)}, 唯一章号数={len(set(nums))}, 章号范围={min(nums)}-{max(nums)}")
    if dups:
        print(f"    重复章号: {dups}")
    total_files += len(files)
    all_nums.extend(nums)

print(f"\n四卷合计文件数={total_files}, 唯一章号总数={len(set(all_nums))}")
print(f"全书已写到的最大章号={max(all_nums)}")

# 检查章号连续性（1到最大章号之间缺哪些）
missing = [n for n in range(1, max(all_nums)+1) if n not in set(all_nums)]
print(f"1-{max(all_nums)} 之间缺失章号数={len(missing)}")
if missing:
    print(f"缺失章号: {missing[:50]}")
