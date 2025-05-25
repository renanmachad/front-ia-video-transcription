"use server";
import { s3 } from "@/lib/constants"; // your pre-configured S3Client
import { transformVideoToAudioTask } from "@/trigger/transform-video-to-audio";
import {
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { tasks } from "@trigger.dev/sdk/v3";


export default async function uploadVideoAndLaunchJob({
  video,
}: {
  video: File;                                           // comes from the browser
}) {
  /* ------------------------------------------------------------------ */
  /* 1.  Build a unique S3 key                                           */
  /* ------------------------------------------------------------------ */
  const Key = `uploads/${crypto.randomUUID()}_${video.name}`;

  /* ------------------------------------------------------------------ */
  /* 2.  Upload the file to S3 (single call – no presign)                */
  /*     If the file is large you can switch to UploadPartCopy, but      */
  /*     for most web uploads a simple PutObject is fine.               */
  /* ------------------------------------------------------------------ */
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME!,
      Key,
      Body: Buffer.from(await video.arrayBuffer()),      // or stream if huge
      ContentType: video.type,
      ContentLength: video.size,
    }),
  );

  /* ------------------------------------------------------------------ */
  /* 3.  Generate a GET presigned URL for Trigger.dev                    */
  /* ------------------------------------------------------------------ */
  const downloadUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.BUCKET_NAME!,
      Key,                                              // same object we just stored
    }),
    { expiresIn: 60 * 60 },                             // 1 h is typical
  );

  /* ------------------------------------------------------------------ */
  /* 4.  Kick off the background task                                   */
  /* ------------------------------------------------------------------ */
  await tasks.trigger<typeof transformVideoToAudioTask>(
    "transform-video-to-audio",                         // task ID
    {
      videoUrl:  downloadUrl,
      videoName: video.name,
      videoType: video.type,
    },
  );

  return { ok: true, message: "Video uploaded and task queued" };
}
