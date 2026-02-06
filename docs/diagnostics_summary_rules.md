# Diagnostics Summary Rules

This document outlines the rules for extracting key information from diagnostic reports (Blood, BCA, CGM) to be stored in the Mem0 memory layer.

## 1. Blood Reports

### Principle
Store only **key biomarkers** and **abnormal values**. Do not dump the entire report.

### Key Biomarkers to Always Track
Regardless of whether they are normal or not, always extract:
- **HbA1c** (Metabolic health)
- **Vitamin D** (Common deficiency)
- **LDL Cholesterol** (Heart health)
- **hsCRP** (Inflammation)
- **Thyroid Panel (TSH)**

### Abnormal Values
Any marker with `status` not equal to "normal" (e.g., "high", "low", "critical") MUST be included.

### Trend Detection
If a `previous_value` is available:
- Calculcate direction (↑ or ↓).
- Include in the memory text.

### Text Format
`Blood Test [DATE]: [Marker] [Value] [Unit] ([Status]) ([Trend])`

## 2. Body Composition Analysis (BCA)

### Principle
Store the macro-level indicators of body composition changes.

### Metrics to Track
- **Weight** (kg)
- **Body Fat Percentage** (%)
- **Muscle Mass** (kg)
- **Visceral Fat Level** (Score)

### Text Format
`BCA: Weight [Val]kg, Body Fat [Val]%, Muscle Mass [Val]kg, Visceral Fat Level [Val]`

## 3. Continuous Glucose Monitoring (CGM)

### Principle
CGM data is high-frequency (every 15 mins). We cannot store every point. We store specific **patterns/summaries**.

### Metrics to Track
- **Average Glucose** (mg/dL)
- **Time in Range** (%) - (70-140 mg/dL)
- **Spike Count** (Number of times > 140 mg/dL post-meal)
- **Fasting Glucose** (mg/dL)

### Text Format
`CGM Pattern: [Description of key insights, e.g., "Spikes after dinner"]`
