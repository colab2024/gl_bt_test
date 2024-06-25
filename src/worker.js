import { parentPort, workerData } from 'worker_threads';
import { GPU } from 'gpu.js';

const gpu = new GPU();

const encontrarChaveKernel = gpu.createKernel(function(min, max) {
    for (let i = min; i <= max; i++) {
        if (i % 7 === 0) {  // Simulando uma condição para encontrar a chave
            return i;
        }
    }
    return -1;
}).setOutput([1]);

function encontrarChave(min, max, batchSize) {
    let result = -1;
    for (let batchStart = min; batchStart <= max; batchStart += batchSize) {
        const batchEnd = Math.min(batchStart + batchSize - 1, max);
        result = encontrarChaveKernel(batchStart, batchEnd);
        if (result[0] !== -1) {
            return result[0];
        }
    }
    return -1;
}

const { min, max, batchSize } = workerData;
const resultado = encontrarChave(min, max, batchSize);
parentPort.postMessage(resultado);
