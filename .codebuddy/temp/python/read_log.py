# -*- coding: utf-8 -*-
import os, time, sys
tool = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "fanqie-publisher-cli"))
log = os.path.join(tool, "batch_log.txt")
wait = int(sys.argv[1]) if len(sys.argv) > 1 else 0
time.sleep(wait)
if os.path.exists(log):
    print(open(log, encoding="utf-8").read())
else:
    print("(日志未生成)")
