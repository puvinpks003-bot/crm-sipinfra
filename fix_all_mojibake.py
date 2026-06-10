import sys, os
os.environ['PYTHONIOENCODING'] = 'utf-8'

with open('c:\\Project\\CRM - solar\\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

count = 0

replacements = [
    ('\u00e2\u02dc\u20ac\ufe0f', '\u2600\ufe0f'),
    ('\u00e2\u02dc\u20ac', '\u2600'),
    ('\u00e2\u0153\u2030\ufe0f', '\u2709\ufe0f'),
    ('\u00e2\u0153\u2030', '\u2709'),
    ('\u00f0\u0178\u2018\u0081', '\U0001f441'),
    ('\u00f0\u0178\u201d\u008d', '\U0001f50d'),
    ('\u00e2\u0161\u2122\ufe0f', '\u2699\ufe0f'),
    ('\u00e2\u0161\u2122', '\u2699'),
]

for bad, good in replacements:
    if bad in text:
        text = text.replace(bad, good)
        count += 1

with open('c:\\Project\\CRM - solar\\index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print(f'Fixed {count} mojibake patterns.')
