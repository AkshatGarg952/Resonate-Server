import { google } from "googleapis";
import { oauth2Client } from "../googleClient.js";

export async function fetchSteps() {
  const fitness = google.fitness({
    version: "v1",
    auth: oauth2Client
  });

  const response = await fitness.users.dataset.aggregate({
    userId: "me",
    requestBody: {
      aggregateBy: [
        { dataTypeName: "com.google.step_count.delta" }
      ],
      bucketByTime: { durationMillis: 86400000 },
      startTimeMillis: Date.now() - 7 * 24 * 60 * 60 * 1000,
      endTimeMillis: Date.now()
    }
  });

  return response.data.bucket;
}


export function parseSteps(buckets) {
  return buckets.map((bucket) => {
    const date = new Date(Number(bucket.startTimeMillis))
      .toISOString()
      .split("T")[0];

    let steps = 0;

    if (
      bucket.dataset[0]?.point?.length > 0
    ) {
      steps = bucket.dataset[0].point[0].value[0].intVal;
    }

    return { date, steps };
  });
}
