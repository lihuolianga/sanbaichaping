# -*- coding: utf-8 -*-
"""案件八 md 转番茄发布 txt：第一行"第X章 标题"，空行，正文。去掉markdown加粗等。
附带标题重复检测：对照番茄侧已知标题库（29-65章）+ 案件7改名后的标题。"""
import os, re, glob, io, sys

SRC = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\第一卷\案件八 求子符让男人怀孕"
OUT = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\.codebuddy\tools\fanqie-publisher-cli\chapters"

# 番茄侧已知标题库（来自 case6_title_check.py + 案件7改名记录）
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
    76: "镇水符让河神失业", 77: "堵在河底的祈愿纸", 78: "沅河古堤的出口", 79: "三份证词都是真话",
    80: "河神破裂的金身", 81: "鱼牙上刻着此处应停", 82: "水位碑锁住了手动节点", 83: "方案纸撕成四块",
    84: "镇水符让河神失业真正的故障", 85: "柳小满的名字上了水位碑", 86: "泄洪名单指向下一页",
}

def read_utf8(p):
    for enc in ("utf-8-sig", "utf-8"):
        try:
            with open(p, "r", encoding=enc) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
    return ""

def to_txt(fn):
    md = read_utf8(os.path.join(SRC, fn))
    lines = md.splitlines()
    title_line = ""
    for l in lines:
        if l.startswith("#"):
            title_line = l.lstrip("#").strip()
            break
    body_lines = [l for l in lines if not l.startswith("#")]
    body = "\n".join(body_lines).strip()
    body = re.sub(r"\*\*([^*]+)\*\*", r"\1", body)
    body = re.sub(r"\*([^*]+)\*", r"\1", body)
    body = body.replace("**", "")
    m = re.match(r"第\s*(\d+)\s*章\s*[:：、.\-\s]*(.*)$", title_line)
    if not m:
        fm = re.match(r"第\s*(\d+)\s*章\s*[:：、.\-\s]*(.+)\.md", fn)
        m = fm
    no = m.group(1)
    title = m.group(2).strip()
    out_name = f"{int(no):03d}-第{no}章 {title}.txt"
    content = f"第{no}章 {title}\n\n{body}\n"
    with open(os.path.join(OUT, out_name), "w", encoding="utf-8") as f:
        f.write(content)
    # 标题重复检测
    dup = []
    for tno, tt in tomato_titles.items():
        if title == tt:
            dup.append(f"第{tno}章「{tt}」完全重复")
        elif len(tt) >= 6 and (tt in title or title in tt):
            dup.append(f"第{tno}章「{tt}」部分重叠")
    chars = len(re.findall(r"[\u4e00-\u9fff0-9A-Za-z]", body))
    return out_name, chars, dup

def main():
    files = sorted(glob.glob(os.path.join(SRC, "*.md")))
    total = 0
    for f in files:
        fn = os.path.basename(f)
        out_name, chars, dup = to_txt(fn)
        flag = "  !!! " + " | ".join(dup) if dup else ""
        print(f"{fn} -> {out_name}  正文{chars}字符{flag}")
        total += chars
    print(f"共 {len(files)} 章，正文合计 {total} 字符")

if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    main()
