# -*- coding: utf-8 -*-
"""git add -A / commit / push（push 跳过系统代理）"""
import subprocess, sys

CWD = r"e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评"

def run(args):
    r = subprocess.run(args, cwd=CWD, capture_output=True)
    out = r.stdout.decode("utf-8", errors="replace")
    err = r.stderr.decode("utf-8", errors="replace")
    print(f"$ {' '.join(args)}")
    if out.strip(): print(out)
    if err.strip(): print("ERR:", err)
    return r.returncode

# 1. add 全部
code = run(["git", "add", "-A"])
if code != 0:
    sys.exit("add 失败")

# 2. 查看暂存摘要
run(["git", "status", "--short"])

# 3. commit
commit_msg = "案件七《镇水符让河神失业》优化+发布：修复76-86章破折号与对话占比，5章标题去重改名，上传草稿并按每天3章定时发布完成"
code = run(["git", "commit", "-m", commit_msg])
if code != 0:
    sys.exit("commit 失败")

# 4. push（跳过系统代理）
code = run(["git", "push", "--config", "http.proxy=", "--config", "https.proxy=", "origin", "main"])
if code != 0:
    print("push 返回码:", code)
