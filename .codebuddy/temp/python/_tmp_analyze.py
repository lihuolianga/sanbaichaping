# -*- coding: utf-8 -*-
import os, re

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"

def parse_case_index(text):
    """解析 00_总控总览.md 的案件索引表"""
    # 表格行：| 案号 | 案件 | 章节 | 章数 | 闭合差评 |
    rows = []
    for line in text.splitlines():
        line = line.strip()
        m = re.match(r"^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*(\d+)[—-](\d+)\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|", line)
        if m:
            rows.append({
                "num": int(m.group(1)),
                "name": m.group(2).strip(),
                "start": int(m.group(3)),
                "end": int(m.group(4)),
                "chapters": int(m.group(5)),
                "reviews": int(m.group(6)),
            })
    return rows

# 读取 00_总控总览.md
with open(os.path.join(base, "00_总控总览.md"), encoding="utf-8") as f:
    master = f.read()

rows = parse_case_index(master)
print("解析到案件数:", len(rows))

total_chapters = sum(r["chapters"] for r in rows)
total_reviews = sum(r["reviews"] for r in rows)
print("章数合计:", total_chapters, "(应为1187)")
print("差评合计:", total_reviews, "(应为300)")

# 检查章号连续性
prev_end = 0
issues = []
for r in rows:
    if r["start"] != prev_end + 1:
        issues.append(f"案件{r['num']} {r['name']}: 起始章{r['start']} 与上一案结束章{prev_end} 不连续")
    if r["end"] - r["start"] + 1 != r["chapters"]:
        issues.append(f"案件{r['num']} {r['name']}: 章号范围({r['start']}-{r['end']}={r['end']-r['start']+1}) 与章数({r['chapters']}) 不符")
    prev_end = r["end"]

print("\n章号连续性与章数一致性检查:")
if issues:
    for i in issues:
        print("  -", i)
else:
    print("  全部连续且一致")

# 卷目分配
volumes = [
    ("第一卷 飞升之后，概不负责", 1, 156),
    ("第二卷 清河县售后录", 157, 252),
    ("第三卷 宗门病灶", 253, 350),
    ("第四卷 王朝旧债", 351, 448),
    ("第五卷 百鬼无名", 449, 548),
    ("第六卷 妖国不服", 549, 648),
    ("第七卷 四海天工", 649, 746),
    ("第八卷 天门下吏", 747, 844),
    ("第九卷 伐天旧史", 845, 942),
    ("第十卷 师徒对账", 943, 1030),
    ("第十一卷 差评联盟", 1031, 1109),
    ("第十二卷 天律停业", 1110, 1187),
]

print("\n卷目-案件分配:")
for vname, vs, ve in volumes:
    cases = [r for r in rows if r["start"] >= vs and r["end"] <= ve]
    ch_sum = sum(r["chapters"] for r in cases)
    rev_sum = sum(r["reviews"] for r in cases)
    nums = [str(r["num"]) for r in cases]
    print(f"  {vname} ({vs}-{ve}): 案件{len(cases)}个 [{','.join(nums)}]  章数{ch_sum} 差评{rev_sum}")

# 进度
DONE_CHAPTER = 1068
done_cases = [r for r in rows if r["end"] <= DONE_CHAPTER]
pending_cases = [r for r in rows if r["end"] > DONE_CHAPTER]
done_reviews = sum(r["reviews"] for r in done_cases)
print(f"\n进度: 已完成案件{len(done_cases)}/92, 待写案件{len(pending_cases)}")
print(f"已完成到第{DONE_CHAPTER}章 (案件{done_cases[-1]['num']} {done_cases[-1]['name']})")
print(f"已闭合差评: {done_reviews}/300")
print(f"待写案件: {[str(r['num']) for r in pending_cases]}")
