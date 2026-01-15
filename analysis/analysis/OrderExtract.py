import json
import re
from pathlib import Path
import pandas as pd

# Folder containing JSON typing logs
JSON_DIR = Path("data/json")  # adjust if needed

rows = []

# Load and normalize JSON data
for fp in JSON_DIR.rglob("*.json"):
    filename = fp.name

    # Extract participant ID (e.g., P01, P02)
    match = re.search(r"(P\d{2})", filename, re.IGNORECASE)
    participant = match.group(1).upper() if match else "UNKNOWN"

    # Load JSON content
    with open(fp, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Normalize condition labels
    mode_raw = str(data.get("mode", "")).strip().lower()
    if mode_raw in ["stairs", "upstairs"]:
        condition = "stairs"
    elif mode_raw == "walking":
        condition = "walking"
    elif mode_raw in ["stationary", "sitting"]:
        condition = "sitting"
    else:
        condition = mode_raw if mode_raw else "unknown"

    rows.append({
        "file": filename,
        "participant": participant,
        "condition": condition,
        "timestamp": data.get("timestamp"),
        "duration": data.get("duration"),
        "wpm": data.get("wpm"),
        "accuracy": float(data.get("accuracy")) if data.get("accuracy") is not None else None,
        "errors": data.get("errors"),
        "sentencesCompleted": data.get("sentencesCompleted"),
        "totalCharactersTyped": data.get("totalCharactersTyped"),
        "correctCharacters": data.get("correctCharacters"),
    })

df = pd.DataFrame(rows)

# Parse timestamps
df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce", utc=True)

# Compute order of conditions per participant
df = df.sort_values(["participant", "timestamp"]).reset_index(drop=True)
df["order"] = (
    df.groupby("participant")["timestamp"]
      .rank(method="dense")
      .astype("Int64")
)

# Create readable order strings per participant
order_summary = (
    df.sort_values(["participant", "order"])
      .groupby("participant")["condition"]
      .apply(lambda s: " → ".join(s.tolist()))
      .reset_index(name="order_string")
)

print("Order summary per participant:")
print(order_summary.to_string(index=False))

print("\nExtracted data (first 20 rows):")
print(
    df[
        ["participant", "condition", "order", "timestamp", "wpm", "accuracy", "errors"]
    ]
    .head(20)
    .to_string(index=False)
)

# Export results
df.to_csv("extracted_with_order.csv", index=False)
order_summary.to_csv("participant_order_summary.csv", index=False)

print("\nSaved:")
print(" - extracted_with_order.csv")
print(" - participant_order_summary.csv")