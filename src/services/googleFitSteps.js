import { google } from "googleapis";
import { oauth2Client } from "../googleClient.js";

export async function fetchSteps() {
  const fitness = google.fitness({
    version: "v1",
    auth: oauth2Client
  });

  const endTimeMillis = Date.now();
  const startTimeMillis = new Date(
  new Date(endTimeMillis - 6 * 24 * 60 * 60 * 1000)
    .setHours(0, 0, 0, 0)
).getTime();

  const response = await fitness.users.dataset.aggregate({
    userId: "me",
    requestBody: {
      aggregateBy: [
        { dataTypeName: "com.google.step_count.delta" }
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis,
      endTimeMillis
    }
  });

  return response.data.bucket || [];
}

export function parseSteps(buckets) {
  const stepMap = {};

  // 1️⃣ Store whatever Google Fit sends
  for (const bucket of buckets) {
    const date = new Date(Number(bucket.startTimeMillis))
      .toISOString()
      .split("T")[0];

    let steps = 0;
    const points = bucket.dataset?.[0]?.point || [];

    for (const point of points) {
      steps += point.value?.[0]?.intVal || 0;
    }

    stepMap[date] = steps;
  }

  // 2️⃣ Force last 7 days INCLUDING today
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);

    const key = d.toISOString().split("T")[0];

    result.push({
      date: key,
      steps: stepMap[key] ?? 0
    });
  }

  return result;
}



// export function parseSteps(buckets) {
//   return buckets.map((bucket) => {
//     const date = new Date(Number(bucket.startTimeMillis))
//       .toISOString()
//       .split("T")[0];

//     let steps = 0;

//     const points = bucket.dataset?.[0]?.point || [];

//     for (const point of points) {
//       steps += point.value?.[0]?.intVal || 0;
//     }

//     return { date, steps };
//   });
// }
