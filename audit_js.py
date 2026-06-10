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
        # Check for double-question-mark emoji corruption (??)
        if '??' in line and not line.strip().startswith('//'):
            # Skip if it's in a comment or actually part of code logic
            if "icon:" in line or "showToast" in line or "innerHTML" in line or "return" in line or '' in line or "'" in line:
                # check if ?? is inside a string
                if re.search(r"['\x60].*\?\?.*['\x60]", line) or re.search(r'".*\?\?.*"', line):
                    issues.append({'file': fname, 'line': i, 'type': 'double_question', 'snippet': line.strip()[:100]})

# Check for SUB character \x1a in the files
for fname in os.listdir(js_dir):
    if not fname.endswith('.js'):
        continue
    fpath = os.path.join(js_dir, fname)
    with open(fpath, 'rb') as f:
        content = f.read()
    for i, pos in enumerate(re.finditer(b'\x1a', content)):
        # Get line number
        line_num = content[:pos.start()].count(b'\n') + 1
        line_content = content[content.rfind(b'\n', 0, pos.start())+1:content.find(b'\n', pos.start())].decode('utf-8', errors='replace')
        issues.append({'file': fname, 'line': line_num, 'type': 'SUB_char', 'snippet': line_content.strip()[:100]})

print(json.dumps(issues, indent=2))
print(f'\nTotal issues: {len(issues)}')
