#!/usr/bin/env node

import { Command } from 'commander';
import { listISOs, downloadISO, flashImage, verifyImage, listDrives } from '../lib/utils.js';

const program = new Command();

program
  .name('pythos-imager')
  .description('CLI tool to download and flash OS images.');

const ls = program.command('ls')
    .description('List available images or drives.')
    .action(() => {
        console.log('Please specify `drive` or `image`. e.g. `pythos-imager ls drive`');
    });

ls
    .command('drive')
    .alias('d')
    .description('List available drives.')
    .action(async () => {
        await listDrives();
    });

ls
    .command('image')
    .alias('i')
    .description('List available images.')
    .action(async () => {
        await listISOs();
    });

program
  .command('pull')
  .alias('p')
  .description('Download and verify an ISO.')
  .argument('<name-or-version>', 'Name or version of the ISO to download.')
  .action(async (nameOrVersion) => {
    const fileName = await downloadISO(nameOrVersion);
    if(fileName){
        await verifyImage(fileName, nameOrVersion);
    }
  });

program
  .command('flash')
  .alias('f')
  .description('Flash an image to a drive.')
  .argument('<name-or-version>', 'Name or version of the ISO to flash.')
  .requiredOption('-d, --drive <drive-path>', 'Path to the drive to flash.')
  .action(async (nameOrVersion, options) => {
    await flashImage(nameOrVersion, options.drive);
  });

program
  .command('verify')
  .alias('v')
  .description('Verify an image.')
  .argument('<name-or-version>', 'Name or version of the ISO to verify.')
  .requiredOption('-f, --file <image-path>', 'Path to the image file.')
  .action(async (nameOrVersion, options) => {
    await verifyImage(options.file, nameOrVersion);
  });

program.helpInformation = function() {
    let help = `Usage: pythos-imager [options] [command]\n\n`;
    help += `CLI tool to download and flash OS images.\n\n`;
    help += 'Options:\n';
    help += `  -h, --help                      display help for command\n\n`;
    help += 'Commands:\n';
    help += `  ls drive|d                      List available drives.\n`;
    help += `  ls image|i                      List available images.\n`;
    help += `  pull|p <name-or-version>        Download and verify an ISO.\n`;
    help += `  flash|f <name-or-version> [options]    Flash an image to a drive.\n`;
    help += `  verify|v <name-or-version> [options]   Verify an image.\n`;
    help += `  help [command]                  display help for command\n`;
    return help;
};

program.parse(process.argv);
