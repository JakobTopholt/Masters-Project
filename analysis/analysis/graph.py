import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

df = pd.read_csv("order_effect_summary.csv")

# Force the correct order AND reset the index so 0,1,2 matches positions
order = ["sitting", "walking", "stairs"]
df = df.set_index("condition").reindex(order).reset_index()

conditions = df["condition"].tolist()
first = df["first_wpm_mean"].to_numpy()
last  = df["last_wpm_mean"].to_numpy()

x = np.arange(len(conditions))
width = 0.35

colors = {
    "sitting": "#1f77b4",  # blue
    "walking": "#ff7f0e",  # orange
    "stairs":  "#2ca02c"   # green
}

plt.figure(figsize=(6,4))

for i, condition in enumerate(conditions):
    # First exposure (lighter)
    plt.bar(
        x[i] - width/2,
        first[i],
        width,
        color=colors[condition],
        alpha=0.6,
        label="First" if i == 0 else ""
    )

    # Last exposure (darker)
    plt.bar(
        x[i] + width/2,
        last[i],
        width,
        color=colors[condition],
        alpha=1.0,
        label="Last" if i == 0 else ""
    )


plt.xticks(x, conditions)
plt.xlabel("Conditions")
plt.ylabel("WPM")
plt.title("Learning effect on WPM (First vs Last exposure)")
plt.legend()
plt.tight_layout()
plt.savefig("wpm_learning_first_vs_last.png", dpi=300)
plt.show()