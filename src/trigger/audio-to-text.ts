import { logger, schemaTask } from '@trigger.dev/sdk/v3'
import fs from 'fs'
import OpenAI from 'openai'
import { z } from 'zod'

export const schema = z.object({
	audioPath: z.string(),
})

export const audioToTextTask = schemaTask({
	id: 'id-audio-to-text',
	schema: schema,
	run: async ({ audioPath }, { ctx }) => {
		logger.info('Audio to text task started')
		// TODO: Get audio file from S3
		logger.info(`Audio file path: ${audioPath}`)
		// TODO: Convert audio to text using OpenAI Whisper API ( OR OTHER API )

		const openai = new OpenAI()

		const transcription = await openai.audio.transcriptions.create({
			file: fs.createReadStream('/path/to/file/audio.mp3'),
			model: 'gpt-4o-transcribe',
		})

		console.log(transcription.text)
		// TODO: Save the text to S3

		// TODO: Return the state of precessing
	},
})
