import { z } from "zod";

export const formSchema = z.object({
  videoFile: z
    .any()
    .refine((file) => file?.length > 0, {
      message: "Selecione um arquivo",
    })
    .refine(
      (file) => {
        const fileType = file[0]?.type;
        return fileType === "video/mp4" || fileType === "video/x-matroska";
      },
      {
        message: "Apenas arquivos mp4 ou mkv são aceitos",
      }
    ),
});