import network
import os
import socket
import ure
import ujson
import time
import machine
from esp32 import NVS
import _thread

# Initialize NVS
nvs = NVS("storage")

def save_name_in_nvs(name):
    name_bytes = name.encode('utf-8')

    # Store the string as a blob
    nvs.set_blob('username', name_bytes)
    nvs.commit()  # Commit the changes



def get_saved_name():
    try:
        # Retrieve the stored string
        blob = nvs.get_blob('username')
        if blob:
            username = blob.decode('utf-8')  # Convert bytes back to string
            print('Username:', username)
        else:
            print('No username found')
            username = 'User'
        return username
    except OSError:
        return 'User'

# Class vars
connected_to_esp32 = True
cycle_running = False

# Connect to Wi-Fi
ssid = 'WLED-AP'
password = 'wled1234'

station = network.WLAN(network.STA_IF)
station.active(True)
station.connect(ssid, password)

while not station.isconnected():
    pass

print('Connected to WiFi')
print(station.ifconfig())

if connected_to_esp32:
    # Set up the UART (Serial) interface
    uart = machine.UART(1, baudrate=115200, tx=17, rx=16)

# Set up a socket server
server_running = False
server_startup_failure_count = 0  # Track consecutive failures
while not server_running:
    max_failures = 2

    try:
        addr = socket.getaddrinfo('0.0.0.0', 80)[0][-1]
        s = socket.socket()
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.bind(addr)
        s.listen(5)
        server_running = True
        failure_count = 0
    except OSError as err:
        print(err)
        print(server_startup_failure_count)
        if server_startup_failure_count >= max_failures:
            print("Too many failures, rebooting ESP32...")
            time.sleep(2)
            machine.reset()
        else:
            server_startup_failure_count += 1
            print('sleeping 10s')
            time.sleep(10)




print('Listening on', addr)

# Serve files
def serve_file(conn, filename, content_type):
    try:
        conn.sendall(f'HTTP/1.0 200 OK\r\nContent-Type: {content_type}\r\n\r\n'.encode('utf-8'))
        with open(filename, 'rb') as f:
            total_sent = 0
            while True:
                chunk = f.read(1024)  # Adjust chunk size as needed
                if not chunk:
                    break
                conn.sendall(chunk)
                total_sent += len(chunk)
            print(f'Sent {total_sent} bytes from {filename}')
    except OSError as err:
        print('Caught OSError')
        print(err)
    except Exception as e:
        print(f'Error while serving {filename}: {e}')
    finally:
        conn.close()  # Close the connection
    # try:
    #     with open(filename, 'rb') as f:  # Open in binary mode
    #         conn.sendall(f'HTTP/1.0 200 OK\r\nContent-Type: {content_type}\r\n\r\n'.encode('utf-8'))
    #         conn.sendall(f.read())  # No encoding needed for binary data
    # except OSError as err:
    #     print(err)
    #     # conn.sendall('HTTP/1.0 404 NOT FOUND\r\n\r\n'.encode('utf-8'))


# Handle LED command via UART
def handle_led_command(command):
    print(f'handling command {command}')
    if uart:
        uart.write(f'{command}\n'.encode('utf-8'))  # Make sure to send bytes, not a string
        time.sleep(1)  # Adjust sleep time based on your needs

        if uart.any():
            response = uart.read().decode('utf-8')
            print("WLED Response:", response)
            return response
        # elif uart.in_waiting:  # Check if there is data available in the buffer
        #     response = uart.read(uart.in_waiting).decode('utf-8')  # Read available data
        #     print("WLED Response:", response)
        #     return response
        else:
            print('not waiting')

    return "No response"


# Function to run the cycle in the background
def run_cycle(cycle_time, scene_steps):
    global cycle_running
    while cycle_running:
        for step in scene_steps:
            effect = step['effect']
            color = step['color']
            speed = step['speed']
            brightness = step['brightness']
            percentage = int(step['percentage'])

            # Calculate the time to run each step based on percentage
            step_duration = (cycle_time * 3600) * (percentage / 100)  # Convert hours to seconds

            # Send the command to WLED for the current step
            handle_led_command(effect, color, speed, brightness)

            # Sleep for the duration of this step
            time.sleep(step_duration)


# Initialize UART with TX on GPIO 17, RX on GPIO 16, and baudrate 115200
# uart = machine.UART(1, baudrate=115200, tx=17, rx=16)

def send_uart_command2(command):
    print(f"Sending command: {command}")
    uart.write(command)
    time.sleep(5)  # Allow some time for response, adjust as needed

    if uart.any():  # Check if there's data to read
        response = uart.read().decode('utf-8')  # Read and decode response
        print("Response from WLED:", response)
        return response
    else:
        print("No response received.")
        return None

# Example: Send a JSON command to WLED over UART

# Process incoming HTTP requests
def handle_request(conn):
    request = conn.recv(1024)
    request_str = request.decode('utf-8')
    print('Request:', request_str)

    global cycle_running

    # Match GET or POST
    match = ure.search('(?:GET|POST) /([^ ]*) HTTP', request_str)

    if match:
        method = request_str.split(' ')[0]
        path = match.group(1)

        if method == 'GET':
            if path == '' or path == 'index.html':
                serve_file(conn, '/index.html', 'text/html')  # Serve index.html from dist
            # elif path == 'style.css':
            #     serve_file(conn, '/dist/css/app.9bdcf330.css', 'text/css')  # Serve style.css from dist
            # elif path == 'js/app.f3b09157.js':  # Adjust to the actual name of your main JS file
            #     serve_file(conn, '/dist/js/app.ce58f08b.js', 'application/javascript')  # Serve app.js from dist
            elif path == 'username':
                response = get_saved_name()
                conn.send('HTTP/1.1 200 OK\n')
                conn.send('Content-Type: application/json\n')
                conn.send('Connection: close\n\n')
                conn.sendall(response)
                conn.close()  # Close the connection after each request
            elif path == 'logo.png':
                try:
                    serve_file(conn, 'logo.png', 'image/png')  # Serve logo.png from dist
                    print('served')
                except Exception as e:
                    print('caught!')
                    print(e)
            elif path == 'backspace.png':
                try:
                    serve_file(conn, 'backspace.png', 'image/png')  # Serve backspace.png from dist
                    print('served')
                except Exception as e:
                    print('caught!')
                    print(e)
            else:
                # Serve files dynamically from the /dist directory
                # file_path = '/dist/' + path
                # if file_path in os.listdir('/dist'):  # Check if the file exists in the directory
                # Determine the content type based on the file extension
                if path.endswith('.html'):
                    content_type = 'text/html'
                elif path.endswith('.css'):
                    content_type = 'text/css'
                elif path.endswith('.js'):
                    content_type = 'application/javascript'
                elif path.endswith('.png'):
                    content_type = 'image/png'
                elif path.endswith('ico'):
                    content_type = 'image/x-icon'
                elif path.endswith('.woff'):
                    content_type = 'font/woff'
                elif path.endswith('.woff2'):
                    content_type = 'font/woff2'
                    # Add more content types as needed
                else:
                    content_type = None
                if content_type:
                    serve_file(conn, path, content_type)
                else:
                    print(f'Could not serve {path}')
                    conn.send('HTTP/1.0 404 NOT FOUND\r\n\r\n')
                    conn.close()

        elif method == 'POST' and path == 'led':
            print('Processing LED command')
            print(request_str)
            # send_uart_command2('{"seg": [{"col": [[0, 255, 0]] }]}\n')  # Set WLED color to green

            command_start = request_str.find('\r\n\r\n') + 4
            command_json = request_str[command_start:]
            print(command_start)
            print(command_json)
            # send_uart_command2(command_json)

            # Ensure JSON is properly handled
            try:
                command_dict = ujson.loads(command_json)
                response = handle_led_command(ujson.dumps(command_dict))
                cycle_running = False
                conn.send('HTTP/1.1 200 OK\n')
                conn.send('Content-Type: application/json\n')
                conn.send('Connection: close\n\n')
                conn.sendall(response)
                conn.close()  # Close the connection after each request
            except ValueError:
                conn.send('HTTP/1.1 400 BAD REQUEST\n')
                conn.send('Content-Type: application/json\n')
                conn.send('Connection: close\n\n')
                conn.sendall(ujson.dumps({"error": "Invalid JSON"}))
                conn.close()  # Ensure the connection is closed
            except Exception as err:
                conn.send('HTTP/1.1 400 BAD REQUEST\n')
                conn.send('Content-Type: application/json\n')
                conn.send('Connection: close\n\n')
                conn.sendall(ujson.dumps({"error": err}))
                conn.close()  # Ensure the connection is closed
        elif method == 'POST' and path == 'username':
            print('Processing username update command')
            command_start = request_str.find('\r\n\r\n') + 4
            command_json = request_str[command_start:]
            print(command_start)
            print(command_json)
            response = save_name_in_nvs('griff')
            conn.send('HTTP/1.1 201 OK\n')
            conn.send('Content-Type: application/json\n')
            conn.send('Connection: close\n\n')
            conn.sendall(response)
            conn.close()  # Close the connection after each request
        elif method=="POST" and path == "runCycle":
            command_start = request_str.find('\r\n\r\n') + 4
            command_json = request_str[command_start:]
            print(command_start)
            print(command_json)
            # Parse the JSON data from the request (e.g., sceneSteps and cycleTime)
            data = ujson.loads(command_json)  # Adjust according to your actual request parsing
            cycle_time = int(data['cycleTime'])  # Extract the cycle time (hours)
            scene_steps = data['sceneSteps']  # Extract the scene steps (effects, colors, etc.)

            # Start the cycle in a separate thread so it doesn't block the server
            _thread.start_new_thread(run_cycle, (cycle_time, scene_steps))
            cycle_running = True
    else:
        conn.send('HTTP/1.0 400 BAD REQUEST\r\n\r\n')

    conn.close()


def main():
    failure_count = 0  # Track consecutive failures
    max_failures = 5   # Number of allowed failures before reboot

    while True:
        try:
            conn, addr = s.accept()
            print('Connection from', addr)
            handle_request(conn)
            failure_count = 0  # Reset failure count after success
        except Exception as e:
            print("Exception occurred:", e)
            failure_count += 1
            if failure_count >= max_failures:
                print("Too many failures, rebooting ESP32...")
                time.sleep(2)
                machine.reset()
        finally:
            conn.close()  # Ensure connection is always closed


# Program Start
main()
