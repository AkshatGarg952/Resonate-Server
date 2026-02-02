# Resonate Health - Memory Schema & Taxonomy

## Overview

This document defines the complete memory structure for Resonate Health's AI-powered personalization system. Every piece of user data that gets stored in Mem0 must follow this schema to ensure consistency, searchability, and effective AI context injection.

## Core Principles

1. **Single Category Rule**: Every memory belongs to exactly ONE category
2. **Metadata Consistency**: All memories follow the same metadata contract
3. **Compact Text**: Memory text is human-readable summaries, not raw data dumps
4. **Searchability First**: Text should be optimized for semantic search
5. **Source Tracking**: Always track where data originated

---

## Memory Categories

### 1. `fitness.training`
**Purpose**: Track workout sessions, exercises, volume, intensity, and training patterns

**What to Store**:
- Completed workouts with exercises, sets, reps
- Training intensity (RPE - Rate of Perceived Exertion)
- Workout duration and calories burned
- Energy levels during training
- Workout type (push, pull, legs, cardio, etc.)

**What NOT to Store**:
- Individual set-by-set details (store summary only)
- Real-time heart rate data (use diagnostics.cgm for continuous data)

---

### 2. `nutrition.intake`
**Purpose**: Track meals, calories, macros, and dietary adherence

**What to Store**:
- Meal logs with approximate calories and macros
- Meal type (breakfast, lunch, dinner, snack)
- Plan adherence (yes/no)
- Food preferences and patterns
- Dietary restrictions

**What NOT to Store**:
- Exact ingredient lists (store summary)
- Recipe details (store outcome only)

---

### 3. `recovery.sleep`
**Purpose**: Track sleep hours, quality, patterns, and sleep-related metrics

**What to Store**:
- Sleep duration (hours)
- Sleep quality score (1-10)
- Sleep interruptions/wake-ups
- Sleep timing (bedtime, wake time)
- Sleep stages (if available from devices)

**What NOT to Store**:
- Minute-by-minute sleep data (store summary)

---

### 4. `recovery.stress`
**Purpose**: Track stress levels, fatigue, soreness, and recovery status

**What to Store**:
- Stress score (1-10, self-reported)
- Fatigue levels
- Muscle soreness (location + severity)
- Recovery readiness
- Mental state

**What NOT to Store**:
- Continuous stress monitoring data (store daily summaries)

---

### 5. `diagnostics.blood`
**Purpose**: Track blood test results and key biomarkers

**What to Store**:
- Key biomarker values (LDL, HDL, HbA1c, Vitamin D, etc.)
- Changes from previous tests (↑ or ↓)
- Test date
- Normal/abnormal flags
- Summary of findings

**What NOT to Store**:
- Complete PDF reports (store in database, not memory)
- Every single biomarker (focus on key markers)

---

### 6. `diagnostics.bca`
**Purpose**: Track body composition analysis results

**What to Store**:
- Weight, body fat percentage
- Muscle mass, bone mass
- Visceral fat level
- Changes from previous scans
- Measurement date

**What NOT to Store**:
- Detailed segmental analysis (store summary)

---

### 7. `diagnostics.cgm`
**Purpose**: Track continuous glucose monitoring patterns and insights

**What to Store**:
- Glucose pattern summaries (fasting, post-meal)
- Average glucose levels
- Spike triggers (food, timing)
- Time in range percentages
- Pattern insights

**What NOT to Store**:
- Every glucose reading (store patterns and insights)

---

### 8. `intervention.plan`
**Purpose**: Track AI recommendations and interventions given to users

**What to Store**:
- Recommendation text
- Rationale (why this intervention)
- Start date and duration
- Target metric and target value
- Status (active, completed, abandoned)

**What NOT to Store**:
- Implementation details (store outcome only)

---

### 9. `intervention.outcome`
**Purpose**: Track results and effectiveness of interventions

**What to Store**:
- Intervention reference
- Outcome summary (did it work?)
- Metric changes (before/after)
- User feedback
- Completion date

**What NOT to Store**:
- Daily progress logs (store final outcome)

---

## Memory Source Types

Every memory must specify its source:

| Source Type | Description | Confidence Score |
|------------|-------------|------------------|
| `user_input` | Manual entry by user | 0.95 |
| `coach_input` | Entered by coach/admin | 0.95 |
| `device_sync` | From wearables/devices | 0.90 |
| `lab_import` | From diagnostic labs | 1.0 |
| `system_generated` | AI-generated insights | 0.80 |

---

## Metadata Standard

Every memory MUST include this metadata structure:

```json
{
  "timestamp": "2026-01-31T10:30:00Z",
  "timezone": "Asia/Kolkata",
  "category": "fitness.training",
  "source": "user_input",
  "confidence": 0.95,
  "tags": ["push-day", "high-intensity"],
  "module_specific": {
    // Category-specific fields
  }
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | ISO 8601 | Yes | When the event occurred |
| `timezone` | String | Yes | User's timezone |
| `category` | String | Yes | One of the 9 categories |
| `source` | String | Yes | One of the 5 source types |
| `confidence` | Float | Yes | 0.0 to 1.0 |
| `tags` | Array | No | Searchable tags |
| `module_specific` | Object | Yes | Category-specific data |

---

## Category-Specific Examples

### Example 1: `fitness.training` - High Intensity Push Day

**Memory Text**:
```
Completed Push Day: 18 sets, 52 mins, RPE 8, energy 6/10. 
Exercises: Bench Press 4x8 (80kg), Overhead Press 3x10 (50kg), Dips 3x12 (bodyweight), Cable Flyes 4x15.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-31T07:30:00Z",
  "timezone": "Asia/Kolkata",
  "category": "fitness.training",
  "source": "user_input",
  "confidence": 0.95,
  "tags": ["push-day", "high-intensity", "chest", "shoulders"],
  "module_specific": {
    "workout_type": "push",
    "total_sets": 18,
    "duration_mins": 52,
    "rpe": 8,
    "energy_level": 6,
    "calories_burned": 320,
    "exercises": ["bench_press", "overhead_press", "dips", "cable_flyes"]
  }
}
```

---

### Example 2: `fitness.training` - Deload Leg Day

**Memory Text**:
```
Deload Leg Day: 12 sets, 38 mins, RPE 5, energy 7/10. 
Reduced volume by 30% due to fatigue. Exercises: Squats 3x8 (60kg), Leg Press 3x10, Leg Curls 3x12.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-30T18:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "fitness.training",
  "source": "user_input",
  "confidence": 0.95,
  "tags": ["leg-day", "deload", "recovery"],
  "module_specific": {
    "workout_type": "legs",
    "total_sets": 12,
    "duration_mins": 38,
    "rpe": 5,
    "energy_level": 7,
    "calories_burned": 210,
    "is_deload": true,
    "exercises": ["squats", "leg_press", "leg_curls"]
  }
}
```

---

### Example 3: `fitness.training` - Cardio Session

**Memory Text**:
```
Cardio: 30 min treadmill run, moderate intensity, RPE 6, energy 8/10. 
Average pace 6:30/km, heart rate avg 145 bpm.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-29T06:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "fitness.training",
  "source": "device_sync",
  "confidence": 0.90,
  "tags": ["cardio", "running", "moderate-intensity"],
  "module_specific": {
    "workout_type": "cardio",
    "activity": "running",
    "duration_mins": 30,
    "rpe": 6,
    "energy_level": 8,
    "calories_burned": 280,
    "avg_heart_rate": 145,
    "avg_pace_min_per_km": 6.5
  }
}
```

---

### Example 4: `nutrition.intake` - High Protein Lunch

**Memory Text**:
```
Lunch: Grilled chicken salad with quinoa, 520 cal (42g protein, 35g carbs, 22g fat). 
Adhered to meal plan. Felt satisfied for 4 hours.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-31T13:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "nutrition.intake",
  "source": "user_input",
  "confidence": 0.95,
  "tags": ["lunch", "high-protein", "plan-adherence"],
  "module_specific": {
    "meal_type": "lunch",
    "calories": 520,
    "protein_g": 42,
    "carbs_g": 35,
    "fat_g": 22,
    "plan_adherence": true,
    "satiety_hours": 4,
    "main_ingredients": ["chicken", "quinoa", "vegetables"]
  }
}
```

---

### Example 5: `nutrition.intake` - Off-Plan Dinner

**Memory Text**:
```
Dinner: Pizza and ice cream, approx 1200 cal (30g protein, 140g carbs, 55g fat). 
Did not adhere to plan. Social event with friends.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-30T20:30:00Z",
  "timezone": "Asia/Kolkata",
  "category": "nutrition.intake",
  "source": "user_input",
  "confidence": 0.85,
  "tags": ["dinner", "off-plan", "social"],
  "module_specific": {
    "meal_type": "dinner",
    "calories": 1200,
    "protein_g": 30,
    "carbs_g": 140,
    "fat_g": 55,
    "plan_adherence": false,
    "reason": "social_event",
    "main_ingredients": ["pizza", "ice_cream"]
  }
}
```

---

### Example 6: `recovery.sleep` - Good Sleep Night

**Memory Text**:
```
Sleep: 7h 30m, quality 8/10, no interruptions. 
Bedtime 10:30 PM, woke up 6:00 AM feeling refreshed.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-31T06:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "recovery.sleep",
  "source": "device_sync",
  "confidence": 0.90,
  "tags": ["good-sleep", "refreshed"],
  "module_specific": {
    "hours": 7.5,
    "quality_score": 8,
    "interruptions": 0,
    "bedtime": "22:30",
    "wake_time": "06:00",
    "deep_sleep_hours": 2.1,
    "rem_sleep_hours": 1.8,
    "light_sleep_hours": 3.6
  }
}
```

---

### Example 7: `recovery.sleep` - Poor Sleep Night

**Memory Text**:
```
Sleep: 5h 20m, quality 4/10, woke up 3 times. 
Bedtime 11:45 PM, woke up 5:05 AM feeling tired. High stress from work.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-30T05:05:00Z",
  "timezone": "Asia/Kolkata",
  "category": "recovery.sleep",
  "source": "device_sync",
  "confidence": 0.90,
  "tags": ["poor-sleep", "stressed", "tired"],
  "module_specific": {
    "hours": 5.33,
    "quality_score": 4,
    "interruptions": 3,
    "bedtime": "23:45",
    "wake_time": "05:05",
    "deep_sleep_hours": 0.8,
    "rem_sleep_hours": 1.2,
    "light_sleep_hours": 3.33,
    "stress_factor": "work"
  }
}
```

---

### Example 8: `recovery.stress` - High Stress Day

**Memory Text**:
```
Stress level 8/10, high fatigue, legs sore from yesterday's workout. 
Mental state: anxious about work deadline. Recovery readiness: low.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-31T09:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "recovery.stress",
  "source": "user_input",
  "confidence": 0.95,
  "tags": ["high-stress", "fatigue", "soreness"],
  "module_specific": {
    "stress_score": 8,
    "fatigue_level": "high",
    "soreness_areas": ["legs", "glutes"],
    "soreness_severity": 7,
    "mental_state": "anxious",
    "recovery_readiness": "low",
    "stress_source": "work"
  }
}
```

---

### Example 9: `recovery.stress` - Low Stress Day

**Memory Text**:
```
Stress level 3/10, low fatigue, no soreness. 
Mental state: calm and focused. Recovery readiness: high. Good day overall.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-29T09:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "recovery.stress",
  "source": "user_input",
  "confidence": 0.95,
  "tags": ["low-stress", "recovered"],
  "module_specific": {
    "stress_score": 3,
    "fatigue_level": "low",
    "soreness_areas": [],
    "soreness_severity": 0,
    "mental_state": "calm",
    "recovery_readiness": "high"
  }
}
```

---

### Example 10: `diagnostics.blood` - Quarterly Blood Test

**Memory Text**:
```
Blood Test (Q1 2026): LDL 148 mg/dL (↑ from 135), HDL 52 mg/dL (stable), 
HbA1c 5.8% (normal), Vitamin D 22 ng/mL (low, ↓ from 28), TSH 2.1 mIU/L (normal).
```

**Metadata**:
```json
{
  "timestamp": "2026-01-28T00:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "diagnostics.blood",
  "source": "lab_import",
  "confidence": 1.0,
  "tags": ["quarterly-test", "ldl-elevated", "vitamin-d-low"],
  "module_specific": {
    "test_date": "2026-01-28",
    "ldl_mg_dl": 148,
    "ldl_change": "increased",
    "hdl_mg_dl": 52,
    "hba1c_percent": 5.8,
    "vitamin_d_ng_ml": 22,
    "vitamin_d_status": "low",
    "tsh_miu_l": 2.1,
    "previous_test_date": "2025-10-28"
  }
}
```

---

### Example 11: `diagnostics.blood` - Follow-up Test

**Memory Text**:
```
Blood Test Follow-up: LDL 138 mg/dL (↓ from 148, improving), Vitamin D 32 ng/mL (↑ from 22, now normal). 
Supplementation working.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-31T00:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "diagnostics.blood",
  "source": "lab_import",
  "confidence": 1.0,
  "tags": ["follow-up", "improvement", "vitamin-d-normalized"],
  "module_specific": {
    "test_date": "2026-01-31",
    "test_type": "follow_up",
    "ldl_mg_dl": 138,
    "ldl_change": "decreased",
    "vitamin_d_ng_ml": 32,
    "vitamin_d_status": "normal",
    "intervention_effective": true,
    "previous_test_date": "2026-01-28"
  }
}
```

---

### Example 12: `diagnostics.bca` - Body Composition Scan

**Memory Text**:
```
BCA Scan: Weight 91kg (↑ 2kg from last scan), Body Fat 28% (↓ 1%), 
Muscle Mass 62kg (↑ 1.5kg), Visceral Fat Level 12 (stable). Good progress.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-30T00:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "diagnostics.bca",
  "source": "device_sync",
  "confidence": 0.90,
  "tags": ["bca-scan", "muscle-gain", "fat-loss"],
  "module_specific": {
    "scan_date": "2026-01-30",
    "weight_kg": 91,
    "weight_change_kg": 2,
    "body_fat_percent": 28,
    "body_fat_change": -1,
    "muscle_mass_kg": 62,
    "muscle_mass_change_kg": 1.5,
    "visceral_fat_level": 12,
    "bone_mass_kg": 3.2,
    "previous_scan_date": "2025-12-30"
  }
}
```

---

### Example 13: `diagnostics.cgm` - Glucose Pattern Insight

**Memory Text**:
```
CGM Pattern (Week 4): Fasting glucose avg 95 mg/dL (normal). 
Post-meal spikes after high-carb dinner (avg 165 mg/dL at 9 PM). 
Time in range: 78%. Recommendation: reduce dinner carbs.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-31T00:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "diagnostics.cgm",
  "source": "device_sync",
  "confidence": 0.90,
  "tags": ["cgm-weekly", "post-meal-spike", "dinner"],
  "module_specific": {
    "period": "week",
    "fasting_avg_mg_dl": 95,
    "post_meal_avg_mg_dl": 165,
    "post_meal_timing": "21:00",
    "time_in_range_percent": 78,
    "spike_trigger": "high_carb_dinner",
    "recommendation": "reduce_dinner_carbs"
  }
}
```

---

### Example 14: `intervention.plan` - Sleep Optimization

**Memory Text**:
```
Intervention: Increase sleep to 7-8h by going to bed at 10 PM (started 2026-02-01, 14-day trial). 
Reason: Sleep avg 5h 50m over last 7 days, affecting recovery and training performance.
```

**Metadata**:
```json
{
  "timestamp": "2026-02-01T00:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "intervention.plan",
  "source": "system_generated",
  "confidence": 0.80,
  "tags": ["sleep-optimization", "active"],
  "module_specific": {
    "intervention_type": "sleep",
    "recommendation": "Increase sleep to 7-8h by going to bed at 10 PM",
    "rationale": "Sleep avg 5h 50m over last 7 days, affecting recovery",
    "start_date": "2026-02-01",
    "duration_days": 14,
    "target_metric": "sleep_hours",
    "target_value": 7.5,
    "status": "active"
  }
}
```

---

### Example 15: `intervention.plan` - Protein Increase

**Memory Text**:
```
Intervention: Increase protein to 180g/day (from 150g) for 21 days (started 2026-01-20). 
Reason: High training intensity (avg RPE 8) and 85% compliance with current plan.
```

**Metadata**:
```json
{
  "timestamp": "2026-01-20T00:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "intervention.plan",
  "source": "system_generated",
  "confidence": 0.80,
  "tags": ["nutrition-optimization", "protein", "active"],
  "module_specific": {
    "intervention_type": "nutrition",
    "recommendation": "Increase protein to 180g/day",
    "rationale": "High training intensity and good compliance",
    "start_date": "2026-01-20",
    "duration_days": 21,
    "target_metric": "protein_g",
    "target_value": 180,
    "previous_value": 150,
    "status": "active"
  }
}
```

---

### Example 16: `intervention.outcome` - Sleep Intervention Success

**Memory Text**:
```
Outcome: Sleep intervention (2026-02-01 to 2026-02-15) SUCCESSFUL. 
Sleep improved to 7h 15m avg (+1h 25m from baseline). Energy levels increased from 6/10 to 8/10. 
Training RPE maintained at 8 with better recovery.
```

**Metadata**:
```json
{
  "timestamp": "2026-02-15T00:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "intervention.outcome",
  "source": "system_generated",
  "confidence": 0.85,
  "tags": ["sleep-intervention", "successful"],
  "module_specific": {
    "intervention_id": "sleep-opt-20260201",
    "intervention_type": "sleep",
    "outcome": "successful",
    "baseline_value": 5.83,
    "final_value": 7.25,
    "improvement": 1.42,
    "secondary_improvements": {
      "energy_level": { "before": 6, "after": 8 },
      "recovery": "improved"
    },
    "user_feedback": "positive",
    "completion_date": "2026-02-15"
  }
}
```

---

### Example 17: `intervention.outcome` - Training Volume Reduction

**Memory Text**:
```
Outcome: Training volume reduction (2026-01-25 to 2026-02-01) PARTIALLY SUCCESSFUL. 
Reduced volume by 20%, stress decreased from 8/10 to 6/10, but strength slightly declined. 
Recommendation: gradual return to normal volume.
```

**Metadata**:
```json
{
  "timestamp": "2026-02-01T00:00:00Z",
  "timezone": "Asia/Kolkata",
  "category": "intervention.outcome",
  "source": "system_generated",
  "confidence": 0.85,
  "tags": ["training-intervention", "partial-success"],
  "module_specific": {
    "intervention_id": "volume-reduce-20260125",
    "intervention_type": "training",
    "outcome": "partial_success",
    "volume_reduction_percent": 20,
    "stress_improvement": {
      "before": 8,
      "after": 6
    },
    "side_effects": "slight_strength_decline",
    "user_feedback": "mixed",
    "next_steps": "gradual_return_to_normal",
    "completion_date": "2026-02-01"
  }
}
```

---

## Validation Rules

### Required Field Validation

All memories MUST have:
- `timestamp` (ISO 8601 format)
- `timezone` (valid timezone string)
- `category` (one of 9 defined categories)
- `source` (one of 5 defined sources)
- `confidence` (0.0 to 1.0)
- `module_specific` (non-empty object)

### Category-Specific Validation

#### `fitness.training`
- MUST have: `workout_type`, `duration_mins`, `rpe`
- SHOULD have: `energy_level`, `calories_burned`

#### `nutrition.intake`
- MUST have: `meal_type`, `calories`, `plan_adherence`
- SHOULD have: `protein_g`, `carbs_g`, `fat_g`

#### `recovery.sleep`
- MUST have: `hours`, `quality_score`
- SHOULD have: `interruptions`, `bedtime`, `wake_time`

#### `recovery.stress`
- MUST have: `stress_score`
- SHOULD have: `fatigue_level`, `recovery_readiness`

#### `diagnostics.blood`
- MUST have: `test_date`
- SHOULD have: at least 3 biomarker values

#### `diagnostics.bca`
- MUST have: `scan_date`, `weight_kg`, `body_fat_percent`
- SHOULD have: `muscle_mass_kg`

#### `diagnostics.cgm`
- MUST have: `period`, `fasting_avg_mg_dl` OR `post_meal_avg_mg_dl`
- SHOULD have: `time_in_range_percent`

#### `intervention.plan`
- MUST have: `intervention_type`, `recommendation`, `rationale`, `start_date`, `status`
- SHOULD have: `target_metric`, `target_value`

#### `intervention.outcome`
- MUST have: `intervention_id`, `outcome`, `completion_date`
- SHOULD have: `baseline_value`, `final_value`

---

## Usage Guidelines

### When to Create a Memory

✅ **DO create memories for:**
- Completed workouts
- Logged meals
- Daily sleep/stress check-ins
- Diagnostic test results
- AI recommendations
- Intervention outcomes

❌ **DON'T create memories for:**
- Incomplete data
- Duplicate events (check before adding)
- Real-time streaming data (aggregate first)
- Temporary UI state

### Memory Text Best Practices

1. **Be Concise**: 1-3 sentences max
2. **Be Specific**: Include numbers and facts
3. **Be Searchable**: Use keywords that users might query
4. **Show Changes**: Use ↑ ↓ to indicate trends
5. **Add Context**: Why is this important?

### Deduplication Strategy

Before adding a memory, check if similar memory exists:
- Same `category` + `timestamp` (within 1 hour) + same `user_id`
- If found, update existing memory instead of creating new one

---

## Next Steps

After implementing this schema:

1. **Day 2**: Build `MemoryService` wrapper with schema validation
2. **Day 3-4**: Create ingestion adapters for each category
3. **Day 5**: Build memory retrieval and context injection
4. **Day 6**: Integrate with AI modules

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-31 | 1.0 | Initial schema definition |

---

**Document Owner**: Resonate Health Development Team  
**Last Updated**: 2026-01-31  
**Status**: Active
