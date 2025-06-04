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
import { type ExternalToast, toast } from 'sonner'
// biome-ignore lint/style/useImportType: <explanation>
import { z } from 'zod'
import uploadVideoAndLaunchJob from '../lib/actions'

const toastError: ExternalToast = {
	style: {
		backgroundColor: '#f8d7da',
	},
}

export function FileForm() {
	const [videoPreview, setVideoPreview] = useState<string | null>(null)

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
	})

	function handleFileChange(files: FileList | null) {
		if (files?.[0]) {
			const file = files[0]
			setVideoPreview(URL.createObjectURL(file))
			form.setValue('videoFile', files)
		}
	}

	async function handleSubmit(data: z.infer<typeof formSchema>) {
		try {
			if (videoPreview) {
				// Persist preview so the next page can display it
				sessionStorage.setItem('videoPreview', videoPreview)
			}

			await uploadVideoAndLaunchJob({
				video: data.videoFile[0] as File,
			})
		} catch (error) {
			toast.error(`Erro ao enviar o vídeo.${error}`, toastError)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="videoFile"
					render={() => (
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
						<video src={videoPreview} controls className="mt-2 w-full max-w-md">
							<track
								kind="captions"
								src={videoPreview}
								label="No captions available"
								default
							/>
						</video>
					</div>
				)}
				<Button type="submit" className="hover:cursor-pointer">
					Enviar
				</Button>
			</form>
		</Form>
	)
}
