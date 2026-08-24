# -*- coding: utf-8 -*-
"""案件七 md 转番茄发布 txt：第一行"第X章 标题"，空行，正文。去掉markdown加粗等。"""
import os, re, glob

SRC = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\第一卷\案件七 镇水符让河神失业"
OUT = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\.codebuddy\tools\fanqie-publisher-cli\chapters"

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
    # 第一行标题
    title_line = ""
    for l in lines:
        if l.startswith("#"):
            title_line = l.lstrip("#").strip()
            break
    # 去掉 markdown 标记
    body_lines = [l for l in lines if not l.startswith("#")]
    body = "\n".join(body_lines).strip()
    # 去掉 ** 加粗、* 斜体等
    body = re.sub(r"\*\*([^*]+)\*\*", r"\1", body)
    body = re.sub(r"\*([^*]+)\*", r"\1", body)
    body = body.replace("**", "")
    # 章节号提取
    m = re.match(r"第\s*(\d+)\s*章\s*[:：、.\-\s]*(.*)$", title_line)
    if not m:
        # 从文件名提取
        fm = re.match(r"第\s*(\d+)\s*章\s*[:：、.\-\s]*(.+)\.md", fn)
        m = fm
    no = m.group(1)
    title = m.group(2).strip()
    out_name = f"{int(no):03d}-第{no}章 {title}.txt"
    content = f"第{no}章 {title}\n\n{body}\n"
    with open(os.path.join(OUT, out_name), "w", encoding="utf-8") as f:
        f.write(content)
    # 统计
    chars = len(re.findall(r"[\u4e00-\u9fff0-9A-Za-z]", body))
    return out_name, chars

def main():
    files = sorted(glob.glob(os.path.join(SRC, "*.md")))
    total = 0
    for f in files:
        fn = os.path.basename(f)
        out_name, chars = to_txt(fn)
        print(f"{fn} -> {out_name}  正文{chars}字符")
        total += chars
    print(f"共 {len(files)} 章，正文合计 {total} 字符")

if __name__ == "__main__":
    main()
