# -*- coding: utf-8 -*-
import os, re, glob

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"

vols = ["第一卷","第二卷","第三卷","第四卷","第五卷","第六卷",
        "第七卷","第八卷","第九卷","第十卷","第十一卷","第十二卷"]

count = 0
skipped = 0
errors = []
samples = []

for v in vols:
    d = os.path.join(base, v)
    if not os.path.isdir(d):
        continue
    for case_dir in sorted(os.listdir(d)):
        cp = os.path.join(d, case_dir)
        if not os.path.isdir(cp):
            continue
        for f in glob.glob(os.path.join(cp, "*.md")):
            name = os.path.basename(f)
            # 从正文首行提取全局章号（utf-8-sig 自动去除 BOM）
            with open(f, encoding="utf-8-sig") as fh:
                first = fh.readline().strip()
            gm = re.match(r'^#\s*第(\d+)章', first)
            if not gm:
                errors.append((v, case_dir, name, "首行无全局章号: " + first[:40]))
                continue
            gnum = int(gm.group(1))
            # 从当前文件名提取标题（文件名内字符必为合法字符）
            tm = re.match(r'^第[^\s]+章\s+(.+)\.md$', name)
            if not tm:
                errors.append((v, case_dir, name, "文件名无法解析"))
                continue
            title = tm.group(1)
            newname = f"第{gnum}章 {title}.md"
            if newname == name:
                skipped += 1
                continue
            newpath = os.path.join(cp, newname)
            if os.path.exists(newpath):
                errors.append((v, case_dir, name, "目标已存在: " + newname))
                continue
            os.rename(f, newpath)
            count += 1
            if len(samples) < 25:
                samples.append(f"{case_dir}/{name}\n    -> {newname}")

print(f"重命名成功: {count}")
print(f"已正确跳过: {skipped}")
print(f"错误: {len(errors)}")
print("=" * 70)
for s in samples:
    print(s)
print("=" * 70)
for e in errors:
    print("错误:", e)
