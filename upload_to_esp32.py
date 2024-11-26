import os
import time
import subprocess
import sys

if len(sys.argv) != 2:
  print("Usage: upload_to_esp.py PORT")
  exit()


# Configuration
#ESP_PORT = "/dev/tty.SLAB_USBtoUART"  # Change this to your ESP32's port
#ESP_PORT = "/dev/tty.usbserial-0001"
ESP_PORT = sys.argv[1]

BAUD_RATE = 115200
FILES_TO_UPLOAD = [
    'boot.py',
    'main.py'
    'server.py',
    'dist/spa/*'
]


# Helper function to upload a single file using ampy
def upload_file(file_path, target_name, esp_port, baud_rate):
    if target_name == 'favicon.ico':
        return
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist. Skipping.")
        return
    try:
        print(f"Uploading {file_path} as {target_name} to ESP32...")
        subprocess.run(
            ["ampy", "--port", esp_port, "--baud", str(baud_rate), "put", file_path, target_name],
            check=True
        )
        print(f"Successfully uploaded {file_path} as {target_name}.")
    except subprocess.CalledProcessError as e:
        print(f"Failed to upload {file_path}: {e}")


# Helper function to recursively upload all files in a folder
def upload_folder(folder_path, esp_port, baud_rate):
    for root, _, files in os.walk(folder_path):
        for file in files:
            full_path = os.path.join(root, file)
            # Strip the base folder path (e.g., dist/spa/) to flatten the structure
            target_name = os.path.relpath(full_path, start=folder_path)
            target_name = target_name.replace(os.sep, "/")  # Ensure Unix-style paths

            # Extract the folder part of the target path
            target_folder = os.path.dirname(target_name)

            # Ensure the target directory exists on ESP32
            ensure_directory_exists(esp_port, target_folder)

            # Upload the file
            upload_file(full_path, target_name, esp_port, baud_rate)


# Helper function to ensure a directory exists on the ESP32
def ensure_directory_exists(esp_port, target_folder):
    try:
        # Create the directory on ESP32
        subprocess.run(
            ["ampy", "--port", esp_port, "mkdir", target_folder],
            check=True
        )
        print(f"Directory {target_folder} created on ESP32.")
    except Exception:
        print(f"Directory {target_folder} already exists on ESP32 or failed to create.")


# Function to list all files on the ESP32 after reset
def list_files_on_esp32():
    try:
        # List all files in the ESP32's root directory
        result = subprocess.run(
            ["ampy", "--port", ESP_PORT, "ls"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )
        print("Files on ESP32 after reset:")
        print(result.stdout.decode())
    except subprocess.CalledProcessError as e:
        print(f"Error listing files on ESP32: {e}")


# Main routine to upload all files
def upload_files():
    for file_or_pattern in FILES_TO_UPLOAD:
        # Handle wildcards like 'dist/spa/*'
        if '*' in file_or_pattern:
            base_folder = file_or_pattern.rstrip('/*')
            if os.path.isdir(base_folder):
                upload_folder(base_folder, ESP_PORT, BAUD_RATE)
            else:
                print(f"Folder {base_folder} not found. Skipping.")
        elif os.path.isdir(file_or_pattern):
            upload_folder(file_or_pattern, ESP_PORT, BAUD_RATE)
        elif os.path.isfile(file_or_pattern):
            target_name = os.path.basename(file_or_pattern)
            upload_file(file_or_pattern, target_name, ESP_PORT, BAUD_RATE)
        else:
            print(f"File or folder {file_or_pattern} not found. Skipping.")


# Run the script on ESP32 by resetting it
def reset_esp32():
    print("Resetting ESP32 to run main.py...")
    subprocess.run(["ampy", "--port", ESP_PORT, "reset"], check=True)
    time.sleep(10)  # Give the ESP32 some time to reset
    print("ESP32 reset completed.")
    # List files on the ESP32 after reset
    list_files_on_esp32()

if __name__ == "__main__":
    upload_files()
    reset_esp32()
