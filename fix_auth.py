import re

with open('c:\\Project\\CRM - solar\\js\\auth.js', 'r', encoding='utf-8') as f:
    text = f.read()

def fix_mojibake(match):
    s = match.group(0)
    try:
        original_bytes = s.encode('cp1252')
        return original_bytes.decode('utf-8')
    except Exception:
        return s

fixed = re.sub(r'[^\x00-\x7F]+', fix_mojibake, text)

with open('c:\\Project\\CRM - solar\\js\\auth.js', 'w', encoding='utf-8') as f:
    f.write(fixed)

print('Python fix executed for auth.js.')
