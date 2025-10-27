# PythOS Imager CLI

A command-line tool to download and flash OS images.

## Installation

To install the CLI tool, clone the repository and run the following command from within the `pythos-imager-cli` directory:

```bash
npm install -g .
```

This will install the `pythos-imager` command globally on your system.

## Configuration

The list of available ISOs is defined in the `isos` array in `lib/utils.js`. You can edit this file to add or remove ISOs.

The `isos` array should have the following format:

```json
[
  {
    "name": "PythOS 6.0 NewCore",
    "url": "https://pythos.dev/images/pythos-6.0.iso",
    "sha256": "..."
  },
  {
    "name": "Ubuntu 24.04 LTS",
    "url": "https://releases.ubuntu.com/24.04/ubuntu-24.04-desktop-amd64.iso",
    "sha256": "..."
  }
]
```

## Commands

Here are the available commands:

### `pythos-imager list`

Lists the available ISOs.

**Usage:**

```bash
pythos-imager list
```

### `pythos-imager download <iso-name>`

Downloads and verifies the specified ISO.

**Usage:**

```bash
pythos-imager download "PythOS 6.0 NewCore"
```

### `pythos-imager flash <image-path> --drive <drive-path>`

Flashes the specified image file to a drive. This command requires `sudo` privileges and will prompt for your password.

**Usage:**

```bash
pythos-imager flash ./pythos-6.0.iso --drive /dev/sdb
```

**Warning:** This is a destructive operation and will erase all data on the specified drive.

### `pythos-imager verify <iso-name> --file <image-path>`

Verifies the integrity of a downloaded image file by checking its SHA256 hash against the one specified in the `isos` array.

**Usage:**

```bash
pythos-imager verify "PythOS 6.0 NewCore" --file ./pythos-6.0.iso
```