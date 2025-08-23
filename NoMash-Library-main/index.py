import json

def handler(event, context):
    try:
        if isinstance(event, (bytes, bytearray)):
            event = event.decode('utf-8', errors='ignore')
        if isinstance(event, str) and event.strip():
            payload = json.loads(event)
        else:
            payload = {}

        data = payload.get("data", payload)
        books = data.get("books", [])
        return json.dumps({"bookCount": len(books), "ok": True}, ensure_ascii=False)
    except Exception as e:
        return json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False)
