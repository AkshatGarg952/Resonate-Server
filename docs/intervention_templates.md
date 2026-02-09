# Intervention Templates

These 10 standard templates are used by the AI coach to generate structured interventions.

## 1. Sleep Optimization
**Type:** `sleep`
**Recommendation Pattern:** "Increase sleep duration to {target} hours by inconsistent bedtime routine."
**Rationale:** poor recovery scores, low energy reported
**Target Metric:** `sleep_hours`
**Duration:** 14 days

## 2. Training Volume Adjustment (Deload)
**Type:** `training`
**Recommendation Pattern:** "Reduce training volume by 20% for one week to allow recovery."
**Rationale:** high fatigue, persistent soreness, performance plateau
**Target Metric:** `total_sets`
**Duration:** 7 days

## 3. Nutrition Macro Adjustment (Protein)
**Type:** `nutrition`
**Recommendation Pattern:** "Increase protein intake to {target}g/day to support muscle repair."
**Rationale:** high training intensity but slow recovery/muscle soreness
**Target Metric:** `protein_g`
**Duration:** 30 days

## 4. Stress Management Protocol
**Type:** `stress`
**Recommendation Pattern:** "Practice 10 mins of mindfulness/breathing daily post-workout."
**Rationale:** high stress scores (7+), elevated heart rate
**Target Metric:** `stress_score`
**Duration:** 21 days

## 5. Recovery Protocol (Active Recovery)
**Type:** `recovery`
**Recommendation Pattern:** "Replace one high-intensity session with active recovery (walking/yoga)."
**Rationale:** HRV drop, subjective fatigue
**Target Metric:** `recovery_score`
**Duration:** 14 days

## 6. Hydration Increase
**Type:** `nutrition`
**Recommendation Pattern:** "Drink {target}L of water daily, especially around workouts."
**Rationale:** headaches, fatigue, poor performance
**Target Metric:** `water_l`
**Duration:** 14 days

## 7. Supplement Addition (e.g. Magnesium)
**Type:** `nutrition` (or `supplement`)
**Recommendation Pattern:** "Add Magnesium Glycinate before bed for sleep quality."
**Rationale:** poor sleep quality, muscle cramps
**Target Metric:** `sleep_quality`
**Duration:** 30 days

## 8. Exercise Form Correction
**Type:** `training`
**Recommendation Pattern:** "Focus on tempo (3-1-1) for compound lifts rather than weight."
**Rationale:** minor pains, lack of progress
**Target Metric:** `rpe` (target lower RPE for technical focus)
**Duration:** 14 days

## 9. Meal Timing Adjustment
**Type:** `nutrition`
**Recommendation Pattern:** "Shift majority of carbs to peri-workout window."
**Rationale:** energy crashes during workouts
**Target Metric:** `energy_level`
**Duration:** 21 days

## 10. Cardio Addition
**Type:** `training`
**Recommendation Pattern:** "Add 20 mins low-intensity cardio (Zone 2) on rest days."
**Rationale:** low endurance, high resting heart rate
**Target Metric:** `resting_hr`
**Duration:** 30 days
