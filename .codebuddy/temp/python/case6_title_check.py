# -*- coding: utf-8 -*-
import os, re

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
case_dir = os.path.join(base, "第一卷", "案件六 照真镜拆家")
out = r"C:\Users\Administrator\case6_title_check.txt"
buf = []

tomato_titles = {
    29: "陆承药与万应楼抢先动手", 30: "这次不能只听李无咎的", 31: "照真镜", 32: "责任不再落给无辜者",
    40: "第二个受害者", 41: "客户没有说完的话", 42: "第一次修补失败", 43: "先动手的人",
    44: "让她知道外面有人等", 45: "新娘影中哭声真正的故障", 46: "十二个名字归位", 47: "绣楼封死的窗指向下一页",
    48: "聚财阵只招耗子", 49: "先看临水县东市的出口", 50: "灶台下反向阵眼再次失控",
    51: "欠薪木牌上的七个名字", 52: "撕毁十四条保养券", 53: "钱有余与万应楼抢先动手",
    54: "聚财阵只招耗子真正的故障", 55: "自己的债自己还", 56: "伙计的欠薪木牌指向下一页",
    57: "替死纸人拒绝替死", 58: "祠堂里还有第七块牌位", 59: "槐树下不是一个空匣子",
    60: "替死契背面有个童名", 61: "纸灰里的名字浮起来又沉下去", 62: "赵少衡抢先了一步",
    63: "纸骨上刻的是不可续用", 64: "替死契解除单上只有苏舟的名字", 65: "纸匠铺火盆指向下一页",
}

files = sorted([f for f in os.listdir(case_dir) if f.endswith(".md")])
for f in files:
    p = os.path.join(case_dir, f)
    t = open(p, encoding="utf-8-sig", errors="replace").read()
    m = re.search(r"^#\s*(.+)$", t, re.M)
    title = m.group(1).strip() if m else f
    # 去掉"第X章"前缀
    pure = re.sub(r"^第\d+章\s*", "", title)
    # 去掉"："后的副标题（如"照真镜拆家：差评上门"只保留主标题）
    buf.append(f"{f}")
    buf.append(f"   主标题: {pure}")
    for no, tt in tomato_titles.items():
        if pure == tt:
            buf.append(f"   !!! 与番茄侧第{no}章「{tt}」完全重复")
    # 部分匹配提示（长度>=5的相同子串）
    for no, tt in tomato_titles.items():
        if len(tt) >= 6 and pure != tt and (tt in pure or pure in tt):
            buf.append(f"   ~ 部分重叠: 番茄侧第{no}章「{tt}」")

with open(out, "w", encoding="utf-8") as fo:
    fo.write("\n".join(buf))
print("written", out)
