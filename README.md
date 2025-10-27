# PythOS Imager

PythOS Imager is a cross-platform image flashing tool suite, inspired by Raspberry Pi Imager. It includes a desktop GUI application and a command-line tool.

## Features

-   Download OS images from a remote list.
-   Flash images to removable drives (USB/SD cards).
-   Verify the integrity of flashed images.
-   Cross-platform support (macOS, Windows, Linux).

---

## 1. PythOS Imager GUI

The PythOS Imager GUI is a desktop application built with C++ and Qt6.

Coming Soon...

### Platforms

| Platform | Support |
| :--- | :--- |
| macOS | .app bundle |
| Windows | .exe portable |
| Linux | .AppImage or .deb |

### Installation

(Installation instructions for the GUI application will be provided once the application is built.)

---

## 2. PythOS Imager CLI

The PythOS Imager CLI is a command-line tool built with Node.js.

### Platforms

| Platform | Support |
| :--- | :--- |
| macOS | ✅ |
| Linux | ✅ |
| Windows | via WSL |

### Installation

To install the CLI tool, you need to have Node.js and npm installed. Then, navigate to the `pythos-imager-cli` directory and run the following command:

```bash
npm install pythos-imager
```

### Commands

| Command | Alias | Description |
| :--- | :--- | :--- |
| `ls drive` | `ls d` | Lists the available drives. |
| `ls image` | `ls i` | Lists the available images. |
| `pull <name-or-version>` | `p` | Downloads and verifies the specified ISO. |
| `flash <name-or-version> --drive <drive-path>` | `f` | Flashes a downloaded image to a drive. |
| `verify <name-or-version> --file <image-path>` | `v` | Verifies the integrity of a downloaded image file. |

For detailed usage instructions, please refer to the `README.md` file inside the `pythos-imager-cli` directory.

---
This project is designed for [PythOS](https://github.com/milo1004/PythonOS).
Under [License](/LICENSE)
