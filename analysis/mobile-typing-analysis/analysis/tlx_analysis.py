import sys
import os
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Add project root to sys.path to find config.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from config import CSV_PATH

# Load CSV
df = pd.read_csv(CSV_PATH)

def get_next_filename(base_name="tlx_plot", ext=".png"):
    if not os.path.exists(f"{base_name}{ext}"):
        return f"{base_name}{ext}"

    i = 1
    while os.path.exists(f"{base_name}_{i}{ext}"):
        i += 1

    return f"{base_name}_{i}{ext}"

# Define question groups and their conditions
questions = {
    "Mental Demand": ["Mental Demand Sitting", "Mental Demand Walking", "Mental Demand Stairs"],
    "Physical Demand": ["Physical Demand Sitting", "Physical Demand Walking", "Physical Demand Stairs"],
    "Temporal Demand": ["Temporal Demand Sitting", "Temporal Demand Walking", "Temporal Demand Stairs"],
    "Performance": ["Performance Sitting", "Performance Walking", "Performance Stairs"],
    "Effort": ["Effort Sitting", "Effort Walking", "Effort Stairs"],
    "Frustration": ["Frustration Sitting", "Frustration Walking", "Frustration Stairs"]
}

conditions = ["Sitting", "Walking", "Stairs"]

# High-contrast, colorblind-friendly colors
colors = ["#0072B2", "#D55E00", "#009E73"]  # Blue, Vermillion, Green

# Compute means and margin of error (95% confidence)
means = {cond: [] for cond in conditions}
moes = {cond: [] for cond in conditions}

for q, cols in questions.items():
    for i, cond in enumerate(conditions):
        values = df[cols[i]]
        n = len(values)
        mean = values.mean()
        std = values.std(ddof=1)
        t_critical = stats.t.ppf(0.95, df=n-1)  # 95% CI
        moe = t_critical * std / np.sqrt(n)

        means[cond].append(mean)
        moes[cond].append(moe)

for qi, q in enumerate(questions.keys()):
    print(f"{q}:")
    for cond in conditions:
        mean = means[cond][qi]
        moe = moes[cond][qi]
        print(f"  {cond}: {mean:.2f} ± {moe:.2f}")
    print()


# Plot
x = np.arange(len(questions))  # positions for groups
width = 0.25  # width of each bar

plt.figure(figsize=(12, 6))

for i, cond in enumerate(conditions):
    plt.bar(
        x + (i-1)*width,  # center bars around tick
        means[cond],
        width=width,
        yerr=moes[cond],
        label=cond,
        color=colors[i],
        capsize=5
    )

plt.xticks(x, list(questions.keys()), rotation=45, ha="right")
plt.ylabel("Average Score")
plt.title("NASA-TLX Scores by Question and Condition (± 95% Margin of Error)")
plt.legend(title="Condition")
plt.tight_layout()

# Save figure
output_file = get_next_filename()
plt.savefig(output_file, dpi=300)
print(f"Figure saved as {output_file}")

