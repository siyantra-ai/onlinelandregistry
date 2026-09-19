import json

log_path = r"C:\Users\gkaru\.gemini\antigravity-ide\brain\10d9dd31-163b-4ef3-9552-dc3de38049ba\.system_generated\logs\transcript.jsonl"

steps = {}
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if not line.strip():
            continue
        try:
            obj = json.loads(line)
            step_idx = obj.get("step_index")
            if step_idx is not None:
                steps[step_idx] = obj
        except Exception as e:
            pass

step_obj = steps.get(327)
call = step_obj.get("tool_calls", [])[0]
target = call.get("args", {}).get("TargetContent")
print("Length:", len(target))
print("Starts with quote:", target.startswith('"'))
print("Ends with quote:", target.endswith('"'))
print("First 10 chars:", repr(target[:10]))
print("Last 10 chars:", repr(target[-10:]))
