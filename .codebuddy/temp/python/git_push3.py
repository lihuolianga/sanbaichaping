# -*- coding: utf-8 -*-
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

run(["git", "add", "-A"])
code = run(["git", "commit", "-m", "记录案件七发布与git提交推送经验到工作记忆"])
if code != 0:
    print("commit 返回码:", code)
    sys.exit(0)
run(["git", "-c", "http.proxy=", "-c", "https.proxy=", "push", "origin", "main"])
