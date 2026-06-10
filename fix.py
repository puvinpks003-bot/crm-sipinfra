import re

with open('c:\\Project\\CRM - solar\\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# The characters were originally UTF-8, but were read as cp1252 and written as utf-8.
# So they are literally the utf-8 encoding of the cp1252 decoding of the original utf-8 bytes.
def fix_mojibake(match):
    s = match.group(0)
    try:
        # Revert the mangling
        original_bytes = s.encode('cp1252')
        return original_bytes.decode('utf-8')
    except Exception:
        return s

fixed = re.sub(r'[^\x00-\x7F]+', fix_mojibake, text)

with open('c:\\Project\\CRM - solar\\index.html', 'w', encoding='utf-8') as f:
    f.write(fixed)

print('Python fix executed.')
