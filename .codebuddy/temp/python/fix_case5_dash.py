# -*- coding: utf-8 -*-
import os

root = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
case5 = os.path.join(root, "第一卷", "案件五 替死纸人拒绝替死")

# 每章的替换列表（old -> new），用较长的上下文确保唯一
repls = {
    58: [
        ("生辰——它替的不是", "生辰：它替的不是"),
        ("切过——他以为归鹤", "切过，他以为归鹤"),
    ],
    61: [
        ("家人了——从她被", "家人了，从她被"),
    ],
    62: [
        ("纸料毁——残根里", "纸料毁：残根里"),
        ("写的——他拆了顶针", "写的：他拆了顶针"),
        ("木头——不是偷", "木头，不是偷"),
        ("因果线上——儿子血里", "因果线上：儿子血里"),
        ("不可逆转，除非——", "不可逆转，除非……"),
        ("封印——归鹤在赵少衡", "封印：归鹤在赵少衡"),
        ("事物——因果簿上", "事物：因果簿上"),
    ],
    63: [
        ("其他记录——同一枚九环空心印", "其他记录：同一枚九环空心印"),
    ],
    65: [
        ("待注销——这些不是", "待注销，这些不是"),
        ("添了一栏——", "添了一栏："),
    ],
}

for n, pairs in repls.items():
    fname = None
    for f in os.listdir(case5):
        if f.startswith("第{}章".format(n)) and f.endswith(".md"):
            fname = f
            break
    if not fname:
        print("第{}章 未找到文件".format(n))
        continue

    p = os.path.join(case5, fname)
    data = open(p, "rb").read()
    has_bom = data.startswith(b"\xef\xbb\xbf")
    text = data.decode("utf-8-sig")

    before = text.count("——")
    missing = []
    for old, new in pairs:
        if old in text:
            text = text.replace(old, new, 1)
        else:
            missing.append(old)

    after = text.count("——")
    # 写回
    if has_bom:
        open(p, "wb").write(b"\xef\xbb\xbf" + text.encode("utf-8"))
    else:
        open(p, "w", encoding="utf-8").write(text)

    print("第{}章: 破折号 {} -> {}".format(n, before, after))
    if missing:
        print("  未匹配: {}".format(missing))
