import re

with open('c:\\Project\\CRM - solar\\index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Lines with mojibake: 22, 58, 108, 153, 211
for ln in [22, 58, 108, 153, 211]:
    line = lines[ln-1]
    print(f'Line {ln}: ', repr(line.strip()))
