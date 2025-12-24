import { google } from "googleapis";
import { oauth2Client } from "../googleClient.js";

export async function fetchSleep() {
  const fitness = google.fitness({
    version: "v1",
    auth: oauth2Client,
  });

  const endTimeMillis = Date.now();
  const startTimeMillis = endTimeMillis - 7 * 24 * 60 * 60 * 1000;

  const response = await fitness.users.dataset.aggregate({
    userId: "me",
    requestBody: {
      aggregateBy: [
        { dataTypeName: "com.google.sleep.segment" }
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis,
      endTimeMillis,
    },
  });

  return response.data.bucket || [];
}


export function parseSleep(buckets) {
  return buckets.map((bucket) => {
    const date = new Date(Number(bucket.startTimeMillis))
      .toISOString()
      .split("T")[0];

    let totalSleepMs = 0;

    const points = bucket.dataset?.[0]?.point || [];

    for (const p of points) {
      const sleepStage = p.value?.[0]?.intVal;

      // Google Fit sleep stage values
      const SLEEP_STAGES = [
        1, // SLEEP
        2, // LIGHT_SLEEP
        3, // DEEP_SLEEP
        4, // REM_SLEEP
      ];

      if (SLEEP_STAGES.includes(sleepStage)) {
        totalSleepMs +=
          (Number(p.endTimeNanos) - Number(p.startTimeNanos)) / 1e6;
      }
    }

    const sleepHours =
      Math.round((totalSleepMs / (1000 * 60 * 60)) * 10) / 10;

    return {
      date,
      sleepHours,
    };
  });
}


// import { google } from "googleapis";
// import { oauth2Client } from "../googleClient.js";

// export async function fetchSleep() {
//   const fitness = google.fitness({
//     version: "v1",
//     auth: oauth2Client,
//   });

//   const response = await fitness.users.dataset.aggregate({
//     userId: "me",
//     requestBody: {
//       aggregateBy: [
//         { dataTypeName: "com.google.sleep.segment" }
//       ],
//       bucketByTime: { durationMillis: 86400000 }, // 1 day
//       startTimeMillis: Date.now() - 7 * 24 * 60 * 60 * 1000,
//       endTimeMillis: Date.now(),
//     },
//   });

//   return response.data.bucket;
// }



// export function parseSleep(buckets) {
//   return buckets.map((bucket) => {
//     const date = new Date(Number(bucket.startTimeMillis))
//       .toISOString()
//       .split("T")[0];

//     let totalSleepMs = 0;

//     bucket.dataset[0]?.point?.forEach((p) => {
//       totalSleepMs +=
//         Number(p.endTimeNanos - p.startTimeNanos) / 1e6;
//     });

//     const sleepHours = Math.round((totalSleepMs / (1000 * 60 * 60)) * 10) / 10;

//     return {
//       date,
//       sleepHours,
//     };
//   });
// }
