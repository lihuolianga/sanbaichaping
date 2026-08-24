# -*- coding: utf-8 -*-
"""案件七 11章阅读长度与口语化(对话)长度统计"""
import os, re, sys

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

def count_dialogue(text):
    """统计引号内对话字数。匹配 U+201C/201D 与 U+2018/2019（中文弯引号）。"""
    dialogue_len = 0
    # 左引号：U+201C(”), U+2018(‘)；右引号：U+201D(”), U+2019(’)
    pattern = re.compile(
        u'[\u201c\u2018]([^\u201c\u201d\u2018\u2019]{1,300})[\u201d\u2019]'
    )
    for m in pattern.finditer(text):
        inner = m.group(1).strip()
        if not inner:
            continue
        cjk = len(re.findall(r'[\u4e00-\u9fff0-9A-Za-z]', inner))
        dialogue_len += cjk
    return dialogue_len, []

def main():
    total_chars = 0
    total_dlg = 0
    print("=" * 90)
    print("案件七 阅读长度 / 口语化长度 统计")
    print("=" * 90)
    print(f"{'章节':<28}{'总字数':>7}{'段数':>5}{'对话字数':>8}{'对话占比':>8}{'估计阅读时长'}")
    print("-" * 90)
    for fn in FILES:
        p = os.path.join(BASE, fn)
        text = read_utf8(p)
        if not text:
            print(fn, "读取失败")
            continue
        # 去掉标题行
        lines = text.splitlines()
        body = "\n".join(l for l in lines if not l.startswith("#"))
        # 总字数（中文字符 + 数字字母）
        chars = len(re.findall(r'[\u4e00-\u9fff0-9A-Za-z]', body))
        paras = len([l for l in body.splitlines() if l.strip()])
        dlg, _ = count_dialogue(body)
        ratio = dlg / chars * 100 if chars else 0
        minutes = chars / 300  # 阅读速度按每分钟300字
        total_chars += chars
        total_dlg += dlg
        name = fn.replace(".md", "")
        # 计算 mm:ss
        mm = int(minutes)
        ss = int((minutes - mm) * 60)
        print(f"{name:<30}{chars:>7}{paras:>5}{dlg:>8}{ratio:>7.1f}%{mm:>4}分{ss:>2}秒")
    print("-" * 90)
    print(f"合计 11章 总字数:{total_chars}  对话总字数:{total_dlg}  对话占比:{total_dlg/total_chars*100:.1f}%")
    print(f"全案估计阅读时长: {total_chars/300:.1f} 分钟 (按300字/分钟)")

if __name__ == "__main__":
    main()
