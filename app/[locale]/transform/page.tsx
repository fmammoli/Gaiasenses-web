import ObjectDetector from "./object-detector";



export default async function Home() {
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-12">
      <h1 className="text-5xl font-bold mb-2 text-center">Transformers.js</h1>
      <h2 className="text-2xl mb-4 text-center">Next.js template</h2>

     <ObjectDetector></ObjectDetector>
      
    </main>
  )
}   