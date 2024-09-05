import { pipeline, env } from "@xenova/transformers";

// Skip local model check
env.allowLocalModels = false;

// Use the Singleton pattern to enable lazy construction of the pipeline.
class PipelineSingleton {
    static task = 'object-detection';
    static model = 'Xenova/gelan-e';
    //static model = "Xenova/gelan-c_all";
    static instance = null;

    static async getInstance(progress_callback = null) {
        if (this.instance === null) {
            this.instance = pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

// Listen for messages from the main thread
self.addEventListener('message', async (event) => {
    // Retrieve the classification pipeline. When called for the first time,
    // this will load the pipeline and save it for future use.
    let detector = await PipelineSingleton.getInstance(x => {
        // We also add a progress callback to the pipeline so that we can
        // track model loading.
        self.postMessage(x);
    });
    // // Actually perform the classification
    // let output = await classifier(event.data.text);
    //console.log(event)
    console.log("start output")
    let output = await detector(event.data.image, {threshold: 0.1, percentage: true,});
    console.log("aloo output")
    //console.log(output)
    // Send the output back to the main thread
    self.postMessage({
        status: 'complete',
        output: output,
    });
});
