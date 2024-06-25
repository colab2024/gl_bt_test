// main.js
import chalk from 'chalk';
import os from 'os';
import { Worker } from 'worker_threads';
import {
    fazerPergunta,
    escolherCarteira,
    escolherMinimo,
    escolherPorcentagem,
    escolherPorcentagemBlocos
} from './utils/index.js';
import encontrarBitcoins from './bitcoin-find.js';
import { iniciarInterfaceWeb } from './web-interface/app.js';

function titulo() {
    console.log("\x1b[38;2;250;128;114m" + "╔════════════════════════════════════════════════════════╗\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "   ____ _____ ____   _____ ___ _   _ ____  _____ ____   " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "  | __ )_   _/ ___| |  ___|_ _| \\ | |  _ \\| ____|  _ \\  " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "  |  _ \\ | || |     | |_   | ||  \\| | | | |  _| | |_) | " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "  | |_) || || |___  |  _|  | || |\\  | |_| | |___|  _ <  " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "  |____/ |_| \\____| |_|   |___|_| \\_|____/|_____|_| \\_\\ " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "║" + "\x1b[0m" + "\x1b[36m" + "                                                        " + "\x1b[0m" + "\x1b[38;2;250;128;114m" + "║\n" +
        "╚══════════════════════\x1b[32m" + "Investidor Internacional - v0.8" + "\x1b[0m\x1b[38;2;250;128;114m═══╝" + "\x1b[0m");
}

async function processarBlocoWorker(min, max) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker.mjs', {
            workerData: { min, max, batchSize: 1000 }  // Ajuste o batchSize conforme necessário
        });

        worker.on('message', result => {
            resolve(result);
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Worker stopped with exit code ${code}`));
            }
        });
    });
}

async function menu(args) {
    const escolhaCarteira = args[0];
    const opcao = args[1];

    let [min, max, key] = [escolhaCarteira, escolhaCarteira + 10, BigInt(escolhaCarteira)];
    switch (opcao) {
        case '1':
            key = BigInt(min);
            encontrarBitcoins(key, min, max);
            break;
        case '2':
            [min, max, key] = await escolherPorcentagem(min, max);
            encontrarBitcoins(key, min, max);
            break;
        case '3':
            [min, key] = await escolherMinimo(min);
            encontrarBitcoins(key, min, max);
            break;
        case '4':
            const numCPUs = os.cpus().length;
            const numBlocos = parseInt(args[2]) || numCPUs;
            const blocos = await escolherPorcentagemBlocos(min, max, numBlocos);

            const control = { found: false };

            const criarWorkerProcess = (bloco, blocoId) => {
                return new Promise(async (resolve, reject) => {
                    try {
                        const resultado = await processarBlocoWorker(bloco.inicio, bloco.fim);
                        if (resultado !== -1) {
                            control.found = true;
                            console.log(`Chave encontrada no bloco ${blocoId}: ${resultado}`);
                            resolve();
                        } else {
                            console.log(`Bloco ${blocoId} completado sem encontrar chave.`);
                            resolve();
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            };

            const promises = blocos.map((bloco, index) => criarWorkerProcess(bloco, index + 1));

            try {
                await Promise.all(promises);
            } catch (error) {
                console.error('Erro ao processar blocos com Worker Threads:', error);
                return;
            }
            break;
        case '5':
            const numCPUsRandom = os.cpus().length;
            const numBlocosRandom = parseInt(args[2]) || numCPUsRandom;
            const blocosRandom = await escolherPorcentagemBlocos(min, max, numBlocosRandom);

            const controlRandom = { found: false };

            const criarWorkerRandomProcess = (bloco, blocoId) => {
                return new Promise(async (resolve, reject) => {
                    try {
                        const resultado = await processarBlocoWorker(bloco.inicio, bloco.fim);
                        if (resultado !== -1) {
                            controlRandom.found = true;
                            console.log(`Chave encontrada no bloco ${blocoId}: ${resultado}`);
                            resolve();
                        } else {
                            console.log(`Bloco ${blocoId} completado sem encontrar chave.`);
                            resolve();
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            };

            const promisesRandom = blocosRandom.map((bloco, index) => criarWorkerRandomProcess(bloco, index + 1));

            try {
                await Promise.all(promisesRandom);
            } catch (error) {
                console.error('Erro ao processar blocos com Worker Threads:', error);
                return;
            }
            break;
        default:
            console.log("Opção inválida. Por favor, escolha uma das opções disponíveis.");
            break;
    }
}

async function main(args) {
    console.clear();
    titulo();
    await iniciarInterfaceWeb();
    await menu(args);
}

const args = process.argv.slice(2);
main(args);

process.on('SIGINT', () => {
    console.log("\nFechando Programa!");
    process.exit();
});
