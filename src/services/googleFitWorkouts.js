import { google } from "googleapis";
import { oauth2Client } from "../googleClient.js";

const ACTIVITY_MAP = {
  0: "In Vehicle",
  1: "Biking",
  7: "Walking",
  8: "Running",
  72: "Workout",
  93: "Strength Training",
  94: "Yoga",
  109: "HIIT"
};


export async function fetchWorkouts() {
  const fitness = google.fitness({
    version: "v1",
    auth: oauth2Client,
  });

  const response = await fitness.users.dataset.aggregate({
    userId: "me",
    requestBody: {
      aggregateBy: [
        { dataTypeName: "com.google.activity.segment" }
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: Date.now() - 7 * 24 * 60 * 60 * 1000,
      endTimeMillis: Date.now(),
    },
  });

  return response.data.bucket;
}

export function parseWorkouts(buckets) {
  const workouts = [];

  buckets.forEach((bucket) => {
    const date = new Date(Number(bucket.startTimeMillis))
      .toISOString()
      .split("T")[0];

    bucket.dataset[0]?.point?.forEach((p) => {
      const durationMin =
        (Number(p.endTimeNanos - p.startTimeNanos) / 1e9) / 60;

      const activityCode = p.value[0].intVal;

      workouts.push({
        date,
        type: ACTIVITY_MAP[activityCode] || "Unknown",
        durationMin: Math.round(durationMin),
      });
    });
  });

  return workouts;
}




// export function parseWorkouts(buckets) {
//   const workouts = [];

//   buckets.forEach((bucket) => {
//     const date = new Date(Number(bucket.startTimeMillis))
//       .toISOString()
//       .split("T")[0];

//     bucket.dataset[0]?.point?.forEach((p) => {
//       const durationMin =
//         (Number(p.endTimeNanos - p.startTimeNanos) / 1e9) / 60;

//       workouts.push({
//         date,
//         type: p.value[0].intVal,
//         durationMin: Math.round(durationMin),
//       });
//     });
//   });

//   return workouts;
// }

