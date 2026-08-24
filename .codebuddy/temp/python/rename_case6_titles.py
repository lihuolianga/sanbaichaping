# -*- coding: utf-8 -*-
import os

base = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"
case_dir = os.path.join(base, "第一卷", "案件六 照真镜拆家")
out = r"C:\Users\Administrator\case6_rename_result.txt"
buf = []

# (旧文件名, 新文件名, 旧标题行, 新标题行)
plans = [
    ("第70章 客户没有说完的话.md", "第70章 第四频：选择.md",
     "# 第70章 客户没有说完的话", "# 第70章 第四频：选择"),
    ("第71章 第一次修补失败.md", "第71章 铜粉倒灌进左臂.md",
     "# 第71章 第一次修补失败", "# 第71章 铜粉倒灌进左臂"),
]

for old_name, new_name, old_title, new_title in plans:
    old_p = os.path.join(case_dir, old_name)
    new_p = os.path.join(case_dir, new_name)
    if not os.path.exists(old_p):
        buf.append(f"!! 文件不存在: {old_name}")
        continue
    text = open(old_p, encoding="utf-8-sig").read()
    if text.startswith(old_title):
        text = text.replace(old_title, new_title, 1)
        open(new_p, "w", encoding="utf-8-sig").write(text)
        os.remove(old_p)
        buf.append(f"OK: {old_name} -> {new_name}（标题已改）")
    else:
        buf.append(f"!! 标题行不匹配: {old_name}")
        buf.append(f"   实际开头: {text.splitlines()[0][:60] if text else '(空)'}")

with open(out, "w", encoding="utf-8") as fo:
    fo.write("\n".join(buf))
print("done")
