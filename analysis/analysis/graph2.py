import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Plot WPM learning / order effect:
# Compare the first exposure (order == 1) vs the last exposure (order == 3)
# within each condition. Uses trial-level data to support error bars and per-participant dots.

rng = np.random.default_rng(42)  # reproducible jitter for scatter points

# Load trial-level data (one row per participant-condition trial)
df = pd.read_csv("extracted_with_order.csv")

# Normalize condition labels used across files / logs to consistent paper labels
condition_map = {
    "stationary": "sitting",
    "walking": "walking",
    "upstairs": "stairs",
    "stairs": "stairs",
    "sitting": "sitting",
}

df["condition"] = df["condition"].str.lower().replace(condition_map)

# Keep only target conditions used in the analysis
order = ["sitting", "walking", "stairs"]
df = df[df["condition"].isin(order)].copy()

# Condition color palette (matches other figures)
colors = {
    "sitting": "#1f77b4",
    "walking": "#ff7f0e",
    "stairs":  "#2ca02c",
}

# Define "first" vs "last" exposure groups based on counterbalanced task order positions
first_df = df[df["order"] == 1]
last_df  = df[df["order"] == 3]

def mean_ci(values, conf=0.95):
    """
    Returns: mean, CI_half_width (t-based), n
    CI is computed as mean ± t * (sd/sqrt(n)).
    """
    values = np.asarray(values, dtype=float)
    n = len(values)
    mean = values.mean()
    if n <= 1:
        return mean, 0.0, n
    sd = values.std(ddof=1)
    tcrit = stats.t.ppf((1 + conf) / 2, df=n - 1)
    ci = tcrit * sd / np.sqrt(n)
    return mean, ci, n

# Prepare plot
x = np.arange(len(order))
width = 0.35
plt.figure(figsize=(6, 4))

for i, cond in enumerate(order):
    v_first = first_df.loc[first_df["condition"] == cond, "wpm"].dropna()
    v_last  = last_df.loc[last_df["condition"] == cond, "wpm"].dropna()

    m1, ci1, n1 = mean_ci(v_first)
    m2, ci2, n2 = mean_ci(v_last)

    # Bars with 95% CI error bars
    plt.bar(
        x[i] - width/2, m1, width,
        color=colors[cond], alpha=0.6,
        yerr=ci1, capsize=4,
        label="First" if i == 0 else ""
    )
    plt.bar(
        x[i] + width/2, m2, width,
        color=colors[cond], alpha=1.0,
        yerr=ci2, capsize=4,
        label="Last" if i == 0 else ""
    )

    # Participant-level points (jittered horizontally to reduce overlap)
    jitter_first = (rng.random(len(v_first)) - 0.5) * 0.10
    plt.scatter(
        np.full(len(v_first), x[i] - width/2) + jitter_first,
        v_first, s=18, color="black", alpha=0.8
    )

    jitter_last = (rng.random(len(v_last)) - 0.5) * 0.10
    plt.scatter(
        np.full(len(v_last), x[i] + width/2) + jitter_last,
        v_last, s=18, color="black", alpha=0.8
    )

plt.xticks(x, order)
plt.xlabel("Conditions")
plt.ylabel("WPM")
plt.title("Learning effect on WPM (First vs Last exposure)")
plt.legend()
plt.tight_layout()
plt.savefig("wpm_learning_first_vs_last.png", dpi=300)
plt.show()