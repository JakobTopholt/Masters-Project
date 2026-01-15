import pandas as pd
import numpy as np

# =========================
# Configuration / Inputs
# =========================
# Input file exported from the preprocessing pipeline.
FILE = "mobile_typing_data_clean.xlsx"    # Use an absolute path if required.

# Worksheet containing trial-level observations.
SHEET = "raw_data"

# Dependent variable to analyse (examples: "wpm", "accuracy", "kspc", "msd_error_rate", "eks").
DV = "wpm"

# =========================
# Load and prepare data
# =========================
df = pd.read_excel(FILE, sheet_name=SHEET)

# Standardise column names to simplify downstream handling.
df.columns = [str(c).strip().lower() for c in df.columns]

# Normalise common column-name variants across datasets.
rename_map = {
    "subject": "participant",
    "participant_id": "participant",
    "cond": "condition",
}
df = df.rename(columns={k: v for k, v in rename_map.items() if k in df.columns})

# Verify required columns exist.
required = {"participant", "condition", DV}
missing = required - set(df.columns)
if missing:
    raise ValueError(
        f"Missing required columns: {missing}. "
        f"Available columns: {list(df.columns)}"
    )

# Clean condition labels and apply consistent naming conventions.
df["condition"] = df["condition"].astype(str).str.strip().str.lower()
df["condition"] = df["condition"].replace({
    "sitting": "stationary",
    "stairs": "upstairs",
})

# Convert DV to numeric (supports comma decimals such as '82,4').
def to_numeric(series):
    s = series.astype(str).str.replace(",", ".", regex=False)
    return pd.to_numeric(s, errors="coerce")

df[DV] = to_numeric(df[DV])

# Remove rows with missing DV/condition/participant values.
df = df.dropna(subset=[DV, "participant", "condition"])

# Retain only the three target conditions used in the repeated-measures design.
conds = ["stationary", "walking", "upstairs"]
print("Conditions used (order):", conds)
df = df[df["condition"].isin(conds)]

# Repeated-measures ANOVA requires participants with observations in all within-subject conditions.
counts = df.groupby("participant")["condition"].nunique()
complete_participants = counts[counts == len(conds)].index
df_complete = df[df["participant"].isin(complete_participants)].copy()

print(f"DV = {DV}")
print(f"Participants total: {df['participant'].nunique()}")
print(f"Participants with all conditions: {df_complete['participant'].nunique()}")
print("Rows used:", len(df_complete))

# Descriptive statistics per condition.
desc = df_complete.groupby("condition")[DV].agg(["mean", "std", "count"])
print("\nDescriptives:")
print(desc)

# =========================
# Repeated-measures ANOVA
# =========================
# Primary option: pingouin (includes sphericity testing and convenient post-hocs).
# Fallback: statsmodels (RM ANOVA) + paired t-tests with Holm correction.

try:
    import pingouin as pg

    print("\n--- Repeated-measures ANOVA (pingouin) ---")
    aov = pg.rm_anova(
        data=df_complete,
        dv=DV,
        within="condition",
        subject="participant",
        detailed=True
    )
    print(aov)

    # Mauchly’s test of sphericity (plus epsilon estimates for corrections).
    print("\n--- Sphericity (Mauchly) ---")
    sph = pg.sphericity(df_complete, dv=DV, subject="participant", within="condition")
    print("Sphericity result:", sph)  # (W, pval, spher, epsGG, epsHF)

    # Pairwise within-subject comparisons with Holm correction.
    print("\n--- Post-hoc paired t-tests (Holm corrected) ---")
    posthoc = pg.pairwise_ttests(
        data=df_complete,
        dv=DV,
        within="condition",
        subject="participant",
        padjust="holm",
        effsize="cohen",
        parametric=True
    )
    print(posthoc[["A", "B", "T", "dof", "p-corr", "cohen-d"]])

except ImportError:
    print("\nPingouin not installed. Falling back to statsmodels.")
    from statsmodels.stats.anova import AnovaRM

    print("\n--- Repeated-measures ANOVA (statsmodels) ---")
    aovrm = AnovaRM(df_complete, depvar=DV, subject="participant", within=["condition"]).fit()
    print(aovrm)

    # Post-hoc paired t-tests with Holm correction.
    from scipy.stats import ttest_rel

    print("\n--- Post-hoc paired t-tests (Holm corrected) ---")
    pivot = df_complete.pivot(index="participant", columns="condition", values=DV)

    pairs = [("stationary", "walking"), ("stationary", "upstairs"), ("walking", "upstairs")]
    results = []
    for a, b in pairs:
        t, p = ttest_rel(pivot[a], pivot[b], nan_policy="omit")
        results.append((a, b, t, p))

    # Holm step-down correction.
    ps = np.array([r[3] for r in results])
    order = np.argsort(ps)
    m = len(ps)
    adj = np.empty(m)

    for i, idx in enumerate(order):
        adj[idx] = min((m - i) * ps[idx], 1.0)

    # Enforce monotonicity of adjusted p-values.
    for i in range(1, m):
        prev = order[i - 1]
        curr = order[i]
        adj[curr] = max(adj[curr], adj[prev])

    for (a, b, t, p), p_adj in zip(results, adj):
        print(f"{a} vs {b}: t={t:.3f}, p={p:.4g}, p_holm={p_adj:.4g}")