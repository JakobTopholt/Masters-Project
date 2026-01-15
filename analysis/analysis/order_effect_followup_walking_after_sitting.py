import pandas as pd

# Optional: statistical test (requires SciPy). Summary outputs still run without SciPy.
try:
    from scipy.stats import ttest_ind
    SCIPY_OK = True
except ImportError:
    SCIPY_OK = False

# ---- 1) Load files ----
order_df = pd.read_csv("participant_order_summary.csv")  # columns: participant, order_string
wpm_df = pd.read_excel("mobile_typing_data_clean.xlsx")  # columns include: participant, condition, wpm

# Standardize column names
order_df.columns = [c.strip().lower() for c in order_df.columns]
wpm_df.columns = [c.strip().lower() for c in wpm_df.columns]

# Standardize participant IDs for reliable matching
order_df["participant"] = order_df["participant"].astype(str).str.strip().str.upper()
wpm_df["participant"] = wpm_df["participant"].astype(str).str.strip().str.upper()

# ---- 2) Extract first condition from order_string ----
# Supports both "→" and "->"
order_df["first_condition_raw"] = (
    order_df["order_string"]
    .astype(str)
    .str.replace("→", "->")
    .str.split("->")
    .str[0]
    .str.strip()
    .str.lower()
)

# Map order_string naming -> dataset naming
condition_map = {
    "sitting": "stationary",
    "stairs": "upstairs",
    "walking": "walking",
}
order_df["first_condition"] = order_df["first_condition_raw"].map(condition_map)

# Report any unmapped labels (data check)
unmapped = order_df[order_df["first_condition"].isna()][["participant", "first_condition_raw"]]
if len(unmapped) > 0:
    print("WARNING: Some first conditions could not be mapped:")
    print(unmapped.to_string(index=False))

# ---- 3) Grab walking WPM per participant ----
# If multiple walking rows exist per participant, average them.
walking_wpm = (
    wpm_df[wpm_df["condition"].astype(str).str.lower().str.strip() == "walking"]
    .groupby("participant")["wpm"]
    .mean()
)

# ---- 4) Create the two groups ----
sitting_first_ids = order_df.loc[order_df["first_condition"] == "stationary", "participant"]
walking_first_ids = order_df.loc[order_df["first_condition"] == "walking", "participant"]

walking_after_sitting = walking_wpm[walking_wpm.index.isin(sitting_first_ids)].dropna()
walking_as_first = walking_wpm[walking_wpm.index.isin(walking_first_ids)].dropna()

# ---- 5) Print summary ----
print("\n--- Walking WPM (by first condition in the sequence) ---")
print(f"Walking-after-sitting group (n={len(walking_after_sitting)}): mean={walking_after_sitting.mean():.2f}, sd={walking_after_sitting.std(ddof=1):.2f}")
print(f"Walking-as-first group      (n={len(walking_as_first)}): mean={walking_as_first.mean():.2f}, sd={walking_as_first.std(ddof=1):.2f}")

# ---- 6) (Optional) quick test ----
if SCIPY_OK and len(walking_after_sitting) >= 2 and len(walking_as_first) >= 2:
    t, p = ttest_ind(walking_after_sitting, walking_as_first, equal_var=False, nan_policy="omit")
    print(f"\nWelch t-test: t={t:.3f}, p={p:.3f}")
else:
    print("\nNot running t-test (SciPy missing or groups too small).")