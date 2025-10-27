import ora from 'ora';
import fetch from 'node-fetch';
import { createWriteStream, createReadStream, existsSync } from 'fs';
import cliProgress from 'cli-progress';
import { createHash } from 'crypto';
import si from 'systeminformation';
import readline from 'readline';
import { spawn } from 'child_process';

const API_URL = 'https://pythos.pages.dev/api/images.json';

async function getISOs() {
    const response = await fetch(API_URL);
    return await response.json();
}

async function findISO(nameOrVersion) {
    const isos = await getISOs();
    return isos.find(i => i.name === nameOrVersion || i.version === nameOrVersion);
}


function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export async function listISOs() {
  const isos = await getISOs();
  console.log('Available ISOs:');
  isos.forEach((iso, index) => {
    console.log(`${index + 1}. ${iso.name}`);
    console.log(`   Version: ${iso.version}`);
    console.log(`   Description: ${iso.description}`);
  });
  console.log('\nTo flash to drive, run `pythos-imager download <ISO Name or Version>` and then `pythos-imager flash <ISO Name or Version> --drive <drive-path>`');
}

export async function listDrives() {
    const drives = await si.blockDevices();
    const removableDrives = drives.filter(drive => {
        if (process.platform === 'darwin') {
            return drive.removable && drive.protocol === 'USB' && !/s\d+$/.test(drive.name);
        }
        return drive.removable;
    });

    if (removableDrives.length === 0) {
        console.log('No removable drives found.');
        return;
    }
    console.log('Available drives:');
    removableDrives.forEach(drive => {
        console.log(`- ${drive.name} (${formatBytes(drive.size)}) - ${drive.label}`);
    });

    if (process.platform === 'darwin') {
        console.log('\nOn macOS, you should use the whole disk device for flashing (e.g., /dev/diskX, not /dev/diskXsY).');
        console.log('You can find the correct device name by running `diskutil list` in your terminal.');
    }
}

export function downloadISO(nameOrVersion) {
    return new Promise(async (resolve, reject) => {
        const iso = await findISO(nameOrVersion);
        if (!iso) {
            console.error('ISO not found.');
            return reject(new Error('ISO not found.'));
        }

        const spinner = ora(`Starting download for ${iso.name}...`).start();
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
                spinner.succeed(`Downloaded ${iso.name} to ${fileName}`);
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

export function flashImage(nameOrVersion, drivePath) {
    return new Promise(async (resolve, reject) => {
        const iso = await findISO(nameOrVersion);
        if (!iso) {
            console.error('ISO not found.');
            return reject(new Error('ISO not found.'));
        }
        const fileName = iso.url.split('/').pop();
        if (!existsSync(fileName)) {
            console.error(`Image file not found: ${fileName}. Please download it first with 'pythos-imager download "${nameOrVersion}"'`);
            return reject(new Error('Image file not found.'));
        }

        let rawDevicePath = drivePath;
        if (process.platform === 'darwin') {
            if (/s\d+$/.test(drivePath)) {
                const wholeDisk = drivePath.replace(/s\d+$/, '');
                console.warn(`\nWarning: You are trying to flash a partition. It is recommended to use the whole disk device (${wholeDisk}).`);
                console.warn(`The tool will attempt to use ${wholeDisk} instead.`);
                rawDevicePath = wholeDisk;
            }
            // Using /dev/rdisk is faster on macOS for raw disk access
            if (rawDevicePath.startsWith('/dev/disk')) {
                rawDevicePath = rawDevicePath.replace('/dev/disk', '/dev/rdisk');
            }
        }

        const command = ['dd', `if=${fileName}`, `of=${rawDevicePath}`, 'bs=4m', 'status=progress'];
        console.log(`About to run: sudo ${command.join(' ')}`);
        console.log(`This will erase all data on ${rawDevicePath}.`);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Are you sure you want to continue? (y/n) ', (answer) => {
            rl.close();
            if (answer.toLowerCase() !== 'y') {
                console.log('Aborted.');
                return resolve();
            }

            const unmountCommand = process.platform === 'darwin' ? ['diskutil', 'unmountDisk', rawDevicePath.replace('/dev/rdisk', '/dev/disk')] : ['umount', rawDevicePath];
            const unmount = spawn('sudo', unmountCommand);

            unmount.on('close', (unmountCode) => {
                if (unmountCode !== 0) {
                    console.warn(`Could not unmount ${rawDevicePath}. Flashing may fail.`);
                }

                const child = spawn('sudo', command, { stdio: 'inherit' });

                child.on('close', (code) => {
                    if (code === 0) {
                        console.log('Flashing complete.');
                        console.log(`You may now eject the drive ${rawDevicePath} and boot.`);
                        resolve();
                    } else {
                        reject(new Error(`dd command failed with code ${code}`));
                    }
                });
            });
        });
    });
}

export function verifyImage(imagePath, nameOrVersion) {
    return new Promise(async (resolve, reject) => {
        const iso = await findISO(nameOrVersion);
        if (!iso || !iso.sha256) {
            console.log(`No SHA256 hash available for ${nameOrVersion}. Skipping verification.`);
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
