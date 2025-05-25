'use client'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formSchema } from '@/validations/video'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import uploadVideoAndLaunchJob from '../lib/actions'

export function FileForm() {
	const [videoPreview, setVideoPreview] = useState<string | null>(null)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	})

	function handleFileChange(files: FileList | null) {
		if (files && files[0]) {
			const file = files[0]
			setVideoPreview(URL.createObjectURL(file)) // Generate a preview URL
			form.setValue('videoFile', files) // Update the form state
		}
	}

	async function handleSubmit(data: z.infer<typeof formSchema>) {
		console.log('Form data:', data)
		try {
			uploadVideoAndLaunchJob({ video: data.videoFile[0] as File })
		} catch (error) {
			console.error('Error uploading video:', error)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="videoFile"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Video</FormLabel>
							<FormControl>
								<Input
									type="file"
									accept="video/mp4,video/x-matroska"
									onChange={(e) => handleFileChange(e.target.files)}
								/>
							</FormControl>
							<FormDescription>Video que você quer enviar</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				{videoPreview && (
					<div className="mt-4">
						<p className="text-sm font-medium">Preview:</p>
						<video
							src={videoPreview}
							controls
							className="mt-2 w-full max-w-md"
						/>
					</div>
				)}
				<Button type="submit" className="hover:cursor-pointer">
					Enviar
				</Button>
			</form>
		</Form>
	)
}
