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
            />
          </div>

          <div class="setting-item">
            <div class="setting-label">Found 3 WLED device (s).</div>
            <div class="setting-sublabel">Tap to select</div>

            <div class="wled-devices-list">
              <div
                class="wled-device-item"
                v-for="device in wledDevices"
                :key="device.ip"
                :class="{ selected: device.selected }"
                @click="selectDevice(device)"
              >
                <div class="device-info">
                  <div class="device-name">{{ device.name }}</div>
                  <div class="device-ip">IP: {{ device.ip }}</div>
                </div>
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
      { name: "Living Room Led Strip", ip: "192.168.1.101", selected: true },
      { name: "Kitchen Under Cabinet", ip: "192.168.1.101", selected: false },
      { name: "Main Accent Light", ip: "192.168.1.101", selected: false },
    ]);

    // Load IP Address from local storage on page reload
    onMounted(() => {
      const savedIp = localStorage.getItem("ipAddress");
      if (savedIp) {
        ipAddress.value = savedIp;
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

    return {
      ipAddress,
      deviceName,
      deviceMac,
      fileStatus,
      availableNetworks,
      wledDevices,
      saveIpAddress,
      validateIpAddress,
      selectDevice,
      checkForUpdates,
      chooseFile,
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
  height: calc(100vh - 90px);
  overflow: hidden;
  position: relative;
}

.content-area-settings {
  margin-top: 100px;
  margin-bottom: 10px;
  height: calc(100vh - 90px);
  overflow-y: auto;
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

.network-item:last-child {
  margin-bottom: 0;
}

.network-item .q-icon {
  color: var(--controls-icon-color);
}

.network-name {
  flex: 1;
  font-size: 14px;
  color: var(--controls-label-color);
}

.network-type {
  font-size: 12px;
  color: var(--controls-icon-color);
}

.wled-devices-list {
  background-color: var(--controls-input-field-bg-color);
  border-radius: 6px;
  padding: 8px;
}

.wled-device-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 4px;
  background-color: var(--controls-dropdown-menu--color);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.wled-device-item:hover {
  background-color: var(--controls-bg-color);
}

.wled-device-item.selected {
  background-color: var(--controls-slider-bar--color);
}

.wled-device-item:last-child {
  margin-bottom: 0;
}

.device-info {
  flex: 1;
}

.device-name {
  font-size: 14px;
  color: var(--controls-label-color);
  font-weight: 500;
}

.device-ip {
  font-size: 12px;
  color: var(--controls-icon-color);
}

.device-input {
  margin-top: 4px;
}

.device-input :deep(.q-field__control) {
  background-color: var(--controls-input-field-bg-color) !important;
  border-radius: 4px;
}

.device-input :deep(.q-field__native) {
  color: var(--controls-label-color) !important;
}

.device-mac {
  font-size: 14px;
  color: var(--controls-icon-color);
  background-color: var(--controls-input-field-bg-color);
  padding: 8px 12px;
  border-radius: 4px;
}

.firmware-info {
  background-color: var(--controls-input-field-bg-color);
  border-radius: 6px;
  padding: 12px;
}

.firmware-version {
  font-size: 14px;
  color: var(--controls-label-color);
  font-weight: 500;
  margin-bottom: 8px;
}

.app-version {
  font-size: 12px;
  color: var(--controls-icon-color);
  margin-bottom: 4px;
}

.version-number {
  font-size: 14px;
  color: var(--controls-label-color);
}

.update-btn,
.upload-btn {
  font-size: 12px;
  color: var(--controls-button--color);
}

.upload-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.file-status {
  font-size: 12px;
  color: var(--controls-icon-color);
  flex: 1;
}
</style>
