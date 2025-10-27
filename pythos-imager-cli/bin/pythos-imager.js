#!/usr/bin/env node

import { Command } from 'commander';
import { listISOs, downloadISO, flashImage, verifyImage, isos } from '../lib/utils.js';

const program = new Command();

program
  .name('pythos-imager')
  .description('CLI tool to download and flash OS images.');

program
  .command('list')
  .description('List available ISOs.')
  .action(async () => {
    await listISOs();
  });

program
  .command('download')
  .description('Download and verify an ISO.')
  .argument('<iso-name>', 'Name of the ISO to download.')
  .action(async (isoName) => {
    const fileName = await downloadISO(isoName);
    if(fileName){
        await verifyImage(fileName, isoName);
    }
  });

program
  .command('flash')
  .description('Flash an image to a drive.')
  .argument('<image-path>', 'Path to the image file.')
  .requiredOption('-d, --drive <drive-path>', 'Path to the drive to flash.')
  .action(async (imagePath, options) => {
    await flashImage(imagePath, options.drive);
  });

program
  .command('verify')
  .description('Verify an image.')
  .argument('<iso-name>', 'Name of the ISO to verify.')
  .requiredOption('-f, --file <image-path>', 'Path to the image file.')
  .action(async (isoName, options) => {
    await verifyImage(options.file, isoName);
  });

program.parse(process.argv);