export default async function RunPage({
	params,
	searchParams,
}: {
	params: Promise<{ id: string }>
	searchParams: Promise<{ accessToken: string }>
}) {
	console.log('RunPage', params, searchParams)

	return <></>
}
