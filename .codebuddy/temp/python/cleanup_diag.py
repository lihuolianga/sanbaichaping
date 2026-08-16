# -*- coding: utf-8 -*-
import os

tool = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\.codebuddy\tools\fanqie-publisher-cli"

# 保留的文件（工具本体 + 核心脚本）
keep = {
    "fanqie-publisher.js", "batch_upload.js", "package.json", "package-lock.json",
    "README.md", "番茄发布助手使用手册.md", ".gitignore", "web-server.js",
    "fanqie.config.example.json", "番茄发布助手使用说明.txt",
}

removed = []
for f in sorted(os.listdir(tool)):
    p = os.path.join(tool, f)
    if f in keep:
        continue
    if f.startswith(".") and f in (".fanqie-browser-profile", ".git", ".fanqie-runs"):
        continue
    if os.path.isdir(p):
        if f in ("node_modules", "chapters", "scripts", "prompts", "public", ".fanqie-browser-profile", ".fanqie-runs"):
            continue
        continue
    # 删除诊断脚本和截图（.js 和 .png，除了 keep 里的）
    try:
        os.remove(p)
        removed.append(f)
    except OSError:
        pass

print("已删除临时文件", len(removed), "个:")
for f in removed:
    print("  ", f)

print("\n保留文件:")
for f in sorted(os.listdir(tool)):
    print("  ", f)

os.remove(__file__)
