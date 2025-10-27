import ora from 'ora';
import fetch from 'node-fetch';
import { createWriteStream, createReadStream } from 'fs';
import cliProgress from 'cli-progress';
import sudo from 'sudo-js';
import { createHash } from 'crypto';

export const isos = [
  { "name": "PythOS 6.0 NewCore", "url": "https://pythos.dev/images/pythos-6.0.iso", "sha256": "..." },
  { "name": "Ubuntu 24.04 LTS", "url": "https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso", "sha256": "..." }
];

export async function listISOs() {
  console.log('Available ISOs:');
  isos.forEach((iso, index) => {
    console.log(`${index + 1}. ${iso.name}`);
  });
}

export function downloadISO(isoName) {
    return new Promise(async (resolve, reject) => {
        const iso = isos.find(i => i.name === isoName);
        if (!iso) {
            console.error('ISO not found.');
            return reject(new Error('ISO not found.'));
        }

        const spinner = ora(`Starting download for ${isoName}...`).start();
        try {
            const response = await fetch(iso.url);
            if (!response.ok) {
                return reject(new Error(`Failed to download: ${response.statusText}`));
            }

            const totalSize = Number(response.headers.get('content-length'));
            const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
            const fileName = iso.url.split('/').pop();
            const fileStream = createWriteStream(fileName);
            
            spinner.stop();
            progressBar.start(totalSize, 0);

            response.body.on('data', (chunk) => {
                progressBar.increment(chunk.length);
            });

            response.body.pipe(fileStream);

            fileStream.on('finish', () => {
                progressBar.stop();
                spinner.succeed(`Downloaded ${isoName} to ${fileName}`);
                resolve(fileName);
            });

            fileStream.on('error', (err) => {
                progressBar.stop();
                spinner.fail(`Error writing to file: ${err.message}`);
                reject(err);
            });

        } catch (error) {
            spinner.fail(`Error: ${error.message}`);
            reject(error);
        }
    });
}

export async function flashImage(imagePath, drivePath) {
    const command = ['dd', `if=${imagePath}`, `of=${drivePath}`, 'bs=4m', 'status=progress'];
    console.log(`About to run: sudo ${command.join(' ')}`);
    console.log(`This will erase all data on ${drivePath}.`);
    
    // Add a confirmation prompt here in a real implementation
    
    sudo.exec(command, (err, pid, result) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(result);
    });
}

export function verifyImage(imagePath, isoName) {
    return new Promise((resolve, reject) => {
        const iso = isos.find(i => i.name === isoName);
        if (!iso || !iso.sha256 || iso.sha256 === '...') {
            console.log(`No SHA256 hash available for ${isoName}. Skipping verification.`);
            return resolve();
        }

        const spinner = ora(`Verifying ${imagePath}...`).start();
        const hash = createHash('sha256');
        const stream = createReadStream(imagePath);

        stream.on('data', (data) => {
            hash.update(data);
        });

        stream.on('end', () => {
            const fileHash = hash.digest('hex');
            if (fileHash === iso.sha256) {
                spinner.succeed('Verification successful.');
                resolve();
            } else {
                spinner.fail('Verification failed: Hashes do not match.');
                reject(new Error('Verification failed.'));
            }
        });

        stream.on('error', (err) => {
            spinner.fail(`Error reading file: ${err.message}`);
            reject(err);
        });
    });
}
