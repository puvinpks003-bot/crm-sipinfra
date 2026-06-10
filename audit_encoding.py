import os, re, json

js_dir = 'c:\\Project\\CRM - solar\\js'
issues = []

for fname in os.listdir(js_dir):
    if not fname.endswith('.js'):
        continue
    fpath = os.path.join(js_dir, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for i, line in enumerate(lines, 1):
        # Check for mojibake patterns (cp1252-mangled UTF-8)
        if re.search(r'[\xc0-\xff][\x80-\xbf]', line):
            issues.append({'file': fname, 'line': i, 'type': 'mojibake', 'snippet': line.strip()[:80]})
        # Check for control characters (SUB \x1a, DC2 \x12, etc)
        ctrl = re.findall(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', line)
        if ctrl:
            issues.append({'file': fname, 'line': i, 'type': 'control_char', 'chars': [hex(ord(c)) for c in ctrl], 'snippet': line.strip()[:80]})

# Also check index.html
with open('c:\\Project\\CRM - solar\\index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines, 1):
    if re.search(r'[\xc0-\xff][\x80-\xbf]', line):
        issues.append({'file': 'index.html', 'line': i, 'type': 'mojibake', 'snippet': line.strip()[:100]})
    ctrl = re.findall(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', line)
    if ctrl:
        issues.append({'file': 'index.html', 'line': i, 'type': 'control_char', 'chars': [hex(ord(c)) for c in ctrl], 'snippet': line.strip()[:100]})

print(json.dumps(issues, indent=2))
print(f'\nTotal issues: {len(issues)}')
