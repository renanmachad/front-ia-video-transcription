'use server'
import { s3 } from '@/lib/constants'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { runs } from '@trigger.dev/sdk/v3'

export async function getAudioLink(runId: string) {
	const run = await runs.retrieve(runId) // ← fixed

	if (!run.isCompleted) {
		return { status: run.status } // PENDING, RUNNING, etc.
	}

	const { s3Key } = run.output as { s3Key: string }

	const audioUrl = await getSignedUrl(
		s3,
		new GetObjectCommand({
			Bucket: process.env.BUCKET_NAME!,
			Key: s3Key,
		}),
		{ expiresIn: 60 * 60 },
	)

	return { status: 'COMPLETED', audioUrl }
}
