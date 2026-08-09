import re, sys, glob, os

def count_cn(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    lines = content.split('\n')
    lines = [l for l in lines if not l.strip().startswith('#')]
    body = '\n'.join(lines)
    cn = re.findall(r'[\u4e00-\u9fff]', body)
    return len(cn)

if __name__ == '__main__':
    files = sorted(glob.glob('第四卷/第68*.md') + glob.glob('第四卷/第69*.md') + glob.glob('第四卷/第70*.md'))
    sel = []
    for f in files:
        m = re.search(r'第(\d+)章', f)
        if m and 688 <= int(m.group(1)) <= 701:
            sel.append(f)
    sel.sort()
    ok = True
    for f in sel:
        n = count_cn(f)
        status = 'OK' if 2200 <= n <= 2800 else ('SHORT' if n < 2200 else 'LONG')
        if status != 'OK':
            ok = False
        print(f'{os.path.basename(f)}: {n}字 [{status}]')
    print('---')
    print('ALL PASS' if ok else 'HAS PROBLEM')
