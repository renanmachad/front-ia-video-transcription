'use client'

import { Progress } from '@/components/ui/progress'
import { useRun } from '@trigger.dev/react-hooks'

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

	return (
		<div className="flex flex-col items-center gap-4 py-10">
			<Progress value={percent} className="w-full max-w-md" />
			<p className="text-sm">
				{Math.round(percent)}% {run?.isCompleted && 'concluído'}
			</p>
			{error && <p className="text-sm text-red-600">Erro: {error.message}</p>}
		</div>
	)
}
