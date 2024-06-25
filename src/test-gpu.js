import { GPU } from 'gpu.js';

const gpu = new GPU();

// Função de Kernel para cálculos simples
const kernel = gpu.createKernel(function(a, b) {
  return a[this.thread.x] + b[this.thread.x];
}).setOutput([100]);

const a = new Float32Array(100).fill(1);
const b = new Float32Array(100).fill(2);

const result = kernel(a, b);
console.log(result);  // Deve exibir uma matriz com o resultado
