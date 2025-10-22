//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// SettingsPage.vue
//
// Application settings page
//
// Author: Tavis Hord - tavis@sideburn.com
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-page class="no-text-select">
    <!-- Fixed Header Container -->
    <div class="header-container">
      <!-- Left Icon - Back Arrow -->
      <div class="header-icon left-icon clickable" @click="goBack">
        <q-icon name="arrow_back" size="24px" />
      </div>

      <!-- Center Text -->
      <div class="header-title">SETTINGS</div>

      <!-- Right Icon - Empty for balance -->
      <div class="header-icon right-icon"></div>
    </div>

    <!-- Scrollable Content Area -->
    <div class="content-area-settings">
      <div class="content-padding">
        <!-- Wi-Fi / Network Settings -->
        <div class="settings-section">
          <div class="section-header">
            <q-icon name="wifi" size="20px" />
            <span>Wi-Fi / Network Settings</span>
          </div>

          <div class="setting-item">
            <div class="setting-label">Current Network Status</div>
            <div class="network-status">
              <div class="status-row">
                <q-icon name="check_circle" size="16px" color="green" />
                <span class="status-text">Connected to: Home WiFi_5G</span>
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="Disconnect"
                  class="disconnect-btn"
                  @click="disconnectFromDevice"
                />
              </div>
            </div>
          </div>

          <div class="setting-item">
            <div class="setting-label">Available Networks</div>
            <q-btn
              flat
              dense
              size="sm"
              icon="search"
              label="Scan Network"
              class="scan-btn"
              @click="scanNetworks"
            />
            <div class="networks-list">
              <div
                class="network-item"
                v-for="network in availableNetworks"
                :key="network.name"
              >
                <q-icon name="wifi" size="16px" />
                <span class="network-name">{{ network.name }}</span>
                <span class="network-type">{{ network.type }}</span>
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="Connect"
                  class="connect-btn"
                  @click="connectToNetwork(network)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- WLED Instance Search -->
        <div class="settings-section">
          <div class="section-header">
            <q-icon name="settings" size="20px" />
            <span>WLED Instance Search</span>
            <q-btn
              flat
              dense
              size="sm"
              icon="search"
              label="Search Devices"
              class="search-btn"
              @click="searchForDevices"
            />
          </div>

          <div class="setting-item">
            <!-- Add device inputs so users can supply an IP (temporary until dynamic discovery is implemented) -->
            <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
              <q-input v-model="newDeviceName" dense placeholder="Device name" />
              <q-input v-model="newDeviceIp" dense placeholder="Device IP (e.g. 192.168.1.100)" />
              <q-btn flat dense size="sm" label="Add" @click="addWledDevice" />
            </div>

            <div class="setting-label">Found {{ wledDevices.length }} WLED device(s).</div>
            <div class="setting-sublabel">Tap to select</div>

            <div class="wled-devices-list">
              <div
                class="wled-device-item"
                v-for="device in wledDevices"
                :key="device.ip + device.name"
                :class="{ selected: device.selected }"
              >
                <div class="device-info" @click="selectDevice(device)">
                  <div class="device-name">{{ device.name }}</div>
                  <!-- Make the device IP editable so testers can input real IPs -->
                  <div style="display:flex; gap:8px; align-items:center;">
                    <q-input
                      dense
                      style="width: 180px"
                      v-model="device.ip"
                      placeholder="192.168.x.x"
                    />
                    <q-btn flat dense size="sm" label="Save IP" @click.stop="saveDeviceIp(device)" />
                  </div>
                </div>
                <div class="device-actions">
                  <q-btn
                    flat
                    dense
                    size="sm"
                    label="Connect"
                    class="connect-btn"
                    @click.stop="connectToDevice(device)"
                  />
                  <q-icon
                    v-if="device.selected"
                    name="radio_button_checked"
                    size="20px"
                    color="black"
                  />
                  <q-icon
                    v-else
                    name="radio_button_unchecked"
                    size="20px"
                    color="grey-5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Device Information -->
        <div class="settings-section">
          <div class="section-header">
            <q-icon name="info" size="20px" />
            <span>Device Information</span>
          </div>

          <div class="setting-item">
            <div class="setting-label">Device Name</div>
            <q-input
              v-model="deviceName"
              outlined
              dense
              class="device-input"
              placeholder="Enter device name"
            />
          </div>

          <div class="setting-item">
            <div class="setting-label">Device MAC</div>
            <div class="device-mac">{{ deviceMac }}</div>
          </div>

          <!-- Add IP input and save -->
          <div class="setting-item">
            <div class="setting-label">Device IP</div>
            <div style="display:flex; gap:8px; align-items:center;">
              <q-input
                v-model="ipAddress"
                outlined
                dense
                class="device-input"
                placeholder="192.168.x.x"
              />
              <q-btn flat dense size="sm" label="Save" @click="saveIpAddress" />
            </div>
          </div>
        </div>

        <!-- Firmware Update -->
        <div class="settings-section">
          <div class="section-header">
            <q-icon name="system_update" size="20px" />
            <span>Firmware Update</span>
          </div>

          <div class="setting-item">
            <div class="setting-label">Current WLED Firmware</div>
            <div class="firmware-info">
              <div class="firmware-version">WLED 0.14.1</div>
              <div class="app-version">App Version</div>
              <div class="version-number">v2.10</div>
            </div>
          </div>

          <div class="setting-item">
            <q-btn
              flat
              dense
              icon="refresh"
              label="Check For Updates"
              class="update-btn"
              @click="checkForUpdates"
            />
          </div>

          <div class="setting-item">
            <div class="setting-label">Upload Custom Firmware</div>
            <div class="upload-section">
              <q-btn
                flat
                dense
                icon="upload_file"
                label="Choose File"
                class="upload-btn"
                @click="chooseFile"
              />
              <span class="file-status">{{ fileStatus }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import webservices from "../webservices";

export default {
  name: "SettingsPage",
  setup() {
    const ipAddress = ref("4.3.2.1");
    const deviceName = ref("Living Room Led Strip");
    const deviceMac = ref("IP: 192.168.1.101");
    const fileStatus = ref("No File Chosen");

    const availableNetworks = ref([
      { name: "Home WiFi_5G", type: "WPA2" },
      { name: "Neighbor WiFi_5G", type: "WPA2" },
    ]);

    const wledDevices = ref([
      { name: "Living Room Grid", ip: "192.168.1.101", selected: true },
      { name: "Kitchen Grid", ip: "192.168.1.102", selected: false },
      { name: "Main Area Grid", ip: "192.168.1.103", selected: false },
    ]);

    const newDeviceName = ref("");
    const newDeviceIp = ref("");

    // Load IP Address from local storage on page reload
    onMounted(() => {
      const savedIp = localStorage.getItem("ipAddress");
      if (savedIp) {
        ipAddress.value = savedIp;
      }
      // Load persisted WLED devices if present
      try {
        const saved = localStorage.getItem('wledDevices');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length) {
            // Replace default list with persisted devices
            wledDevices.value = parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to load persisted wledDevices', e);
      }
    });

    const saveIpAddress = () => {
      console.log("Saved IP Address: http://" + ipAddress.value);
      localStorage.setItem("ipAddress", ipAddress.value);
    };

    const validateIpAddress = (value) => {
      const validIpPattern = /^\d{0,3}(\.\d{0,3}){0,3}$/;
      if (validIpPattern.test(value)) {
        ipAddress.value = value;
      }
    };

    const selectDevice = (device) => {
      wledDevices.value.forEach((d) => (d.selected = false));
      device.selected = true;
    };

    const checkForUpdates = () => {
      console.log("Checking for updates...");
    };

    const chooseFile = () => {
      console.log("Choosing file...");
      // This would trigger a file picker
    };

    const connectToDevice = (device) => {
      try {
        if (!device || !device.ip) {
          console.warn('No IP set for device, cannot connect:', device && device.name);
          return;
        }
        console.log("Connecting to device:", device.ip);
        // Persist IP
        localStorage.setItem("ipAddress", device.ip);
        ipAddress.value = device.ip;
        const wsUrl = `ws://${device.ip}:80/ws`;
        webservices.initWebSocket(
          wsUrl,
          (msg) => console.log("WS MSG:", msg),
          (live) => console.log("WS LIVE:", live),
          webservices.subscribeToLiveStream
        );
        // mark selected
        selectDevice(device);
      } catch (err) {
        console.error("Failed to connect to device:", err);
      }
    };

    const persistWledDevices = () => {
      try {
        localStorage.setItem('wledDevices', JSON.stringify(wledDevices.value));
      } catch (e) {
        console.warn('Failed to persist wledDevices', e);
      }
    };

    const addWledDevice = () => {
      if (!newDeviceName.value) {
        console.warn('Device name required');
        return;
      }
      wledDevices.value.push({ name: newDeviceName.value, ip: newDeviceIp.value || '', selected: false });
      newDeviceName.value = '';
      newDeviceIp.value = '';
      persistWledDevices();
    };

    const saveDeviceIp = (device) => {
      if (!device || !device.ip) {
        console.warn('Device IP empty, nothing to save');
        return;
      }
      // Optionally update the main ipAddress field so connect flows can use it
      localStorage.setItem('ipAddress', device.ip);
      ipAddress.value = device.ip;
      persistWledDevices();
      console.log('Saved device IP for', device.name, device.ip);
    };

    const disconnectFromDevice = () => {
      console.log("Disconnecting from device...");
      try {
        // Use optional chaining to avoid fragile existence checks
        webservices.unsubscribeFromLiveStream?.();
      } catch (e) {
        /* ignore */
      }
      try {
        webservices.closeWebSocket?.();
      } catch (e) {
        /* ignore */
      }
    };

    const scanNetworks = () => {
      console.log("Scanning networks (placeholder)...");
      // placeholder - implement actual scan if desired
    };

    const searchForDevices = () => {
      console.log("Searching for WLED devices (placeholder)...");
      // placeholder - implement actual discovery if desired
    };

    // Placeholder/stub for connecting to a Wi-Fi network from the UI list.
    // Keep behavior minimal and consistent with other placeholders in this file.
    const connectToNetwork = (network) => {
      try {
        console.log("connectToNetwork placeholder - selected network:", network);
        // placeholder - implement actual network connection flow if desired
      } catch (err) {
        // Include an identifier for easier debugging
        const id = network && (network.name || network.ssid || network.id) ? (network.name || network.ssid || network.id) : network;
        console.error('connectToNetwork failed for', id, err);
      }
    };

    return {
      ipAddress,
      deviceName,
      deviceMac,
      fileStatus,
      availableNetworks,
      wledDevices,
      newDeviceName,
      newDeviceIp,
      saveIpAddress,
      validateIpAddress,
      selectDevice,
      checkForUpdates,
      chooseFile,
      connectToDevice,
      connectToNetwork,
      disconnectFromDevice,
      addWledDevice,
      saveDeviceIp,
      scanNetworks,
      searchForDevices,
    };
  },
  methods: {
    goBack() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.clickable {
  cursor: pointer;
  transition: opacity 0.2s ease;
  border-radius: 50%;
}

.clickable:hover {
  opacity: 0.7;
}

.q-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* allow natural page height */
  overflow: visible; /* avoid clipping inner content */
  position: relative;
}

.content-area-settings {
  /* Provide clearance for fixed header and footer */
  padding-top: 110px; /* approx header offset (55) + header height (40) + spacing */
  padding-bottom: 80px; /* space for bottom nav/footer */
  margin: 0;
  min-height: calc(100vh - 130px);
  overflow: visible; /* let child sections size naturally */
}

.content-padding {
  margin-top: 10px;
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-section {
  background-color: var(--controls-bg-color);
  border-radius: 8px;
  padding: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--controls-label-color);
  margin-bottom: 15px;
}

.section-header svg,
.section-header .q-icon {
  color: var(--controls-icon-color);
}

.search-btn,
.scan-btn {
  margin-left: auto;
  font-size: 12px;
  color: var(--controls-button--color);
}

.setting-item {
  margin-bottom: 15px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--controls-label-color);
  margin-bottom: 8px;
}

.setting-sublabel {
  font-size: 12px;
  color: var(--controls-icon-color);
  margin-bottom: 12px;
}

.network-status {
  background-color: var(--controls-input-field-bg-color);
  border-radius: 6px;
  padding: 12px;
}

.status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-text {
  flex: 1;
  font-size: 14px;
  color: var(--controls-label-color);
}

.disconnect-btn,
.connect-btn {
  font-size: 12px;
  color: var(--controls-icon-color);
}

.networks-list {
  background-color: var(--controls-input-field-bg-color);
  border-radius: 6px;
  padding: 8px;
  margin-top: 8px;
}

.network-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  margin-bottom: 4px;
  background-color: var(--controls-dropdown-menu--color);
  border-radius: 4px;
}

.wled-device-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  margin-bottom: 8px;
  background-color: var(--controls-input-field-bg-color);
  border-radius: 6px;
}

.device-info {
  flex: 1;
  cursor: pointer;
}

.device-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Ensure Quasar inputs are readable on light theme */
:deep(.q-field__control) {
  background-color: var(--controls-input-field-bg-color) !important;
  border-radius: 6px;
}

:deep(.q-field__native),
:deep(.q-field__label) {
  color: var(--controls-label-color) !important;
}
</style>
