//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
// SequencerPage.vue
//
// Sequencer page - Create presets and playlists using WLED native capabilities
//
// Author: Tavis Hord - tavis@sideburn.com
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

<template>
  <q-page class="no-text-select sequencer-page">
    <!-- Fixed Header Container -->
    <div class="header-container">
      <div class="header-title">SEQUENCER</div>
    </div>

    <!-- Tab Navigation -->
    <div class="tab-navigation">
      <button
        :class="['tab-btn', { active: activeTab === 'presets' }]"
        @click="activeTab = 'presets'"
      >
        <q-icon name="save" size="18px" />
        Presets
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'playlist' }]"
        @click="activeTab = 'playlist'"
      >
        <q-icon name="playlist_play" size="18px" />
        Playlist
      </button>
    </div>

    <!-- Scrollable Content Area -->
    <div class="content-area-sequencer">
      <!-- ============================================ -->
      <!-- PRESETS TAB -->
      <!-- ============================================ -->
      <div v-if="activeTab === 'presets'" class="content-padding">

        <!-- Presets Section -->
        <div class="section-card">
          <div class="section-header">
            <q-icon name="bookmark" size="20px" class="section-icon" />
            <span>Presets</span>
            <q-btn
              icon="refresh"
              flat
              round
              size="sm"
              @click="loadPresets"
              :loading="isLoadingPresets"
            />
          </div>

          <!-- Add New Preset Button -->
          <div
            class="add-preset-row"
            :class="{ expanded: isAddingNew }"
            @click="toggleAddNew"
          >
            <div class="preset-row-header">
              <q-icon :name="isAddingNew ? 'remove' : 'add'" size="20px" />
              <span class="add-preset-label">Add New Preset</span>
              <q-icon
                :name="isAddingNew ? 'expand_less' : 'expand_more'"
                size="20px"
                class="expand-icon"
              />
            </div>

            <!-- Expandable Configuration Panel -->
            <div v-if="isAddingNew" class="preset-config-panel" @click.stop>
              <div class="config-content">
                <!-- Preset Name Input -->
                <div class="control-group">
                  <label class="control-label">
                    <q-icon name="label" size="16px" />
                    Preset Name
                  </label>
                  <input
                    v-model="newPresetName"
                    type="text"
                    class="text-input"
                    placeholder="Enter preset name..."
                  />
                </div>

                <!-- Effect Selector -->
                <div class="control-group">
                  <label class="control-label">
                    <q-icon name="auto_awesome" size="16px" />
                    Effect
                  </label>
                  <select v-model="selectedEffectId" class="effect-select" @change="onEffectChange">
                    <option value="">Select Effect</option>
                    <option
                      v-for="effect in effectsList"
                      :key="effect.id"
                      :value="effect.effectId"
                    >
                      {{ effect.label }}
                    </option>
                  </select>
                </div>

                <!-- Speed Slider -->
                <div class="control-group slider-group">
                  <label class="control-label">
                    <q-icon name="speed" size="16px" />
                    Speed
                    <span class="value-badge">{{ effectSpeed }}</span>
                  </label>
                  <q-slider
                    v-model="effectSpeed"
                    :min="0"
                    :max="255"
                    color="black"
                    track-color="grey-3"
                  />
                </div>

                <!-- Intensity Slider -->
                <div class="control-group slider-group">
                  <label class="control-label">
                    <q-icon name="flare" size="16px" />
                    Intensity
                    <span class="value-badge">{{ effectIntensity }}</span>
                  </label>
                  <q-slider
                    v-model="effectIntensity"
                    :min="0"
                    :max="255"
                    color="black"
                    track-color="grey-3"
                  />
                </div>

                <!-- Brightness Slider -->
                <div class="control-group slider-group">
                  <label class="control-label">
                    <q-icon name="brightness_6" size="16px" />
                    Brightness
                    <span class="value-badge">{{ effectBrightness }}</span>
                  </label>
                  <q-slider
                    v-model="effectBrightness"
                    :min="0"
                    :max="255"
                    color="black"
                    track-color="grey-3"
                  />
                </div>

                <!-- Default Duration -->
                <div class="control-group duration-group">
                  <label class="control-label">
                    <q-icon name="timer" size="16px" />
                    Default Duration
                    <span class="value-badge">{{ newPresetDuration }}s</span>
                  </label>
                  <div class="duration-input-row">
                    <q-slider
                      v-model="newPresetDuration"
                      :min="1"
                      :max="120"
                      color="black"
                      track-color="grey-3"
                      class="duration-slider"
                    />
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                  <q-btn
                    icon="visibility"
                    label="Preview"
                    unelevated
                    class="preview-btn"
                    @click="previewEffect"
                    :disable="!selectedEffectId"
                  />
                  <q-btn
                    icon="save"
                    label="Save Preset"
                    unelevated
                    class="save-btn"
                    @click="saveNewPreset"
                    :disable="!selectedEffectId || !newPresetName"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Saved Presets List -->
          <div class="presets-list" v-if="Object.keys(savedPresets).length > 0">
            <div
              v-for="(preset, id) in savedPresets"
              :key="id"
              class="preset-row"
              :class="{ expanded: expandedPresetId === parseInt(id), active: currentPresetId === parseInt(id) }"
            >
              <!-- Preset Row Header (collapsed view) -->
              <div class="preset-row-header" @click="togglePresetExpand(parseInt(id), preset)">
                <div class="preset-info">
                  <q-icon name="bookmark" size="18px" class="preset-icon" />
                  <div class="preset-name">{{ preset.n || `Preset ${id}` }}</div>
                  <div class="preset-duration" v-if="getPresetDuration(parseInt(id))">
                    <q-icon name="timer" size="14px" />
                    {{ getPresetDuration(parseInt(id)) }}s
                  </div>
                </div>
                <div class="preset-actions" @click.stop>
                  <q-btn
                    icon="play_arrow"
                    flat
                    round
                    size="sm"
                    @click="applyPreset(parseInt(id))"
                    title="Play preset"
                  />
                  <q-btn
                    icon="playlist_add"
                    flat
                    round
                    size="sm"
                    @click="addPresetToPlaylist(parseInt(id), preset.n || `Preset ${id}`)"
                    title="Add to playlist"
                  />
                  <q-icon
                    :name="expandedPresetId === parseInt(id) ? 'expand_less' : 'expand_more'"
                    size="20px"
                    class="expand-icon"
                  />
                </div>
              </div>

              <!-- Expandable Configuration Panel -->
              <div v-if="expandedPresetId === parseInt(id)" class="preset-config-panel">
                <div class="config-content">
                  <!-- Preset Name (read-only display) -->
                  <div class="preset-id-display">
                    <span class="id-label">ID: {{ id }}</span>
                  </div>

                  <!-- Effect Selector -->
                  <div class="control-group">
                    <label class="control-label">
                      <q-icon name="auto_awesome" size="16px" />
                      Effect
                    </label>
                    <select v-model="editEffectId" class="effect-select" @change="onEditEffectChange">
                      <option value="">Select Effect</option>
                      <option
                        v-for="effect in effectsList"
                        :key="effect.id"
                        :value="effect.effectId"
                      >
                        {{ effect.label }}
                      </option>
                    </select>
                  </div>

                  <!-- Speed Slider -->
                  <div class="control-group slider-group">
                    <label class="control-label">
                      <q-icon name="speed" size="16px" />
                      Speed
                      <span class="value-badge">{{ editSpeed }}</span>
                    </label>
                    <q-slider
                      v-model="editSpeed"
                      :min="0"
                      :max="255"
                      color="black"
                      track-color="grey-3"
                    />
                  </div>

                  <!-- Intensity Slider -->
                  <div class="control-group slider-group">
                    <label class="control-label">
                      <q-icon name="flare" size="16px" />
                      Intensity
                      <span class="value-badge">{{ editIntensity }}</span>
                    </label>
                    <q-slider
                      v-model="editIntensity"
                      :min="0"
                      :max="255"
                      color="black"
                      track-color="grey-3"
                    />
                  </div>

                  <!-- Brightness Slider -->
                  <div class="control-group slider-group">
                    <label class="control-label">
                      <q-icon name="brightness_6" size="16px" />
                      Brightness
                      <span class="value-badge">{{ editBrightness }}</span>
                    </label>
                    <q-slider
                      v-model="editBrightness"
                      :min="0"
                      :max="255"
                      color="black"
                      track-color="grey-3"
                    />
                  </div>

                  <!-- Default Duration -->
                  <div class="control-group duration-group">
                    <label class="control-label">
                      <q-icon name="timer" size="16px" />
                      Default Duration
                      <span class="value-badge">{{ editDuration }}s</span>
                    </label>
                    <div class="duration-input-row">
                      <q-slider
                        v-model="editDuration"
                        :min="1"
                        :max="120"
                        color="black"
                        track-color="grey-3"
                        class="duration-slider"
                      />
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="action-buttons">
                    <q-btn
                      icon="visibility"
                      label="Preview"
                      unelevated
                      class="preview-btn"
                      @click="previewEditEffect"
                      :disable="!editEffectId"
                    />
                    <q-btn
                      icon="save"
                      label="Update Preset"
                      unelevated
                      class="save-btn"
                      @click="updateExistingPreset(parseInt(id), preset.n)"
                      :disable="!editEffectId"
                    />
                  </div>

                  <!-- Delete Button -->
                  <div class="delete-section">
                    <q-btn
                      icon="delete"
                      label="Delete Preset"
                      flat
                      class="delete-btn"
                      @click="deletePreset(parseInt(id))"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!isAddingNew" class="empty-state">
            <q-icon name="bookmark_border" size="40px" color="grey-5" />
            <div>No presets saved yet</div>
            <div class="empty-subtitle">Click "Add New Preset" above to create one</div>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- PLAYLIST TAB -->
      <!-- ============================================ -->
      <div v-if="activeTab === 'playlist'" class="content-padding">

        <!-- Playlist Builder -->
        <div class="section-card">
          <div class="section-header">
            <q-icon name="playlist_play" size="20px" class="section-icon" />
            <span>Playlist Builder</span>
          </div>

          <!-- Playlist Controls -->
          <div class="playlist-controls">
            <q-btn
              icon="play_arrow"
              label="Start"
              unelevated
              class="start-btn"
              @click="startPlaylist"
              :disable="playlistItems.length === 0"
            />
            <q-btn
              icon="skip_next"
              label="Next"
              unelevated
              class="next-btn"
              @click="nextPresetInPlaylist"
              :disable="!isPlaylistRunning"
            />
            <q-btn
              icon="stop"
              label="Stop"
              unelevated
              class="stop-btn"
              @click="stopPlaylist"
              :disable="!isPlaylistRunning"
            />
          </div>

          <!-- Playlist Settings -->
          <div class="playlist-settings">
            <div class="setting-item">
              <label>Repeat Count</label>
              <q-input
                v-model.number="playlistRepeat"
                type="number"
                dense
                outlined
                :min="0"
                hint="0 = infinite"
                class="setting-input"
              />
            </div>
            <div class="setting-item">
              <label>Transition (0.1s)</label>
              <q-input
                v-model.number="playlistTransition"
                type="number"
                dense
                outlined
                :min="0"
                class="setting-input"
              />
            </div>
          </div>

          <!-- Playlist Items -->
          <div class="playlist-items" v-if="playlistItems.length > 0">
            <div class="playlist-header-row">
              <span class="col-order">#</span>
              <span class="col-name">Preset</span>
              <span class="col-duration">Duration</span>
              <span class="col-actions"></span>
            </div>

            <draggable
              v-model="playlistItems"
              item-key="id"
              handle=".drag-handle"
              class="playlist-draggable"
            >
              <template #item="{ element, index }">
                <div class="playlist-item">
                  <span class="drag-handle">
                    <q-icon name="drag_indicator" size="20px" />
                  </span>
                  <span class="col-order">{{ index + 1 }}</span>
                  <span class="col-name">{{ element.name }}</span>
                  <span class="col-duration">
                    <q-input
                      v-model.number="element.duration"
                      type="number"
                      dense
                      outlined
                      :min="1"
                      suffix="s"
                      class="duration-input"
                    />
                  </span>
                  <span class="col-actions">
                    <q-btn
                      icon="play_arrow"
                      flat
                      round
                      size="sm"
                      @click="applyPreset(element.presetId)"
                      title="Preview"
                    />
                    <q-btn
                      icon="close"
                      flat
                      round
                      size="sm"
                      color="negative"
                      @click="removeFromPlaylist(index)"
                    />
                  </span>
                </div>
              </template>
            </draggable>

            <div class="playlist-summary">
              Total duration: {{ totalPlaylistDuration }}s
            </div>
          </div>

          <div v-else class="empty-state">
            <q-icon name="playlist_add" size="40px" color="grey-5" />
            <div>Playlist is empty</div>
            <div class="empty-subtitle">Add presets from the Presets tab</div>
          </div>
        </div>

        <!-- Quick Add from Saved Presets -->
        <div class="section-card" v-if="Object.keys(savedPresets).length > 0">
          <div class="section-header">
            <q-icon name="add_circle" size="20px" class="section-icon" />
            <span>Quick Add Presets</span>
          </div>
          <div class="quick-add-grid">
            <q-btn
              v-for="(preset, id) in savedPresets"
              :key="id"
              :label="preset.n || `Preset ${id}`"
              unelevated
              class="quick-add-btn"
              @click="addPresetToPlaylist(parseInt(id), preset.n || `Preset ${id}`)"
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import draggable from "vuedraggable";
import webservices from "../webservices";

export default {
  name: "SequencerPage",

  components: {
    draggable,
  },

  setup() {
    // Tab state
    const activeTab = ref("presets");

    // Loading states
    const isLoadingPresets = ref(false);

    // Presets data
    const savedPresets = ref({});
    const currentPresetId = ref(null);

    // Expand/collapse state
    const isAddingNew = ref(false);
    const expandedPresetId = ref(null);

    // Effects data - matching Home page pattern
    const effectsList = ref([
      { id: 1, label: "All White", effectName: "allWhite", effectId: null }
    ]);
    const palettes = ref([]);

    // New preset form state
    const newPresetName = ref("");
    const selectedEffectId = ref("");
    const selectedPaletteId = ref(0);
    const primaryColor = ref("#ffffff");
    const secondaryColor = ref("#ffffff");
    const tertiaryColor = ref("#ffffff");
    const effectSpeed = ref(128);
    const effectIntensity = ref(128);
    const effectBrightness = ref(200);
    const newPresetDuration = ref(10); // Default 10 seconds

    // Edit preset form state (for expanded rows)
    const editEffectId = ref("");
    const editPaletteId = ref(0);
    const editPrimaryColor = ref("#ffffff");
    const editSecondaryColor = ref("#ffffff");
    const editTertiaryColor = ref("#ffffff");
    const editSpeed = ref(128);
    const editIntensity = ref(128);
    const editBrightness = ref(200);
    const editDuration = ref(10);

    // Preset durations storage (local, since WLED doesn't store this)
    const presetDurations = ref({});

    // Load preset durations from localStorage
    const loadPresetDurations = () => {
      try {
        const stored = localStorage.getItem("gridlights_preset_durations");
        if (stored) {
          presetDurations.value = JSON.parse(stored);
        }
      } catch (error) {
        console.error("Error loading preset durations:", error);
      }
    };

    // Save preset durations to localStorage
    const savePresetDurations = () => {
      try {
        localStorage.setItem("gridlights_preset_durations", JSON.stringify(presetDurations.value));
      } catch (error) {
        console.error("Error saving preset durations:", error);
      }
    };

    // Get duration for a specific preset
    const getPresetDuration = (presetId) => {
      return presetDurations.value[presetId] || null;
    };

    // Set duration for a specific preset
    const setPresetDuration = (presetId, duration) => {
      presetDurations.value[presetId] = duration;
      savePresetDurations();
    };

    // Playlist data
    const playlistItems = ref([]);
    const playlistRepeat = ref(0);
    const playlistTransition = ref(7);
    const isPlaylistRunning = ref(false);

    // Get IP address
    const getIpAddress = () => {
      return localStorage.getItem("ipAddress") || "4.3.2.1";
    };

    // Load custom effects from localStorage
    const loadCustomEffects = () => {
      try {
        const wledUrl = getIpAddress();
        const analysis = webservices.getStoredAnalysis(wledUrl);

        if (analysis && analysis.effects.custom && analysis.effects.custom.length > 0) {
          let currentId = 1;
          const customEffectItems = analysis.effects.custom
            .filter(effect => {
              const name = effect.name || '';
              return !name.toUpperCase().includes('RSVD') && name.trim().length > 0;
            })
            .map(effect => ({
              id: currentId++,
              label: effect.name,
              effectName: effect.name,
              effectId: effect.id,
              isCustom: true
            }));

          const allWhiteItem = {
            id: currentId,
            label: "All White",
            effectName: "allWhite",
            effectId: null
          };

          const combinedList = [...customEffectItems, allWhiteItem];
          effectsList.value = combinedList.sort((a, b) =>
            a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })
          );
        } else {
          effectsList.value = [
            { id: 1, label: "All White", effectName: "allWhite", effectId: null }
          ];
        }
      } catch (error) {
        console.error("Sequencer: Error loading custom effects:", error);
      }
    };

    // Computed: Total playlist duration
    const totalPlaylistDuration = computed(() => {
      return playlistItems.value.reduce((sum, item) => sum + (item.duration || 0), 0);
    });

    // Toggle add new preset panel
    const toggleAddNew = () => {
      isAddingNew.value = !isAddingNew.value;
      if (isAddingNew.value) {
        expandedPresetId.value = null; // Close any expanded preset
        resetNewPresetForm();
      }
    };

    // Convert RGB array to hex color
    const rgbToHex = (rgb) => {
      if (!rgb || !Array.isArray(rgb) || rgb.length < 3) return "#000000";
      const r = Math.min(255, Math.max(0, rgb[0]));
      const g = Math.min(255, Math.max(0, rgb[1]));
      const b = Math.min(255, Math.max(0, rgb[2]));
      return "#" + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    };

    // Extract settings from a preset object
    const extractPresetSettings = (preset) => {
      const settings = {
        effectId: "",
        paletteId: 0,
        primaryColor: "#ffffff",
        secondaryColor: "#ffffff",
        tertiaryColor: "#ffffff",
        speed: 128,
        intensity: 128,
        brightness: 200
      };

      // Get brightness from preset
      if (preset.bri !== undefined) {
        settings.brightness = preset.bri;
      }

      // Get segment data (use first segment)
      const seg = preset.seg;
      if (seg && Array.isArray(seg) && seg.length > 0) {
        const firstSeg = seg[0];

        // Effect ID
        if (firstSeg.fx !== undefined) {
          settings.effectId = firstSeg.fx;
        }

        // Palette ID
        if (firstSeg.pal !== undefined) {
          settings.paletteId = firstSeg.pal;
        }

        // Speed
        if (firstSeg.sx !== undefined) {
          settings.speed = firstSeg.sx;
        }

        // Intensity
        if (firstSeg.ix !== undefined) {
          settings.intensity = firstSeg.ix;
        }
      }

      return settings;
    };

    // Toggle preset expand/collapse
    const togglePresetExpand = (presetId, preset) => {
      if (expandedPresetId.value === presetId) {
        expandedPresetId.value = null;
      } else {
        expandedPresetId.value = presetId;
        isAddingNew.value = false; // Close add new panel

        // Populate edit form with preset's actual data
        const settings = extractPresetSettings(preset);
        editEffectId.value = settings.effectId;
        editPaletteId.value = settings.paletteId;
        editPrimaryColor.value = settings.primaryColor;
        editSecondaryColor.value = settings.secondaryColor;
        editTertiaryColor.value = settings.tertiaryColor;
        editSpeed.value = settings.speed;
        editIntensity.value = settings.intensity;
        editBrightness.value = settings.brightness;

        // Load stored duration or use default
        editDuration.value = getPresetDuration(presetId) || 10;
      }
    };

    // Reset new preset form
    const resetNewPresetForm = () => {
      newPresetName.value = "";
      selectedEffectId.value = "";
      selectedPaletteId.value = 0;
      primaryColor.value = "#ffffff";
      secondaryColor.value = "#ffffff";
      tertiaryColor.value = "#ffffff";
      effectSpeed.value = 128;
      effectIntensity.value = 128;
      effectBrightness.value = 200;
      newPresetDuration.value = 10;
    };

    // Reset edit form
    const resetEditForm = () => {
      editEffectId.value = "";
      editPaletteId.value = 0;
      editPrimaryColor.value = "#ffffff";
      editSecondaryColor.value = "#ffffff";
      editTertiaryColor.value = "#ffffff";
      editSpeed.value = 128;
      editIntensity.value = 128;
      editBrightness.value = 200;
      editDuration.value = 10;
    };

    // Load presets from device
    const loadPresets = async () => {
      isLoadingPresets.value = true;
      try {
        const presets = await webservices.fetchWledPresets(getIpAddress());
        const filtered = {};
        for (const [id, preset] of Object.entries(presets)) {
          if (id !== "0" && preset && typeof preset === "object" && !Array.isArray(preset)) {
            filtered[id] = preset;
          }
        }
        savedPresets.value = filtered;
      } catch (error) {
        console.error("Error loading presets:", error);
      } finally {
        isLoadingPresets.value = false;
      }
    };

    // Load palettes from device
    const loadPalettes = async () => {
      try {
        const pals = await webservices.fetchWledPalettes(getIpAddress());
        palettes.value = pals;
      } catch (error) {
        console.error("Error loading palettes:", error);
        palettes.value = ["Default", "Random Cycle", "Primary Color", "Based on Primary", "Set Colors"];
      }
    };

    // Convert hex color to RGB array
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
      ] : [0, 0, 0];
    };

    // Preview effect (for new preset)
    const previewEffect = () => {
      const selectedItem = effectsList.value.find(e => e.effectId === selectedEffectId.value);

      if (selectedItem && selectedItem.effectName === "allWhite") {
        webservices.sendCommandToWebSocket({
          on: true,
          seg: [{ col: [[255, 255, 255]], fx: 0 }],
        });
      } else if (selectedEffectId.value !== null && selectedEffectId.value !== "") {
        webservices.applyEffect({
          effectId: parseInt(selectedEffectId.value),
          speed: effectSpeed.value,
          intensity: effectIntensity.value,
          palette: selectedPaletteId.value,
          colors: [
            hexToRgb(primaryColor.value),
            hexToRgb(secondaryColor.value),
            hexToRgb(tertiaryColor.value)
          ],
          brightness: effectBrightness.value,
        });
      }
    };

    // Preview effect (for edit)
    const previewEditEffect = () => {
      const selectedItem = effectsList.value.find(e => e.effectId === editEffectId.value);

      if (selectedItem && selectedItem.effectName === "allWhite") {
        webservices.sendCommandToWebSocket({
          on: true,
          seg: [{ col: [[255, 255, 255]], fx: 0 }],
        });
      } else if (editEffectId.value !== null && editEffectId.value !== "") {
        webservices.applyEffect({
          effectId: parseInt(editEffectId.value),
          speed: editSpeed.value,
          intensity: editIntensity.value,
          palette: editPaletteId.value,
          colors: [
            hexToRgb(editPrimaryColor.value),
            hexToRgb(editSecondaryColor.value),
            hexToRgb(editTertiaryColor.value)
          ],
          brightness: editBrightness.value,
        });
      }
    };

    // Handle effect change
    const onEffectChange = () => {
      if (selectedEffectId.value !== "" && selectedEffectId.value !== null) {
        previewEffect();
      }
    };

    // Handle edit effect change
    const onEditEffectChange = () => {
      if (editEffectId.value !== "" && editEffectId.value !== null) {
        previewEditEffect();
      }
    };

    // Get next available preset ID
    const getNextPresetId = () => {
      const usedIds = Object.keys(savedPresets.value).map(Number);
      for (let i = 1; i <= 250; i++) {
        if (!usedIds.includes(i)) {
          return i;
        }
      }
      return 1;
    };

    // Save new preset
    const saveNewPreset = async () => {
      try {
        previewEffect();
        await new Promise(resolve => setTimeout(resolve, 500));

        const presetId = getNextPresetId();
        await webservices.savePreset(
          getIpAddress(),
          presetId,
          newPresetName.value,
          { includeBrightness: true, saveSegmentBounds: true }
        );

        // Save the duration locally
        setPresetDuration(presetId, newPresetDuration.value);

        isAddingNew.value = false;
        resetNewPresetForm();
        await loadPresets();
      } catch (error) {
        console.error("Error saving preset:", error);
      }
    };

    // Update existing preset
    const updateExistingPreset = async (presetId, presetName) => {
      try {
        previewEditEffect();
        await new Promise(resolve => setTimeout(resolve, 500));

        await webservices.savePreset(
          getIpAddress(),
          presetId,
          presetName,
          { includeBrightness: true, saveSegmentBounds: true }
        );

        // Update the duration locally
        setPresetDuration(presetId, editDuration.value);

        expandedPresetId.value = null;
        await loadPresets();
      } catch (error) {
        console.error("Error updating preset:", error);
      }
    };

    // Apply a saved preset
    const applyPreset = (presetId) => {
      currentPresetId.value = presetId;
      webservices.applyPreset(presetId);
    };

    // Delete a preset
    const deletePreset = async (presetId) => {
      try {
        await webservices.deletePreset(getIpAddress(), presetId);
        expandedPresetId.value = null;
        await loadPresets();
        playlistItems.value = playlistItems.value.filter(item => item.presetId !== presetId);
      } catch (error) {
        console.error("Error deleting preset:", error);
      }
    };

    // Add preset to playlist
    const addPresetToPlaylist = (presetId, name) => {
      // Use stored duration or default to 10 seconds
      const duration = getPresetDuration(presetId) || 10;
      playlistItems.value.push({
        id: Date.now(),
        presetId,
        name,
        duration,
      });
    };

    // Remove from playlist
    const removeFromPlaylist = (index) => {
      playlistItems.value.splice(index, 1);
    };

    // Start playlist
    const startPlaylist = () => {
      if (playlistItems.value.length === 0) return;

      const presets = playlistItems.value.map(item => item.presetId);
      const durations = playlistItems.value.map(item => item.duration * 10);

      webservices.startPlaylist({
        presets,
        durations,
        transition: playlistTransition.value,
        repeat: playlistRepeat.value,
      });

      isPlaylistRunning.value = true;
    };

    // Stop playlist
    const stopPlaylist = () => {
      webservices.stopPlaylist();
      isPlaylistRunning.value = false;
    };

    // Next preset in playlist
    const nextPresetInPlaylist = () => {
      webservices.nextPlaylistPreset();
    };

    // Watch for new preset parameter changes
    watch([effectSpeed, effectIntensity, selectedPaletteId, primaryColor, secondaryColor, tertiaryColor, effectBrightness], () => {
      if (selectedEffectId.value && isAddingNew.value) {
        clearTimeout(window.effectPreviewTimeout);
        window.effectPreviewTimeout = setTimeout(() => {
          previewEffect();
        }, 300);
      }
    });

    // Watch for edit parameter changes
    watch([editSpeed, editIntensity, editPaletteId, editPrimaryColor, editSecondaryColor, editTertiaryColor, editBrightness], () => {
      if (editEffectId.value && expandedPresetId.value !== null) {
        clearTimeout(window.editPreviewTimeout);
        window.editPreviewTimeout = setTimeout(() => {
          previewEditEffect();
        }, 300);
      }
    });

    // Initialize on mount
    onMounted(async () => {
      loadCustomEffects();
      loadPresetDurations(); // Load stored durations
      await Promise.all([
        loadPresets(),
        loadPalettes(),
      ]);
    });

    return {
      // Tab state
      activeTab,

      // Loading states
      isLoadingPresets,

      // Presets
      savedPresets,
      currentPresetId,
      loadPresets,
      applyPreset,
      deletePreset,

      // Expand/collapse
      isAddingNew,
      expandedPresetId,
      toggleAddNew,
      togglePresetExpand,

      // Effects
      effectsList,
      palettes,

      // New preset form
      newPresetName,
      selectedEffectId,
      selectedPaletteId,
      primaryColor,
      secondaryColor,
      tertiaryColor,
      effectSpeed,
      effectIntensity,
      effectBrightness,
      newPresetDuration,
      previewEffect,
      onEffectChange,
      saveNewPreset,

      // Edit preset form
      editEffectId,
      editPaletteId,
      editPrimaryColor,
      editSecondaryColor,
      editTertiaryColor,
      editSpeed,
      editIntensity,
      editBrightness,
      editDuration,
      previewEditEffect,
      onEditEffectChange,

      // Preset durations
      getPresetDuration,
      updateExistingPreset,

      // Playlist
      playlistItems,
      playlistRepeat,
      playlistTransition,
      isPlaylistRunning,
      totalPlaylistDuration,
      addPresetToPlaylist,
      removeFromPlaylist,
      startPlaylist,
      stopPlaylist,
      nextPresetInPlaylist,
    };
  },
};
</script>

<!-- Styles in src/css/pages/SequencerPage.scss -->
