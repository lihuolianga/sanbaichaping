# -*- coding: utf-8 -*-
"""案件七 每章字符数 + 字符(字)频次统计"""
import os, re
from collections import Counter

BASE = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\第一卷\案件七 镇水符让河神失业"
FILES = [
    "第76章 镇水符让河神失业.md",
    "第77章 堵在河底的祈愿纸.md",
    "第78章 沅河古堤的出口.md",
    "第79章 证词里的裂缝.md",
    "第80章 河神破裂的金身.md",
    "第81章 客户没有说完的话.md",
    "第82章 第一次修补失败.md",
    "第83章 这次不能只听李无咎的.md",
    "第84章 镇水符让河神失业真正的故障.md",
    "第85章 责任不再落给无辜者.md",
    "第86章 泄洪名单指向下一页.md",
]

def read_utf8(p):
    for enc in ("utf-8-sig", "utf-8"):
        try:
            with open(p, "r", encoding=enc) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    return ""

HAN = re.compile(r'[\u4e00-\u9fff]')
ALLCHAR = re.compile(r'\S')  # 非空白字符
PUNCT = re.compile(r'[，。！？；：、""（）《》—…·“”‘’]')  # 常见全角标点

def main():
    print("=" * 96)
    print("案件七 每章字符数统计")
    print("=" * 96)
    print(f"{'章节':<30}{'总字符(含标点)':>10}{'汉字数':>8}{'标点数':>7}{'非汉字字符':>8}")
    print("-" * 96)
    totals = Counter()
    grand = {"chars": 0, "han": 0, "punct": 0}
    per_chapter_top = {}
    for fn in FILES:
        text = read_utf8(os.path.join(BASE, fn))
        body = "\n".join(l for l in text.splitlines() if not l.startswith("#"))
        n_chars = len(ALLCHAR.findall(body))
        n_han = len(HAN.findall(body))
        n_punct = len(PUNCT.findall(body))
        n_other = n_chars - n_han - n_punct
        name = fn.replace(".md", "")[:28]
        print(f"{name:<30}{n_chars:>10}{n_han:>8}{n_punct:>7}{n_other:>8}")
        # 汉字频次
        cnt = Counter(HAN.findall(body))
        per_chapter_top[fn] = cnt
        totals.update(cnt)
        grand["chars"] += n_chars
        grand["han"] += n_han
        grand["punct"] += n_punct
    print("-" * 96)
    print(f"{'合计 11章':<30}{grand['chars']:>10}{grand['han']:>8}{grand['punct']:>7}{grand['chars']-grand['han']-grand['punct']:>8}")
    print()

    print("=" * 96)
    print("全案高频汉字 Top 50（字符次数）")
    print("=" * 96)
    for i, (ch, n) in enumerate(totals.most_common(50), 1):
        print(f"{i:>2}. {ch} × {n}", end="  ")
        if i % 5 == 0:
            print()
    print()

    print("=" * 96)
    print("每章高频汉字 Top 15（字符次数）")
    print("=" * 96)
    for fn in FILES:
        name = fn.replace(".md", "")
        print(f"\n【{name}】")
        print("  " + "  ".join(f"{ch}×{n}" for ch, n in per_chapter_top[fn].most_common(15)))

    print()
    print("=" * 96)
    print("指定关键词出现次数")
    print("=" * 96)
    keys = ["李无咎", "归鹤", "柳村", "阿沅", "宁知微", "裴照夜", "铁算盘", "王大喜", "曹三娘", "韩九章", "韩崇文", "监察司", "水位碑", "镇水符", "祈愿纸", "泄洪", "柳小满", "周太公"]
    all_text = "".join(read_utf8(os.path.join(BASE, fn)) for fn in FILES)
    for k in keys:
        print(f"{k}: {all_text.count(k)}次")

if __name__ == "__main__":
    main()
