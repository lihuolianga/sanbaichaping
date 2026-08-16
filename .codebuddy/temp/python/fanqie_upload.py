# -*- coding: utf-8 -*-
"""番茄小说草稿上传助手（永久工具）

功能：把指定章节范围的正文 md 转成 txt，并调用 batch_upload.js 上传到番茄草稿箱。
用法：python fanqie_upload.py <起始章> <结束章> [间隔秒，默认60]
示例：python fanqie_upload.py 40 47 60
"""
import os, re, sys, subprocess

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
        print("用法: python fanqie_upload.py <起始章> <结束章> [间隔秒]")
        sys.exit(1)
    start = int(sys.argv[1])
    end = int(sys.argv[2])
    interval = int(sys.argv[3]) if len(sys.argv) > 3 else 60

    os.makedirs(CHAPTERS_DIR, exist_ok=True)
    for f in os.listdir(CHAPTERS_DIR):
        os.remove(os.path.join(CHAPTERS_DIR, f))

    found = find_chapter_files(start, end)
    missing = [n for n in range(start, end + 1) if n not in found]
    if missing:
        print("缺失章节(未找到对应md):", missing)
        sys.exit(2)

    print("找到 {} 章，生成 txt...".format(len(found)))
    for n in sorted(found):
        outname, chars, dash = md_to_txt(found[n], n)
        flag = " [破折号{}处]".format(dash) if dash else ""
        print("  第{}章 -> {} ({}字符{})".format(n, outname, chars, flag))

    script = os.path.join(TOOL, "batch_upload.js")
    print("调用 batch_upload.js 上传 第{}-{}章，间隔{}秒...".format(start, end, interval))
    r = subprocess.run(
        ["node", script, str(start), str(end), str(interval)],
        cwd=TOOL, capture_output=True, text=True, encoding="utf-8", errors="replace",
    )
    if r.stdout:
        print(r.stdout)
    if r.stderr:
        print("STDERR:", r.stderr)
    print("EXIT", r.returncode)


if __name__ == "__main__":
    main()
