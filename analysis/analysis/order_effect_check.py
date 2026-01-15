import pandas as pd
import numpy as np

# Optional dependency: Welch’s t-test p-values
try:
    from scipy.stats import ttest_ind
    SCIPY_OK = True
except ImportError:
    SCIPY_OK = False


# =============================
# Configuration
# =============================
INPUT_CSV = "extracted_with_order.csv"
OUTPUT_CSV = "order_effect_summary.csv"


# =============================
# Optional data corrections
# =============================
# Use only if specific trials are known to be mislabeled.
# This avoids editing raw JSON files.

MANUAL_FIX_BY_FILENAME = {
    # "P23-example.json": "walking",
}

MANUAL_FIX_BY_PARTICIPANT_TIMESTAMP = [
    # {"participant": "P23", "timestamp": "2025-12-17 10:12:34+00:00", "condition": "walking"},
]


# =============================
# Helper functions
# =============================
def cohen_d(a, b):
    """Cohen’s d effect size for independent groups."""
    a = np.asarray(a, dtype=float)
    b = np.asarray(b, dtype=float)

    a = a[~np.isnan(a)]
    b = b[~np.isnan(b)]

    if len(a) < 2 or len(b) < 2:
        return np.nan

    s1 = np.var(a, ddof=1)
    s2 = np.var(b, ddof=1)

    pooled_sd = np.sqrt(
        ((len(a) - 1) * s1 + (len(b) - 1) * s2) / (len(a) + len(b) - 2)
    )

    if pooled_sd == 0:
        return np.nan

    return (np.mean(a) - np.mean(b)) / pooled_sd


def summarize_group(df, column):
    """Return n, mean, and standard deviation for a column."""
    values = df[column].astype(float)

    return {
        "n": int(values.notna().sum()),
        "mean": float(values.mean()) if values.notna().any() else np.nan,
        "std": float(values.std(ddof=1)) if values.notna().sum() >= 2 else np.nan,
    }


# =============================
# Main analysis
# =============================
def main():
    df = pd.read_csv(INPUT_CSV)

    # Parse timestamps if present
    if "timestamp" in df.columns:
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce", utc=True)

    # Apply manual fixes (if any)
    if "file" in df.columns and MANUAL_FIX_BY_FILENAME:
        df["condition"] = df.apply(
            lambda r: MANUAL_FIX_BY_FILENAME.get(r["file"], r["condition"]),
            axis=1,
        )

    for fix in MANUAL_FIX_BY_PARTICIPANT_TIMESTAMP:
        mask = (
            (df["participant"] == fix["participant"])
            & (df["timestamp"] == pd.to_datetime(fix["timestamp"], utc=True))
        )
        df.loc[mask, "condition"] = fix["condition"]

    # Keep valid order positions only
    df = df[df["order"].isin([1, 2, 3])].copy()

    # Split first vs last exposure
    first_df = df[df["order"] == 1]
    last_df = df[df["order"] == 3]

    # Consistent condition order
    condition_order = ["sitting", "walking", "stairs"]
    conditions = [c for c in condition_order if c in df["condition"].unique()]

    rows = []

    for cond in conditions:
        g_first = first_df[first_df["condition"] == cond]
        g_last = last_df[last_df["condition"] == cond]

        # ---- WPM ----
        wpm_first = summarize_group(g_first, "wpm")
        wpm_last = summarize_group(g_last, "wpm")
        wpm_diff = wpm_first["mean"] - wpm_last["mean"]
        wpm_d = cohen_d(g_first["wpm"], g_last["wpm"])

        # ---- Accuracy ----
        if "accuracy" in df.columns:
            acc_first = summarize_group(g_first, "accuracy")
            acc_last = summarize_group(g_last, "accuracy")
            acc_diff = acc_first["mean"] - acc_last["mean"]
            acc_d = cohen_d(g_first["accuracy"], g_last["accuracy"])
        else:
            acc_first = acc_last = {"n": 0, "mean": np.nan, "std": np.nan}
            acc_diff = acc_d = np.nan

        # ---- Errors ----
        if "errors" in df.columns:
            err_first = summarize_group(g_first, "errors")
            err_last = summarize_group(g_last, "errors")
            err_diff = err_first["mean"] - err_last["mean"]
            err_d = cohen_d(g_first["errors"], g_last["errors"])
        else:
            err_first = err_last = {"n": 0, "mean": np.nan, "std": np.nan}
            err_diff = err_d = np.nan

        # ---- Welch’s t-tests (optional) ----
        wpm_p = acc_p = err_p = np.nan

        if SCIPY_OK:
            if wpm_first["n"] >= 2 and wpm_last["n"] >= 2:
                wpm_p = ttest_ind(
                    g_first["wpm"], g_last["wpm"], equal_var=False
                ).pvalue

            if acc_first["n"] >= 2 and acc_last["n"] >= 2:
                acc_p = ttest_ind(
                    g_first["accuracy"], g_last["accuracy"], equal_var=False
                ).pvalue

            if err_first["n"] >= 2 and err_last["n"] >= 2:
                err_p = ttest_ind(
                    g_first["errors"], g_last["errors"], equal_var=False
                ).pvalue

        rows.append({
            "condition": cond,

            "first_n": wpm_first["n"],
            "last_n": wpm_last["n"],

            "first_wpm_mean": wpm_first["mean"],
            "last_wpm_mean": wpm_last["mean"],
            "wpm_mean_diff_first_minus_last": wpm_diff,
            "wpm_cohens_d": wpm_d,
            "wpm_pvalue": wpm_p,

            "first_acc_mean": acc_first["mean"],
            "last_acc_mean": acc_last["mean"],
            "acc_mean_diff_first_minus_last": acc_diff,
            "acc_cohens_d": acc_d,
            "acc_pvalue": acc_p,

            "first_err_mean": err_first["mean"],
            "last_err_mean": err_last["mean"],
            "err_mean_diff_first_minus_last": err_diff,
            "err_cohens_d": err_d,
            "err_pvalue": err_p,
        })

    # Save summary
    summary_df = pd.DataFrame(rows)
    summary_df.to_csv(OUTPUT_CSV, index=False)

    print("\n=== Order effect check (FIRST vs LAST) ===")
    print(summary_df.to_string(index=False))
    print(f"\nSaved: {OUTPUT_CSV}")

    # Save participant lists
    plist = []
    for cond in conditions:
        plist.append({
            "condition": cond,
            "first_participants": ", ".join(
                sorted(first_df[first_df["condition"] == cond]["participant"].unique())
            ),
            "last_participants": ", ".join(
                sorted(last_df[last_df["condition"] == cond]["participant"].unique())
            ),
        })

    plist_df = pd.DataFrame(plist)
    plist_df.to_csv("order_effect_participant_lists.csv", index=False)
    print("Saved: order_effect_participant_lists.csv")


if __name__ == "__main__":
    main()