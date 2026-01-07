import sys
import os
import pandas as pd
import matplotlib.pyplot as plt

# Ensure the project root is on sys.path so we can import config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))

from config import CSV_PATH

# Load the CSV
df = pd.read_csv(CSV_PATH)

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
colors = ["blue", "black", "yellow"]

# Compute means and standard deviations per condition
means = {cond: [] for cond in conditions}
stds = {cond: [] for cond in conditions}

for q, cols in questions.items():
    for i, cond in enumerate(conditions):
        values = df[cols[i]]
        means[cond].append(values.mean())
        stds[cond].append(values.std())

# Plot
import numpy as np

x = np.arange(len(questions))  # positions for groups
width = 0.25  # width of each bar

plt.figure(figsize=(10,6))

for i, cond in enumerate(conditions):
    plt.bar(x + i*width - width, means[cond], width=width, yerr=stds[cond],
            label=cond, color=colors[i], capsize=5)

plt.xticks(x, list(questions.keys()), rotation=45, ha="right")
plt.ylabel("Average Score")
plt.title("NASA-TLX Scores by Question and Condition (± SD)")
plt.legend()
plt.tight_layout()

# Save figure to avoid GUI issues
plt.savefig("tlx_plot.png", dpi=300)
print("Figure saved as tlx_plot.png")
