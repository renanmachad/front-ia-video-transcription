import { s3 } from "@/lib/constants";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { configure, logger, schemaTask } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import nodeFetch from "node-fetch";
import { Readable } from "node:stream";
import os from "os";
import path from "path";
import { z } from "zod";

configure({
  accessToken: process.env.TRIGGER_API_KEY,
})

export const schema =  z.object({
  videoUrl: z.string({ required_error: "Video file is required" }).url("Invalid video file URL"),
  videoName: z.string({ required_error: "Video name is required" }),
  videoType: z.string({ required_error: "Video type is required" }),
})

export const transformVideoToAudioTask = schemaTask({
  id: "transform-video-to-audio",
  schema: schema,
  maxDuration: 300, 
  run: async ({ videoUrl, videoName, videoType }, { ctx }) => {
    console.log("Transforming video to audio...");
    console.log("Video file:", videoUrl)

    const tempDir = os.tmpdir()
    const outputPath = path.join(tempDir, `audio_${videoName}.wav`)
    
    const response = await nodeFetch(videoUrl)

    await new Promise((resolve, reject) => {
      if(!response.body){
        return reject(new Error("failed to fetch video file"))
      }
      ffmpeg(Readable.from(response.body))
        .outputOptions([
          "-vn", // No video
          "-acodec", "pcm_s16le", // Audio codec
          "-ar", "44100", // Sample rate
          "-ac", "2", // Number of audio channels    
        ])
        .output(outputPath)
        .on("end", resolve)
        .on("error", reject)
        .run()
    })

    // Read the extracted audio
    const audioBuffer = await fs.readFile(outputPath);
    const audioSize = audioBuffer.length

    // Log audio extraction results
    logger.log(`Extracted audio size: ${audioSize} bytes`);
    logger.log(`Temporary audio file created`, { outputPath });

    // Create the S3 for the extracted audio, using the base name of the output path
    const s3Key = `extracted-audio/${path.basename(outputPath)}`;
    
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME!,
      Key: s3Key,
      Body: audioBuffer,
      ContentType: "audio/wav",
      ContentLength: audioSize,
    })

    await s3.send(uploadCommand)
    logger.log(`Audio file uploaded to S3`, { s3Key });

    await fs.unlink(outputPath)
    logger.log(`Temporary audio file deleted`, { outputPath });
    return { message: "Video file transformed to audio successfully", s3Key };
  },
});