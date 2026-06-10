import json
with open('c:\\Project\\CRM - solar\\index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()
result = {}
for ln in [22, 58, 67, 108, 129, 153, 203, 211]:
    line = lines[ln-1].strip()[:120]
    result[ln] = [hex(ord(c)) for c in line if ord(c) > 127]
print(json.dumps(result, indent=2))
