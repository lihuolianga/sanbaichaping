# -*- coding: utf-8 -*-
import os, re

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
case_dir = os.path.join(base, "第一卷", "案件六 照真镜拆家")
out = r"C:\Users\Administrator\case6_scan.txt"
buf = []

files = sorted([f for f in os.listdir(case_dir) if f.endswith(".md")])
buf.append(f"案件六共 {len(files)} 个文件\n")

all_titles = []
for f in files:
    p = os.path.join(case_dir, f)
    t = open(p, encoding="utf-8-sig", errors="replace").read()
    # 标题：第一个 # 行
    m = re.search(r"^#\s*(.+)$", t, re.M)
    title = m.group(1).strip() if m else f
    # 破折号
    dashes = t.count("——")
    # 字数（正文汉字，去掉标题行）
    body = re.sub(r"^#.*$", "", t, flags=re.M)
    han = len(re.findall(r"[\u4e00-\u9fff]", body))
    buf.append(f"{f} | 标题: {title} | 破折号: {dashes}处 | 汉字: {han}")
    all_titles.append((f, title, dashes))

# 标题重复检测（全文内+与番茄侧已发布的对比）
buf.append("\n=== 番茄侧已发布/待发布章节标题（第29-65章，从历史记忆整理） ===")
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
for f, title, dashes in all_titles:
    for no, tt in tomato_titles.items():
        if title == tt:
            buf.append(f"!! 标题重复: {f} 的标题「{title}」与番茄侧第{no}章「{tt}」完全相同")

with open(out, "w", encoding="utf-8") as fo:
    fo.write("\n".join(buf))
print("written", out)
