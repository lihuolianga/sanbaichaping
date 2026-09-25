# -*- coding: utf-8 -*-
"""案件九：ASCII 直引号 -> 全角弯引号（按段落配对，嵌套对用单层弯引号），保留 BOM。"""
import os, io

D = r'e:\Users\Administrator\Documents\资料\小说\师父飞升后留下三百个差评\第一卷\案件九 灵剑认仇家为主'
ODD = []

def convert_paragraph(p):
    # 双引号配对
    pos = [i for i, ch in enumerate(p) if ch == '"']
    if pos:
        if len(pos) % 2 != 0:
            ODD.append(p[:40])
            return p
        pairs = [(pos[i], pos[i + 1]) for i in range(0, len(pos), 2)]
        chars = list(p)
        for idx, (s, e) in enumerate(pairs):
            nested = any(qs < s and qe > e for qs, qe in pairs if (qs, qe) != (s, e))
            chars[s], chars[e] = ('\u2018', '\u2019') if nested else ('\u201c', '\u201d')
        p = ''.join(chars)
    # 单引号配对
    pos = [i for i, ch in enumerate(p) if ch == "'"]
    if pos:
        if len(pos) % 2 != 0:
            ODD.append('SQ:' + p[:40])
            return p
        chars = list(p)
        for k, i in enumerate(pos):
            chars[i] = '\u2018' if k % 2 == 0 else '\u2019'
        p = ''.join(chars)
    return p

for f in sorted(os.listdir(D)):
    if not f.endswith('.md'):
        continue
    path = os.path.join(D, f)
    raw = open(path, 'rb').read()
    bom = raw.startswith(b'\xef\xbb\xbf')
    t = raw.decode('utf-8-sig')
    lines = t.split('\n')
    lines = [convert_paragraph(ln) for ln in lines]
    out = '\n'.join(lines)
    with open(path, 'wb') as fh:
        fh.write(out.encode('utf-8-sig' if bom else 'utf-8'))
    print(f, 'BOM' if bom else 'nobom', 'dq_now=', out.count('\u201c'), 'odd_quotes_pending')

print('ODD PARAGRAPHS:', ODD if ODD else 'none')
