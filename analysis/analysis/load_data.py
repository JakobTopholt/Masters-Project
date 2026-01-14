import json
import os
import pandas as pd
import seaborn as sns
import numpy as np
import matplotlib.pyplot as plt
from Levenshtein import distance as levenshtein_distance 

BASE_DIR = os.path.dirname(__file__)
DATA_FOLDER = os.path.join(BASE_DIR, "..", "json-files")
ANALYSIS_DIR = os.path.join(BASE_DIR, "analysis")

excel_file = os.path.join(BASE_DIR, 'mobile_typing_data_clean.xlsx')

files = os.listdir(DATA_FOLDER)

#print("Number of files found:", len(files))
#print("Files:")
#for f in files:
    #print(f)


rows = []

for file_name in files:
    filepath = os.path.join(DATA_FOLDER, file_name)

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

        participant = file_name.split('-')[0].upper()  # normalize IDs
        condition = data['mode'].lower()
        wpm = data['wpm']
        accuracy = float(data['accuracy'])
        errors = data['errors']
        duration = data['duration']
        keylog = data.get('keyLog', [])
    
    row = {
            'participant': participant,
            'condition': condition,
            'wpm': wpm,
            'accuracy': accuracy,
            'errors': errors,
            'duration': duration,
            #'kscp': 0,  # placeholder for now
            'sentences_typed': data['sentencesTyped'],
            'keylog': keylog
    }
    rows.append(row)

df = pd.DataFrame(rows)

# ------------------- REMOVE OUTLIER PARTICIPANTS -------------------
outlier_participants = ['P07', 'P09', 'P19', 'P23']
df = df[~df['participant'].isin(outlier_participants)]

print(f"DataFrame shape: {df.shape}")
print(df.head())

#KSPC - Key Strokes Per Character#
def compute_kspc(keylog, sentences_typed):
    total_keystrokes = len(keylog) if keylog else 0
    total_chars = sum(len(s['typed']) for s in sentences_typed) if sentences_typed else 0
    if total_chars == 0:
        return 0
    return total_keystrokes / total_chars


df['kscp'] = df.apply(lambda row: compute_kspc(row['keylog'], row['sentences_typed']), axis=1)


#MSD Error Rate - Levenshtein distance#
def compute_msd_error_rate(sentences_typed):
    total_distance = 0
    total_chars = 0
    for s in sentences_typed:
        typed = s['typed']
        expected = s['expected']
        dist = levenshtein_distance(typed, expected)
        total_distance += dist
        total_chars += len(expected)
    if total_chars == 0:
        return 0
    return total_distance / total_chars * 100  # as percentage

df['msd_error_rate'] = df['sentences_typed'].apply(compute_msd_error_rate)



#EKS = sum of incorrect fixed (IF) + incorrect not fixed (INF)#
def compute_eks(keylog, sentences_typed):
    # IF: corrected errors (backspaces) — count backspaces in keylog
    if keylog:
        corrected_errors = keylog.count('Backspace')
    else:
        corrected_errors = 0
    
    # INF: remaining errors in final text — use Levenshtein distance
    remaining_errors = compute_msd_error_rate(sentences_typed) / 100 * sum(len(s['expected']) for s in sentences_typed)

    return corrected_errors + remaining_errors

df['eks'] = df.apply(lambda row: compute_eks(row['keylog'], row['sentences_typed']), axis=1)

# Remove temporary columns for export
df_export = df.drop(columns=['sentences_typed', 'keylog'])


# Compute summary statistics per condition
metrics = ['wpm','accuracy','kscp','msd_error_rate','eks']
summary = df_export.groupby('condition')[metrics].agg(['mean','std']).reset_index()



# Flatten MultiIndex columns so Excel can handle it
summary.columns = ['_'.join(col).strip() if type(col) is tuple else col for col in summary.columns]



# Condition mapping (data → plot labels)
condition_map = {
    "stationary": "Sitting",
    "walking": "Walking",
    "stairs": "Stairs"
}

conditions_data = ["stationary", "walking", "upstairs"]
conditions_plot = ["Sitting", "Walking", "Stairs"]
colors = ["#0072B2", "#D55E00", "#009E73"] 

#WPM visualization
# Compute means and stds
means = df_export.groupby('condition')['wpm'].mean()
stds = df_export.groupby('condition')['wpm'].std()

x = np.arange(len(conditions_data))
width = 0.3

plt.figure(figsize=(8,6))

# Bars with ± SD
plt.bar(
    x,
    means[conditions_data],
    yerr=stds[conditions_data],
    capsize=5,
    color=colors,
    edgecolor='black',
    width=width
)

plt.xticks(x, conditions_plot)
plt.title("Typing Speed (WPM) by Condition")
plt.xlabel("Condition")
plt.ylabel("Words per Minute")
plt.ylim(0, max(df_export['wpm']) + 10)  # give some padding on top

# Overlay individual participant points
for i, cond in enumerate(conditions_data):
    y = df_export[df_export['condition'] == cond]['wpm']
    x_jitter = np.random.normal(i, 0.04, size=len(y))
    plt.scatter(x_jitter, y, color='black', alpha=0.7, zorder=3)

plt.tight_layout()
plt.show()


# -------- Accuracy visualization --------

means_acc = df_export.groupby('condition')['accuracy'].mean()
stds_acc = df_export.groupby('condition')['accuracy'].std()

plt.figure(figsize=(8,6))

plt.bar(
    x,
    means_acc[conditions_data],
    yerr=stds_acc[conditions_data],
    capsize=5,
    color=colors,
    edgecolor='black',
    width = width
)

plt.xticks(x, conditions_plot)
plt.title("Typing Accuracy by Condition")
plt.xlabel("Condition")
plt.ylabel("Accuracy (%)")
plt.ylim(0, 100)

# Overlay individual participant points
for i, cond in enumerate(conditions_data):
    y = df_export[df_export['condition'] == cond]['accuracy']
    x_jitter = np.random.normal(i, 0.04, size=len(y))
    plt.scatter(x_jitter, y, color='black', alpha=0.7, zorder=3)

plt.tight_layout()
plt.show()

# -------- KSPC visualization --------

means_kspc = df_export.groupby('condition')['kscp'].mean()
stds_kspc = df_export.groupby('condition')['kscp'].std()

plt.figure(figsize=(8,6))

plt.bar(
    x,
    means_kspc[conditions_data],
    yerr=stds_kspc[conditions_data],
    capsize=5,
    color=colors,
    edgecolor='black',
    width = width
)

plt.xticks(x, conditions_plot)
plt.title("Keystrokes Per Character (KSPC) by Condition")
plt.xlabel("Condition")
plt.ylabel("KSPC")

# Overlay individual participant points
for i, cond in enumerate(conditions_data):
    y = df_export[df_export['condition'] == cond]['kscp']
    x_jitter = np.random.normal(i, 0.04, size=len(y))
    plt.scatter(x_jitter, y, color='black', alpha=0.7, zorder=3)

plt.tight_layout()
plt.show()


# Write raw data and summary statistics to the same Excel file
with pd.ExcelWriter(excel_file, engine='openpyxl') as writer:
    df_export.to_excel(writer, sheet_name='raw_data', index=False)      # raw data sheet
    summary.to_excel(writer, sheet_name='summary_stats', index=False)   # summary stats sheet

print("Raw data and summary statistics exported to Excel successfully!")
