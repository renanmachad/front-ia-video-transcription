'use server'
import { s3 } from '@/lib/constants' 
import type { transformVideoToAudioTask } from '@/trigger/transform-video-to-audio'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { tasks } from '@trigger.dev/sdk/v3'
import { redirect } from 'next/navigation'

export default async function uploadVideoAndLaunchJob({
	video,
}: {
	video: File 
}) {
	const Key = `uploads/${crypto.randomUUID()}_${video.name}`

	await s3.send(
		new PutObjectCommand({
			Bucket: process.env.BUCKET_NAME || "",
			Key,
			Body: Buffer.from(await video.arrayBuffer()), // or stream if huge
			ContentType: video.type,
			ContentLength: video.size,
		}),
	)

	const downloadUrl = await getSignedUrl(
		s3,
		new GetObjectCommand({
			Bucket: process.env.BUCKET_NAME || "",
			Key, 
		}),
		{ expiresIn: 60 * 60 }, 
	)

	const run = await tasks.trigger<typeof transformVideoToAudioTask>(
		'transform-video-to-audio', 
		{
			videoUrl: downloadUrl,
			videoName: video.name,
			videoType: video.type,
		},
	)

	return redirect(`/runs/${run.id}?accessToken=${run.publicAccessToken}`) 
}
