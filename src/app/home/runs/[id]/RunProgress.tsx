'use client'

import { Progress } from '@/components/ui/progress'
import { useRun } from '@trigger.dev/react-hooks'
import { useEffect, useState } from 'react'

interface Props {
	runId: string
	accessToken: string
}

export default function RunProgress({ runId, accessToken }: Props) {
	const { run, error } = useRun(runId, { accessToken, refreshInterval: 1000 })
	const percent =
		typeof run?.metadata?.progress === 'number'
			? (run?.metadata?.progress as number)
			: 0

	const [preview, setPreview] = useState<string | null>(null)

	useEffect(() => {
		// Retrieve preview from sessionStorage set by the upload form
		const stored = sessionStorage.getItem('videoPreview')
		if (stored) {
			setPreview(stored)
		}
	}, [])

	return (
		<div className="flex flex-col items-center gap-4 py-10">
			{preview && (
				<video src={preview} controls className="w-full max-w-md">
					<track kind="captions" label="Preview" />
				</video>
			)}
			<Progress value={percent} className="w-full max-w-md" />
			<p className="text-sm">
				{Math.round(percent)}% {run?.isCompleted && 'concluído'}
			</p>
			{error && <p className="text-sm text-red-600">Erro: {error.message}</p>}
		</div>
	)
}
