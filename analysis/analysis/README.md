{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # Mobile Typing Study Analysis\
\
This folder contains scripts used to extract, clean, and analyse data from the mobile typing study.\
\
## Data overview\
\
Each participant completed typing trials across three motion conditions:\
\
- sitting (stationary)\
- walking\
- stairs (upstairs)\
\
Each trial is stored as a JSON file and includes metrics such as WPM, accuracy, errors, duration, and a timestamp. Some trials also include typed vs expected text and keystroke logs used to compute derived error metrics.\
\
## Key outputs\
\
The scripts generate the following main outputs used for statistics and figures:\
\
- `mobile_typing_data_clean.xlsx`  \
  Cleaned dataset exported from JSON logs (includes a raw-data sheet and summary statistics).\
\
- `extracted_with_order.csv`  \
  Trial-level table extracted from JSON logs, including timestamp-based order information.\
\
- `participant_order_summary.csv`  \
  Condition order per participant (e.g., sitting \uc0\u8594  walking \u8594  stairs).\
\
- `order_effect_summary.csv`  \
  Summary table comparing FIRST vs LAST occurrence per condition (order/learning effect check).\
\
- `order_effect_participant_lists.csv`  \
  Participant lists per condition for FIRST vs LAST occurrence (useful for auditing).\
\
- `wpm_learning_first_vs_last.png`  \
  Figure showing WPM for first vs last exposure per condition (used in the report).\
\
## Script overview\
\
### Data extraction and cleaning\
- `load_data.py`  \
  Loads JSON logs, computes derived metrics (e.g., KSPC, MSD error rate, EKS), and exports:\
  - `mobile_typing_data_clean.xlsx` (raw data + summary stats)\
\
### Condition order reconstruction\
- `OrderExtract.py`  \
  Reads JSON timestamps, reconstructs within-participant condition order, and exports:\
  - `extracted_with_order.csv`\
  - `participant_order_summary.csv`\
\
### Order / learning effect checks\
- `order_effect_check.py`  \
  Compares FIRST vs LAST exposure per condition and exports:\
  - `order_effect_summary.csv`\
  - `order_effect_participant_lists.csv`  \
  Optional: Welch\'92s t-test p-values if SciPy is available.\
\
- `order_effect_followup_walking_after_sitting.py`  \
  Compares walking WPM between participants who completed sitting first vs walking first.\
  Optional: Welch\'92s t-test if SciPy is available.\
\
### Plotting\
- `graph2.py`  \
  Generates `wpm_learning_first_vs_last.png` using trial-level data from `extracted_with_order.csv`,\
  including confidence intervals and participant dots.\
\
### NASA-TLX analysis\
- `tlx_analysis.py`  \
  Computes means and 95% confidence intervals for TLX items per condition and generates a plot.\
\
## Dependencies\
\
Recommended: Python 3.10+\
\
Install dependencies:\
\
```bash\
pip install pandas numpy scipy matplotlib openpyxl python-Levenshtein}