# -*- coding: utf-8 -*-
import subprocess, os, sys

tool = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools", "fanqie-publisher-cli"))
script = os.path.join(tool, "batch_upload.js")
start, end, interval = sys.argv[1], sys.argv[2], sys.argv[3]
outlog = os.path.join(tool, "node_stdout.log")
fout = open(outlog, "w", encoding="utf-8")
p = subprocess.Popen(["node", script, start, end, interval], cwd=tool, stdout=fout, stderr=subprocess.STDOUT)
print("launched pid", p.pid)
