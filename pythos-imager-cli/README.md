# PythOS Imager CLI

A command-line tool to download and flash OS images.

## Installation

You can install the CLI tool via npm:

```bash
npm install pythos-imager
```

Alternatively, you can clone the repository and run the following command from within the `pythos-imager-cli` directory to install it locally:

```bash
npm install -g .
```

## Configuration

The list of available ISOs is fetched from `https://pythos.pages.dev/api/images.json`.

## Commands

| Command | Alias | Description |
| :--- | :--- | :--- |
| `ls drive` | `ls d` | Lists the available drives. |
| `ls image` | `ls i` | Lists the available images. |
| `pull <name-or-version>` | `p` | Downloads and verifies the specified ISO. |
| `flash <name-or-version> --drive <drive-path>` | `f` | Flashes a downloaded image to a drive. |
| `verify <name-or-version> --file <image-path>` | `v` | Verifies the integrity of a downloaded image file. |

### Usage Examples

**List Drives**
```bash
pythos-imager ls drive
pythos-imager ls d
```

**List Images**
```bash
pythos-imager ls image
pythos-imager ls i
```

**Download and Verify an ISO**
```bash
pythos-imager pull "PythOS 6.1 Beta x86_64"
pythos-imager p 6.1-beta
```

**Flash an Image**
```bash
pythos-imager flash "PythOS 6.1 Beta x86_64" --drive /dev/sdb
pythos-imager f 6.1-beta -d /dev/sdb
```
**Warning:** This is a destructive operation and will erase all data on the specified drive.

**Verify an Image**
```bash
pythos-imager verify "PythOS 6.1 Beta x86_64" --file ./PythOS6.1-x86_64-beta.iso
pythos-imager v 6.1-beta --file ./PythOS6.1-x86_64-beta.iso
```

---

## Contributing

Have questions, suggestions, or want to contribute? Feel free to open an issue or a pull request on our [GitHub repository](https://github.com/alexlam0206/PythOS-Imager/issues).
