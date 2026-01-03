//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// SettingsPage.vue // // Application settings page // // Author: Tavis Hord -
tavis@sideburn.com
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-page class="no-text-select settings-page">
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

    <!-- Tabs Container -->
    <div class="tabs-container">
      <q-tabs
        v-model="activeTab"
        dense
        class="settings-tabs"
        active-color="primary"
        indicator-color="primary"
        align="center"
        narrow-indicator
      >
        <q-tab name="network" label="Device" />
        <q-tab name="device" label="Browser" />
      </q-tabs>
    </div>

    <!-- Scrollable Content Area -->
    <div class="content-area-settings">
      <q-tab-panels v-model="activeTab" animated class="tab-panels">
        <!-- Network Tab Panel -->
        <q-tab-panel name="network" class="tab-panel-content">
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
                    :class="{
                      selected: device.selected,
                      analyzing: device.analyzing,
                    }"
                    @click="selectDevice(device)"
                  >
                    <div class="device-info">
                      <div class="device-name">{{ device.name }}</div>
                      <div class="device-ip">IP: {{ device.ip }}</div>
                      <div
                        v-if="device.customEffectCount > 0"
                        class="device-custom-effects"
                      >
                        {{ device.customEffectCount }} custom effect(s)
                      </div>
                    </div>
                    <q-spinner
                      v-if="device.analyzing"
                      color="primary"
                      size="20px"
                    />
                    <q-icon
                      v-else-if="device.selected"
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
        </q-tab-panel>

        <!-- Device Tab Panel -->
        <q-tab-panel name="device" class="tab-panel-content">
          <div class="content-padding">
            <!-- IP Address Section -->
            <div class="settings-section">
              <div class="section-header">
                <q-icon name="language" size="20px" />
                <span>Connection Settings</span>
              </div>

              <div class="setting-item">
                <div class="setting-label">IP Address</div>
                <div class="ip-input-row">
                  <div
                    class="connection-indicator"
                    :title="getConnectionLabel()"
                  >
                    <q-icon
                      :name="getConnectionIcon()"
                      :color="getConnectionColor()"
                      size="24px"
                    />
                    <span
                      class="connection-label"
                      :style="{ color: getConnectionColor() }"
                    >
                      {{ getConnectionLabel() }}
                    </span>
                  </div>
                  <q-input
                    v-model="ipAddress"
                    type="text"
                    outlined
                    dense
                    class="device-input"
                    @update:model-value="validateIpAddress"
                  >
                    <template v-slot:prepend>
                      <span class="ip-prefix">http://</span>
                    </template>
                  </q-input>
                </div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="save-section">
              <q-btn
                flat
                dark
                :ripple="false"
                class="save-btn"
                label="Save"
                @click="saveIpAddress"
              />
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import webservices, { ConnectionState } from "../webservices";

export default {
  name: "SettingsPage",
  setup() {
    const activeTab = ref("device");
    const ipAddress = ref("4.3.2.1");
    const deviceName = ref("Living Room Led Strip");
    const deviceMac = ref("IP: 192.168.1.101");
    const fileStatus = ref("No File Chosen");
    const connectionState = ref(webservices.getConnectionState());

    const availableNetworks = ref([
      { name: "Home WiFi_5G", type: "WPA2" },
      { name: "Neighbor WiFi_5G", type: "WPA2" },
    ]);

    const wledDevices = ref([
      {
        name: "Living Room Grid",
        ip: "192.168.1.101",
        selected: true,
        analyzing: false,
        customEffectCount: 0,
      },
      {
        name: "Kitchen Grid",
        ip: "192.168.1.102",
        selected: false,
        analyzing: false,
        customEffectCount: 0,
      },
      {
        name: "Main Area Grid",
        ip: "192.168.1.103",
        selected: false,
        analyzing: false,
        customEffectCount: 0,
      },
    ]);

    // Load settings from local storage on page reload
    onMounted(() => {
      const savedIp = localStorage.getItem("ipAddress");
      if (savedIp) {
        ipAddress.value = savedIp;
      }

      // Set up connection state listener
      connectionState.value = webservices.getConnectionState();
      webservices.onConnectionStateChange = (state) => {
        connectionState.value = state;
      };

      // Load any existing analysis data for devices
      wledDevices.value.forEach((device) => {
        const analysis = webservices.getStoredAnalysis(device.ip);
        if (analysis) {
          device.customEffectCount = analysis.effects.customCount;
          if (
            analysis.deviceInfo.name &&
            analysis.deviceInfo.name !== "Unknown"
          ) {
            device.name = analysis.deviceInfo.name;
          }
        }
      });
    });

    onUnmounted(() => {
      // Clean up listener
      webservices.onConnectionStateChange = null;
    });

    // Get color for connection state indicator
    const getConnectionColor = () => {
      switch (connectionState.value) {
        case ConnectionState.CONNECTED:
          return "green";
        case ConnectionState.CONNECTING:
        case ConnectionState.RECONNECTING:
          return "orange";
        case ConnectionState.FAILED:
          return "red";
        case ConnectionState.DISCONNECTED:
        default:
          return "grey";
      }
    };

    // Get icon for connection state
    const getConnectionIcon = () => {
      switch (connectionState.value) {
        case ConnectionState.CONNECTED:
          return "check_circle";
        case ConnectionState.CONNECTING:
        case ConnectionState.RECONNECTING:
          return "sync";
        case ConnectionState.FAILED:
          return "error";
        case ConnectionState.DISCONNECTED:
        default:
          return "cancel";
      }
    };

    // Get label for connection state
    const getConnectionLabel = () => {
      switch (connectionState.value) {
        case ConnectionState.CONNECTED:
          return "Connected";
        case ConnectionState.CONNECTING:
          return "Connecting...";
        case ConnectionState.RECONNECTING:
          return "Reconnecting...";
        case ConnectionState.FAILED:
          return "Failed";
        case ConnectionState.DISCONNECTED:
        default:
          return "Disconnected";
      }
    };

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

    const selectDevice = async (device) => {
      // Don't allow selection while analyzing
      if (device.analyzing) {
        return;
      }

      // Deselect all devices
      wledDevices.value.forEach((d) => (d.selected = false));
      device.selected = true;

      // Start analysis
      device.analyzing = true;

      try {
        console.log(`Initializing WLED device at ${device.ip}...`);

        // Use the initialization routine which analyzes AND sets All White
        const result = await webservices.initializeNewDevice(device.ip);

        // Update device with custom effect count
        device.customEffectCount = result.analysis.effects.customCount;

        // Update device name if available from device info
        if (
          result.analysis.deviceInfo.name &&
          result.analysis.deviceInfo.name !== "Unknown"
        ) {
          device.name = result.analysis.deviceInfo.name;
        }

        console.log("Device initialized:", result);

        // Show success notification
        // You can add Quasar notification here if desired
      } catch (error) {
        console.error("Error initializing WLED device:", error);
        // Show error notification
        // You can add Quasar notification here if desired
      } finally {
        device.analyzing = false;
      }
    };

    const checkForUpdates = () => {
      console.log("Checking for updates...");
    };

    const chooseFile = () => {
      console.log("Choosing file...");
      // This would trigger a file picker
    };

    return {
      activeTab,
      ipAddress,
      deviceName,
      deviceMac,
      fileStatus,
      availableNetworks,
      wledDevices,
      connectionState,
      saveIpAddress,
      validateIpAddress,
      selectDevice,
      checkForUpdates,
      chooseFile,
      getConnectionColor,
      getConnectionIcon,
      getConnectionLabel,
    };
  },
  methods: {
    goBack() {
      this.$router.push("/");
    },
  },
};
</script>

<!-- Styles moved to src/css/pages/SettingsPage.scss -->
