with open('c:\\Project\\CRM - solar\\index.html', 'r', encoding='utf-8') as f:
    text = f.read()

import json
print(json.dumps([c for c in text if ord(c) > 127][:20]))
