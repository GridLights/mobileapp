## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).

### Flash ESP32 Chip

### prep (tavis)

• create virtual environment: python3.13 -m venv env
• activate virtual environment: source env/bin/activate
• upgrade pip: python -m pip install --upgrade pip
• install esptool: python3.13 -m pip install esptool
• install ampy: pip install adafruit-ampy

1. Connect the second ESP32 chip to your computer.
2. Open a terminal or command prompt.
3. Run the following command to erase the flash on the ESP32 (ensure you update the port if necessary):
   ```
   esptool.py --chip esp32 --port /dev/tty.usbserial-0001 erase_flash
   ```
4. Flash micropython onto the ESP32
5. Download from here https://micropython.org/download/ESP32_GENERIC/
6. Flash ESP32 'esptool.py --chip esp32 --port /dev/tty.usbserial-0001 --baud 460800 write_flash -z 0x1000 ../MicroPython/ESP32_GENERIC-20240602-v1.23.0.bin'

### Deploy App to Chip

1. Set up the python environment (version 3.12) and run the script
   '''
   pip3 install -r requirements.txt
   python3 upload_to_esp32.py
   '''
2. The script takes a while, but once it is done, you should be able to disconnect then reconnect the power to the fixture, and connect to the WLED wifi. From there you can navigate to 4.3.2.2 and view the app.

### other

:: PyMkr:

to get directory:

install os: install os
print(os.listdir())
