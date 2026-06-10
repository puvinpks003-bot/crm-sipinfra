import json
import urllib.request
import urllib.error

data = {
    "name": "arvind",
    "phone": "8997656565",
    "email": "arvind@gmail.com",
    "city": "Mumbai",
    "address": "yyy",
    "pincode": "",
    "kw_size": 50,
    "system_type": "Commercial KW",
    "source": "Google Ad",
    "estimated_value": 2500000,
    "assigned_to_id": 2,
    "status": "New",
    "temperature": "Warm"
}

req = urllib.request.Request(
    'http://localhost:8000/api/leads/',
    data=json.dumps(data).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'Authorization': 'Token bf48817688c234b6bfe9e6eec23dd90d96c9c612' # I will just use no auth if possible, or wait, I need auth!
    }
)

try:
    response = urllib.request.urlopen(req)
    print("Success:", response.read().decode())
except urllib.error.HTTPError as e:
    print("Error:", e.code, e.read().decode())
except Exception as e:
    print("Exception:", e)
