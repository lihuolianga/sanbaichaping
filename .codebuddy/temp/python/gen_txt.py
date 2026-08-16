# -*- coding: utf-8 -*-
"""只生成指定章节范围的 txt（不调用上传），供后台批量上传使用。
用法: python gen_txt.py <起始章> <结束章>
"""
import os, re, sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WS = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))
TOOL = os.path.join(WS, ".codebuddy", "tools", "fanqie-publisher-cli")
CHAPTERS_DIR = os.path.join(TOOL, "chapters")
SKIP_DIRS = {".codebuddy", ".git", "_版本归档", "正文备份_不计入正文", "案件提示词", "优化提示词"}


def find_chapter_files(start, end):
    found = {}
    for dirpath, dirs, files in os.walk(WS):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if not f.endswith(".md"):
                continue
            m = re.match(r"第(\d+)章", f)
            if m:
                n = int(m.group(1))
                if start <= n <= end and n not in found:
                    found[n] = os.path.join(dirpath, f)
    return found


def md_to_txt(md_path, n):
    raw = open(md_path, encoding="utf-8-sig").read()
    lines = raw.split("\n")
    first = lines[0].strip().lstrip("#").strip()
    body = "\n".join(lines[1:]).replace("**", "").strip()
    out = first + "\n\n" + body + "\n"
    outname = "{:03d}-{}.txt".format(n, first)
    with open(os.path.join(CHAPTERS_DIR, outname), "w", encoding="utf-8") as w:
        w.write(out)
    return outname, len(body), body.count("——")


def main():
    if len(sys.argv) < 3:
        print("用法: python gen_txt.py <起始章> <结束章>")
        sys.exit(1)
    start, end = int(sys.argv[1]), int(sys.argv[2])

    os.makedirs(CHAPTERS_DIR, exist_ok=True)
    # 清空 chapters（但保留其他章的 txt 不影响，这里只清空当前范围的）
    found = find_chapter_files(start, end)
    missing = [n for n in range(start, end + 1) if n not in found]
    if missing:
        print("缺失章节:", missing)
        sys.exit(2)

    print("生成 {} 章 txt...".format(len(found)))
    for n in sorted(found):
        outname, chars, dash = md_to_txt(found[n], n)
        flag = " [破折号{}处]".format(dash) if dash else ""
        print("  第{}章 -> {} ({}字符{})".format(n, outname, chars, flag))
    print("完成，chapters 目录现有:")
    for f in sorted(os.listdir(CHAPTERS_DIR)):
        print("  ", f)


if __name__ == "__main__":
    main()
