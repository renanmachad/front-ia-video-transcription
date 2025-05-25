import { FileForm } from "./_FileForm";

export function Home() {
  return (
    <>
      {" "}
      <h1 className="items-center justify-center py-2 flex scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        Enviar Vídeo para Transcrição
      </h1>
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <FileForm />
      </div>
    </>
  );
}
