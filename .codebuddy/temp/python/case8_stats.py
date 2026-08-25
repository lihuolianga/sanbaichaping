# -*- coding: utf-8 -*-
"""案件八 10章阅读长度与口语化(对话)长度统计"""
import os, re, sys

BASE = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\第一卷\案件八 求子符让男人怀孕"
FILES = [
    "第87章 求子符让男人怀孕.md",
    "第88章 祖槐空心写进责任范围.md",
    "第89章 槐荫村地下灵根巢的出口.md",
    "第90章 被涂掉的复诊日再次失控.md",
    "第91章 客户没有说完的话.md",
    "第92章 第一次修补失败.md",
    "第93章 求子符让男人怀孕真正的故障.md",
    "第94章 把祖槐空心变成修补节点.md",
    "第95章 责任不再落给无辜者.md",
    "第96章 木商账册指向下一页.md",
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

def scan_issues(fn):
    """扫描破折号与ASCII半角引号。"""
    p = os.path.join(BASE, fn)
    text = read_utf8(p)
    dash = text.count("——")
    ascii_q = len(re.findall(u'[\u0022\u0027]', text))
    return dash, ascii_q

def main():
    total_chars = 0
    total_dlg = 0
    print("=" * 96)
    print("案件八 阅读长度 / 口语化长度 统计")
    print("=" * 96)
    print(f"{'章节':<32}{'总字数':>7}{'段数':>5}{'对话字数':>8}{'对话占比':>8}{'估计阅读时长'}{'破折号':>6}{'半角引号':>6}")
    print("-" * 96)
    for fn in FILES:
        p = os.path.join(BASE, fn)
        text = read_utf8(p)
        if not text:
            print(fn, "读取失败")
            continue
        lines = text.splitlines()
        body = "\n".join(l for l in lines if not l.startswith("#"))
        chars = len(re.findall(r'[\u4e00-\u9fff0-9A-Za-z]', body))
        paras = len([l for l in body.splitlines() if l.strip()])
        dlg, _ = count_dialogue(body)
        ratio = dlg / chars * 100 if chars else 0
        minutes = chars / 300
        total_chars += chars
        total_dlg += dlg
        name = fn.replace(".md", "")
        dash, aq = scan_issues(fn)
        mm = int(minutes)
        ss = int((minutes - mm) * 60)
        print(f"{name:<34}{chars:>7}{paras:>5}{dlg:>8}{ratio:>7.1f}%{mm:>4}分{ss:>2}秒{dash:>6}{aq:>6}")
    print("-" * 96)
    print(f"合计 10章 总字数:{total_chars}  对话总字数:{total_dlg}  对话占比:{total_dlg/total_chars*100:.1f}%")
    print(f"全案估计阅读时长: {total_chars/300:.1f} 分钟 (按300字/分钟)")

if __name__ == "__main__":
    main()
