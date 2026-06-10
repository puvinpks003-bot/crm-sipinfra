with open('c:\\Project\\CRM - solar\\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix the specific mojibake patterns:
# The issue is partial decode: base emoji + garbled \xef\xb8\x8f variation selector
# Pattern: base_char + \u00ef\u00b8\u008f  (cp1252 decode of \xef\xb8\x8f)
import re

# These are the exact byte sequences we need to fix
# \xc3\xa2\xc2\x98\xe2\x82\xac\xc3\xaf\xc2\xb8\xc2\x8f = corrupted sun emoji
# But actually looking at repr output, the chars are partially decoded already
# Let me just replace the specific broken patterns

# The pattern is: good_char + \xef\xb8\x8f mangled as cp1252
# In the file, it shows as e.g. \u2600 + \ufeff + \x8f or similar

# Let me do targeted string replacements on the actual broken content
replacements = {
    '\u2600\ufffd\x8f': '\u2600\ufe0f',    # ☀️ (sun emoji)
    '\u2709\ufffd\x8f': '\u2709\ufe0f',    # ✉️ (envelope emoji) 
    '\u2699\ufffd\x8f': '\u2699\ufe0f',    # ⚙️ (gear emoji)
}

for bad, good in replacements.items():
    text = text.replace(bad, good)

# Also check for the raw bytes pattern
# \xef\xb8\x8f encoded as cp1252 gives \u00ef\u00b8\u008f
text = text.replace('\u00ef\u00b8\u008f', '\ufe0f')

with open('c:\\Project\\CRM - solar\\index.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('Fixed index.html mojibake.')
