import RunProgress from './RunProgress'

export default function RunPage({
	params,
	searchParams,
}: {
	params: { id: string }
	searchParams: { accessToken: string }
}) {
	return (
		<RunProgress runId={params.id} accessToken={searchParams.accessToken} />
	)
}
