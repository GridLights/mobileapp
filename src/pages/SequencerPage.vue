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

          <!-- Expandable Configuration Panel (shown when isAddingNew) -->
          <div v-if="isAddingNew" class="preset-config-panel" @click.stop>
              <div class="config-content">
                <!-- Preset Name Input -->
                <div class="control-group">
                  <div class="name-label-row">
                    <label class="control-label">
                      <q-icon name="label" size="16px" />
                      Preset Name
                    </label>
                    <label class="auto-name-toggle">
                      <input
                        type="checkbox"
                        v-model="useAutoName"
                        @change="onAutoNameToggle"
                        class="auto-name-checkbox"
                      />
                      <span>Auto-name</span>
                    </label>
                  </div>
                  <div class="name-input-row">
                    <input
                      v-model="newPresetName"
                      type="text"
                      class="text-input"
                      :class="{ 'auto-filled': useAutoName }"
                      placeholder="Enter preset name..."
                    />
                    <button
                      class="reroll-btn"
                      @click="regenerateName"
                      title="Generate new name"
                    >↻</button>
                  </div>
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
                    <span class="value-badge">{{ Math.round(effectSpeed / 255 * 100) }}%</span>
                  </label>
                  <q-slider
                    v-model="effectSpeed"
                    :min="0"
                    :max="255"
                    color="black"
                    track-color="grey-3"
                  />
                </div>

                <!-- Frequency Slider -->
                <div class="control-group slider-group">
                  <label class="control-label">
                    <q-icon name="flare" size="16px" />
                    Frequency
                    <span class="value-badge">{{ Math.round(effectIntensity / 255 * 60) }} Hz</span>
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
                    <span class="value-badge">{{ Math.round(effectBrightness / 255 * 100) }}%</span>
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
                    :disable="selectedEffectId === ''"
                  />
                  <q-btn
                    icon="save"
                    label="Save"
                    unelevated
                    class="save-btn"
                    @click="saveNewPreset"
                    :disable="selectedEffectId === '' || !newPresetName"
                  />
                </div>
              </div>
            </div>

          <!-- Saved Presets List -->
          <div class="presets-list" v-if="Object.keys(savedPresets).length > 0">
            <!-- Column headers — mirror the grid-template-columns on .preset-row-header -->
            <div class="preset-list-header">
              <span></span><!-- expand icon -->
              <span></span><!-- bookmark icon -->
              <span>Name</span>
              <span>Pattern</span>
              <span>Duration</span>
            </div>
            <div
              v-for="(preset, id) in savedPresets"
              :key="id"
              class="preset-row"
              :class="{ expanded: expandedPresetId === parseInt(id), active: currentPresetId === parseInt(id) }"
            >
              <!-- Preset Row Header (collapsed view) -->
              <div class="preset-row-header" @click="togglePresetExpand(parseInt(id), preset)">
                <q-icon
                  :name="expandedPresetId === parseInt(id) ? 'arrow_drop_down' : 'arrow_right'"
                  size="30px"
                  class="expand-triangle"
                />
                <q-icon name="bookmark" size="18px" class="preset-icon" />
                <div class="preset-name">{{ preset.n || `Preset ${id}` }}</div>
                <div class="preset-effect-label">{{ getPresetEffectLabel(preset) || '' }}</div>
                <div class="preset-actions" @click.stop>
                  <div class="preset-duration">
                    <q-icon name="timer" size="14px" />
                    {{ getPresetDuration(parseInt(id)) || 10 }}s
                  </div>
                  <q-btn
                    icon="play_arrow"
                    unelevated
                    class="preset-play-btn"
                    @click="applyPreset(parseInt(id))"
                    title="Play preset"
                  />
                </div>
              </div>

              <!-- Expandable Configuration Panel -->
              <div v-if="expandedPresetId === parseInt(id)" class="preset-config-panel">
                <div class="config-content">

                  <!-- Effect Selector -->
                  <div class="control-group">
                    <label class="control-label">
                      <q-icon name="auto_awesome" size="16px" />
                      Effect
                      <span class="preset-id-inline">id {{ id }}</span>
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
                      <span class="value-badge">{{ Math.round(editSpeed / 255 * 100) }}%</span>
                    </label>
                    <q-slider
                      v-model="editSpeed"
                      :min="0"
                      :max="255"
                      color="black"
                      track-color="grey-3"
                    />
                  </div>

                  <!-- Frequency Slider -->
                  <div class="control-group slider-group">
                    <label class="control-label">
                      <q-icon name="flare" size="16px" />
                      Frequency
                      <span class="value-badge">{{ Math.round(editIntensity / 255 * 60) }} Hz</span>
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
                      <span class="value-badge">{{ Math.round(editBrightness / 255 * 100) }}%</span>
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
                      icon="delete"
                      label="Delete"
                      flat
                      class="delete-btn"
                      @click="deletePreset(parseInt(id))"
                    />
                    <q-btn
                      icon="visibility"
                      label="Preview"
                      unelevated
                      class="preview-btn"
                      @click="previewEditEffect"
                      :disable="editEffectId === ''"
                    />
                    <q-btn
                      icon="save"
                      label="Update"
                      unelevated
                      class="save-btn"
                      @click="updateExistingPreset(parseInt(id), preset.n)"
                      :disable="editEffectId === ''"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!isAddingNew" class="empty-state">
            <q-icon name="bookmark_border" size="40px" color="grey-5" />
            <div>You currently have no presets</div>
            <div class="empty-subtitle">Tap "New Preset" to create one</div>
          </div>

          <!-- Add New Preset Button -->
          <div class="add-preset-section">
            <button class="add-preset-btn" @click="toggleAddNew">
              <q-icon :name="isAddingNew ? 'close' : 'add'" size="18px" />
              {{ isAddingNew ? 'Cancel' : 'New Preset' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- PLAYLIST TAB -->
      <!-- ============================================ -->
      <div v-if="activeTab === 'playlist'" class="content-padding">
        <div class="section-card">
          <div class="section-header">
            <q-icon name="playlist_play" size="20px" class="section-icon" />
            <span>Playlists</span>
            <q-btn
              icon="refresh"
              flat
              round
              size="sm"
              @click="loadPresets"
              :loading="isLoadingPresets"
            />
          </div>

          <!-- Saved Playlists List -->
          <div class="presets-list" v-if="Object.keys(savedPlaylists).length > 0">
            <!-- Column headers -->
            <div class="preset-list-header">
              <span></span>
              <span></span>
              <span>Name</span>
              <span>Presets · Time</span>
              <span></span>
            </div>
            <div
              v-for="(playlist, id) in savedPlaylists"
              :key="id"
              class="preset-row"
              :class="{ expanded: expandedPlaylistId === parseInt(id) }"
            >
              <!-- Collapsed header row — same flat 5-child grid as preset rows -->
              <div class="preset-row-header" @click="togglePlaylistExpand(parseInt(id), playlist)">
                <q-icon
                  :name="expandedPlaylistId === parseInt(id) ? 'arrow_drop_down' : 'arrow_right'"
                  size="30px"
                  class="expand-triangle"
                />
                <q-icon name="queue_music" size="18px" class="preset-type-icon" />
                <span class="preset-name">{{ playlist.n || `Playlist ${id}` }}</span>
                <span class="preset-effect-label">{{ playlist.playlist?.ps?.length ?? 0 }} presets · {{ getSavedPlaylistDuration(playlist) }}s</span>
                <div class="preset-actions" @click.stop>
                  <q-btn
                    icon="play_arrow"
                    unelevated
                    class="preset-play-btn"
                    @click="startSavedPlaylist(parseInt(id))"
                    title="Start playlist"
                  />
                </div>
              </div>

              <!-- Expanded editor panel -->
              <div v-if="expandedPlaylistId === parseInt(id)" class="preset-config-panel" @click.stop>
                <div class="config-content">
                  <!-- Playlist Name -->
                  <div class="control-group">
                    <label class="control-label">
                      <q-icon name="label" size="16px" />
                      Playlist Name
                    </label>
                    <input v-model="editingPlaylistName" type="text" class="text-input" placeholder="Playlist name" />
                  </div>

                  <!-- Controls -->
                  <div class="playlist-controls">
                    <q-btn icon="play_arrow" label="Start" unelevated class="start-btn" @click="startPlaylist" :disable="playlistItems.length === 0" />
                    <q-btn icon="stop" label="Stop" unelevated class="stop-btn" @click="stopPlaylist" :disable="!isPlaylistRunning" />
                  </div>

                  <!-- Items List -->
                  <div class="playlist-items" v-if="playlistItems.length > 0">
                    <div class="playlist-header-row">
                      <span class="col-order">#</span>
                      <span class="col-name">Preset</span>
                      <span class="col-duration">Duration</span>
                      <span class="col-actions"></span>
                    </div>
                    <draggable v-model="playlistItems" item-key="id" handle=".drag-handle" class="playlist-draggable">
                      <template #item="{ element, index }">
                        <div class="playlist-item" :class="{ playing: element.presetId === activePresetId }">
                          <div class="playlist-item-row">
                            <span class="drag-handle"><q-icon name="drag_indicator" size="20px" /></span>
                            <span class="col-order">{{ index + 1 }}</span>
                            <span class="col-name">
                              <div class="col-name-primary">{{ element.name }}</div>
                              <div class="col-name-effect">{{ getPresetEffectLabel(savedPresets[element.presetId]) || '' }}</div>
                            </span>
                            <span class="col-duration">
                              <input v-model.number="element.duration" type="number" :min="1" class="duration-input" /><span class="duration-suffix">s</span>
                            </span>
                            <span class="col-actions">
                              <q-btn icon="play_arrow" flat round size="sm" @click="applyPreset(element.presetId)" title="Preview" />
                              <q-btn icon="close" flat round size="sm" color="negative" @click="removeFromPlaylist(index)" />
                            </span>
                          </div>
                          <div v-if="element.presetId === activePresetId && playlistItemDuration > 0" class="playlist-item-progress">
                            <div class="progress-fill" :style="{ width: Math.min(playlistProgressSeconds / playlistItemDuration * 100, 100) + '%' }"></div>
                          </div>
                        </div>
                      </template>
                    </draggable>
                    <div class="playlist-summary">Total: {{ totalPlaylistDuration }}s</div>
                  </div>
                  <div v-else class="playlist-empty-hint">No presets in this playlist</div>

                  <!-- Quick Add -->
                  <div v-if="Object.keys(savedPresets).length > 0" class="playlist-quick-add">
                    <label class="control-label">Add Preset</label>
                    <div class="quick-add-row">
                      <select v-model="selectedAddPresetId" class="quick-add-select">
                        <option value="" disabled>Select preset…</option>
                        <option v-for="(preset, pid) in savedPresets" :key="pid" :value="parseInt(pid)">
                          {{ preset.n || `Preset ${pid}` }}
                        </option>
                      </select>
                      <button
                        class="quick-add-confirm-btn"
                        :disabled="selectedAddPresetId === ''"
                        @click="addPresetToPlaylist(selectedAddPresetId, savedPresets[selectedAddPresetId]?.n || `Preset ${selectedAddPresetId}`)"
                      >Add</button>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="action-buttons">
                    <q-btn icon="delete" label="Delete" flat class="delete-btn" @click="deletePlaylistById(parseInt(id))" />
                    <q-btn icon="save" label="Update" unelevated class="save-btn" @click="updatePlaylist(parseInt(id))" :disable="playlistItems.length === 0" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!isAddingNewPlaylist" class="empty-state">
            <q-icon name="playlist_add" size="40px" color="grey-5" />
            <div>No playlists saved</div>
            <div class="empty-subtitle">Tap "New Playlist" to create one</div>
          </div>

          <!-- New Playlist panel -->
          <div v-if="isAddingNewPlaylist" class="preset-config-panel" @click.stop>
            <div class="config-content">
              <!-- Name -->
              <div class="control-group">
                <label class="control-label">
                  <q-icon name="label" size="16px" />
                  Playlist Name
                </label>
                <div class="name-input-row">
                  <input v-model="editingPlaylistName" type="text" class="text-input" placeholder="Playlist name" />
                  <button class="reroll-btn" @click="regeneratePlaylistName" title="Generate new name">↻</button>
                </div>
              </div>


              <!-- Items List -->
              <div class="playlist-items" v-if="playlistItems.length > 0">
                <div class="playlist-header-row">
                  <span class="col-order">#</span>
                  <span class="col-name">Preset</span>
                  <span class="col-duration">Duration</span>
                  <span class="col-actions"></span>
                </div>
                <draggable v-model="playlistItems" item-key="id" handle=".drag-handle" class="playlist-draggable">
                  <template #item="{ element, index }">
                    <div class="playlist-item">
                      <div class="playlist-item-row">
                        <span class="drag-handle"><q-icon name="drag_indicator" size="20px" /></span>
                        <span class="col-order">{{ index + 1 }}</span>
                        <span class="col-name">
                          <div class="col-name-primary">{{ element.name }}</div>
                          <div class="col-name-effect">{{ getPresetEffectLabel(savedPresets[element.presetId]) || '' }}</div>
                        </span>
                        <span class="col-duration">
                          <input v-model.number="element.duration" type="number" :min="1" class="duration-input" /><span class="duration-suffix">s</span>
                        </span>
                        <span class="col-actions">
                          <q-btn icon="play_arrow" flat round size="sm" @click="applyPreset(element.presetId)" title="Preview" />
                          <q-btn icon="close" flat round size="sm" color="negative" @click="removeFromPlaylist(index)" />
                        </span>
                      </div>
                    </div>
                  </template>
                </draggable>
                <div class="playlist-summary">Total: {{ totalPlaylistDuration }}s</div>
              </div>
              <div v-else class="playlist-empty-hint">No presets added yet</div>

              <!-- Quick Add -->
              <div v-if="Object.keys(savedPresets).length > 0" class="playlist-quick-add">
                <label class="control-label">Add Preset</label>
                <div class="quick-add-row">
                  <select v-model="selectedAddPresetId" class="quick-add-select">
                    <option value="" disabled>Select preset…</option>
                    <option v-for="(preset, pid) in savedPresets" :key="pid" :value="parseInt(pid)">
                      {{ preset.n || `Preset ${pid}` }}
                    </option>
                  </select>
                  <button
                    class="quick-add-confirm-btn"
                    :disabled="selectedAddPresetId === ''"
                    @click="addPresetToPlaylist(selectedAddPresetId, savedPresets[selectedAddPresetId]?.n || `Preset ${selectedAddPresetId}`)"
                  >Add</button>
                </div>
              </div>

              <!-- Save -->
              <div class="action-buttons">
                <q-btn icon="save" label="Save" unelevated class="save-btn" @click="saveNewPlaylist" :disable="playlistItems.length === 0" />
              </div>
            </div>
          </div>

          <!-- New Playlist button at bottom -->
          <div class="add-preset-section">
            <button class="add-preset-btn" @click="toggleAddNewPlaylist">
              <q-icon :name="isAddingNewPlaylist ? 'close' : 'add'" size="18px" />
              {{ isAddingNewPlaylist ? 'Cancel' : 'New Playlist' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import draggable from "vuedraggable";
import webservices, { resolveStartupIp } from "../webservices";
import { generatePresetName, generatePlaylistName } from "../utils/presetNames";

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
    const useAutoName = ref(true); // Auto-generate a woo name by default
    const selectedEffectId = ref("");
    const selectedPaletteId = ref(0);
    const primaryColor = ref("#ffffff");
    const secondaryColor = ref("#ffffff");
    const tertiaryColor = ref("#ffffff");
    const effectSpeed = ref(128);
    const effectIntensity = ref(128);
    const effectBrightness = ref(200);
    const newPresetDuration = ref(10); // Default 10 seconds

    // Guard flag to prevent the edit-param watcher from auto-previewing during expand
    const isInitializingEdit = ref(false);

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
    const savedPlaylists = ref({});
    const expandedPlaylistId = ref(null);
    const isAddingNewPlaylist = ref(false);
    const editingPlaylistName = ref('');
    const selectedAddPresetId = ref('');
    const playlistItems = ref([]);
    const playlistRepeat = ref(0);
    const playlistTransition = ref(7);
    const isPlaylistRunning = ref(false);

    // Get IP address — use the same priority logic as startup (user-configured → last valid)
    const getIpAddress = () => {
      return resolveStartupIp() || '4.3.2.1';
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

    // Computed: Total playlist duration (for open editor)
    const totalPlaylistDuration = computed(() => {
      return playlistItems.value.reduce((sum, item) => sum + (item.duration || 0), 0);
    });

    // Helper: total duration for a saved playlist object (deciseconds → seconds)
    const getSavedPlaylistDuration = (playlist) => {
      const dur = playlist?.playlist?.dur;
      if (!dur?.length) return 0;
      return Math.round(dur.reduce((s, d) => s + d, 0) / 10);
    };

    // Generate and apply a fresh auto name
    const regenerateName = () => {
      newPresetName.value = generatePresetName();
    };

    // Toggle add new preset panel
    const toggleAddNew = () => {
      isAddingNew.value = !isAddingNew.value;
      if (isAddingNew.value) {
        expandedPresetId.value = null; // Close any expanded preset
        resetNewPresetForm();
        // Start with an auto-generated woo name
        if (useAutoName.value) {
          newPresetName.value = generatePresetName();
        } else {
          newPresetName.value = `Preset ${getNextPresetId()}`;
        }
      }
    };

    // When user toggles the auto-name checkbox
    const onAutoNameToggle = () => {
      if (useAutoName.value) {
        newPresetName.value = generatePresetName();
      }
    };

    // When user types in the name field, uncheck auto-name so ↻ won't overwrite their text
    const onNameInput = () => {
      useAutoName.value = false;
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

        // Guard the watcher so populating the form doesn't trigger auto-preview
        isInitializingEdit.value = true;
        const settings = extractPresetSettings(preset);
        editEffectId.value = settings.effectId;
        editPaletteId.value = settings.paletteId;
        editPrimaryColor.value = settings.primaryColor;
        editSecondaryColor.value = settings.secondaryColor;
        editTertiaryColor.value = settings.tertiaryColor;
        editSpeed.value = settings.speed;
        editIntensity.value = settings.intensity;
        editBrightness.value = settings.brightness;
        editDuration.value = getPresetDuration(presetId) || 10;
        // Use nextTick to allow reactive assignments to flush before re-enabling the watcher
        nextTick(() => { isInitializingEdit.value = false; });
      }
    };

    // Reset new preset form
    const resetNewPresetForm = () => {
      newPresetName.value = "";
      useAutoName.value = true;
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

    // Load presets from device — separates regular presets from WLED-saved playlists
    const loadPresets = async () => {
      isLoadingPresets.value = true;
      try {
        // WLED can be slow to finish writing to flash; retry once on network error
        let allPresets;
        try {
          allPresets = await webservices.fetchWledPresets(getIpAddress());
        } catch (_) {
          await new Promise(r => setTimeout(r, 800));
          allPresets = await webservices.fetchWledPresets(getIpAddress());
        }
        // WLED does not distinguish playlist presets structurally — use our
        // localStorage metadata to know which preset IDs are playlists.
        const playlistMeta = webservices.getStoredPlaylists(getIpAddress());
        const filtered = {};
        const wledPlaylists = {};

        for (const [id, preset] of Object.entries(allPresets)) {
          if (id === "0" || !preset || typeof preset !== "object" || Array.isArray(preset)) continue;
          if (playlistMeta[id] !== undefined) {
            const stored = playlistMeta[id];
            const items = stored.items || [];
            wledPlaylists[id] = {
              ...preset,
              n: stored.n || preset.n,
              playlist: {
                ps: items.map(i => i.presetId),
                dur: items.map(i => (i.duration || 10) * 10),
                transition: stored.transition ?? 7,
                repeat: stored.repeat ?? 0,
              },
            };
          } else {
            filtered[id] = preset;
          }
        }

        savedPresets.value = filtered;
        savedPlaylists.value = wledPlaylists;
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


    // Preview effect (for new preset) — uses HTTP POST to avoid WS instability on Sequencer page
    const previewEffect = async () => {
      const ip = getIpAddress();
      const selectedItem = effectsList.value.find(e => e.effectId === selectedEffectId.value);

      if (selectedItem && selectedItem.effectName === "allWhite") {
        await fetch(`http://${ip}/json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ on: true, seg: [{ col: [[255, 255, 255]], fx: 0 }] }),
        });
      } else if (selectedEffectId.value !== null && selectedEffectId.value !== "") {
        await webservices.applyEffect({
          ipAddress: ip,
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

    // Preview effect (for edit) — uses HTTP POST to avoid WS instability on Sequencer page
    const previewEditEffect = async () => {
      const ip = getIpAddress();
      const selectedItem = effectsList.value.find(e => e.effectId === editEffectId.value);

      if (selectedItem && selectedItem.effectName === "allWhite") {
        await fetch(`http://${ip}/json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ on: true, seg: [{ col: [[255, 255, 255]], fx: 0 }] }),
        });
      } else if (editEffectId.value !== null && editEffectId.value !== "") {
        await webservices.applyEffect({
          ipAddress: ip,
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

    // Get next available preset ID (excludes both presets and playlists)
    const getNextPresetId = () => {
      const usedIds = [
        ...Object.keys(savedPresets.value),
        ...Object.keys(savedPlaylists.value),
      ].map(Number);
      for (let i = 1; i <= 250; i++) {
        if (!usedIds.includes(i)) return i;
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
      webservices.applyPreset(getIpAddress(), presetId);
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

    // Toggle expand/collapse for a saved playlist
    const togglePlaylistExpand = (id, playlist) => {
      if (expandedPlaylistId.value === id) {
        expandedPlaylistId.value = null;
        return;
      }
      expandedPlaylistId.value = id;
      isAddingNewPlaylist.value = false;

      const pl = playlist.playlist;
      editingPlaylistName.value = playlist.n || '';
      const ids = pl.ps ?? [];
      const durs = pl.dur ?? [];
      playlistItems.value = ids.map((presetId, i) => ({
        id: Date.now() + i,
        presetId,
        name: savedPresets.value[presetId]?.n || `Preset ${presetId}`,
        duration: durs[i] !== undefined ? Math.round(durs[i] / 10) : 10,
      }));
      playlistTransition.value = Array.isArray(pl.transition) ? (pl.transition[0] ?? 7) : (pl.transition ?? 7);
      playlistRepeat.value = pl.repeat ?? 0;
    };

    // Toggle new playlist form
    const toggleAddNewPlaylist = () => {
      isAddingNewPlaylist.value = !isAddingNewPlaylist.value;
      if (isAddingNewPlaylist.value) {
        expandedPlaylistId.value = null;
        editingPlaylistName.value = generatePlaylistName();
        playlistItems.value = [];
        playlistRepeat.value = 0;
        playlistTransition.value = 7;
      }
    };

    const regeneratePlaylistName = () => {
      editingPlaylistName.value = generatePlaylistName();
    };

    // Start a saved playlist by its preset ID — sends full playlist definition to WLED
    const startSavedPlaylist = (id) => {
      const playlist = savedPlaylists.value[id];
      if (!playlist?.playlist) {
        applyPreset(id);
        isPlaylistRunning.value = true;
        return;
      }
      const pl = playlist.playlist;
      webservices.startPlaylist(getIpAddress(), {
        presets: pl.ps,
        durations: pl.dur,
        transition: Array.isArray(pl.transition) ? (pl.transition[0] ?? 7) : (pl.transition ?? 7),
        repeat: pl.repeat ?? 0,
      });
      isPlaylistRunning.value = true;
    };

    // Save new playlist to WLED
    const saveNewPlaylist = async () => {
      if (playlistItems.value.length === 0) return;
      try {
        const presets = playlistItems.value.map(item => item.presetId);
        const durations = playlistItems.value.map(item => item.duration * 10);
        const nextId = getNextPresetId();
        const name = editingPlaylistName.value.trim() || `Playlist ${nextId}`;
        await webservices.savePlaylist(getIpAddress(), nextId, name, {
          presets, durations,
          transition: playlistTransition.value,
          repeat: playlistRepeat.value,
          items: playlistItems.value,
        });
        isAddingNewPlaylist.value = false;
        await new Promise(r => setTimeout(r, 300));
        await loadPresets();
      } catch (error) {
        console.error("Error saving playlist:", error);
      }
    };

    // Update an existing playlist on WLED
    const updatePlaylist = async (id) => {
      if (playlistItems.value.length === 0) return;
      try {
        const presets = playlistItems.value.map(item => item.presetId);
        const durations = playlistItems.value.map(item => item.duration * 10);
        const name = editingPlaylistName.value.trim() || savedPlaylists.value[id]?.n || `Playlist ${id}`;
        await webservices.savePlaylist(getIpAddress(), id, name, {
          presets, durations,
          transition: playlistTransition.value,
          repeat: playlistRepeat.value,
          items: playlistItems.value,
        });
        expandedPlaylistId.value = null;
        await new Promise(r => setTimeout(r, 300));
        await loadPresets();
      } catch (error) {
        console.error("Error updating playlist:", error);
      }
    };

    // Delete a playlist by ID
    const deletePlaylistById = async (id) => {
      try {
        await webservices.deletePreset(getIpAddress(), id);
        webservices.removePlaylistMeta(getIpAddress(), id);
        // Optimistic UI update — remove immediately so UI is correct even if reload fails
        const updated = { ...savedPlaylists.value };
        delete updated[id];
        savedPlaylists.value = updated;
        expandedPlaylistId.value = null;
        await new Promise(r => setTimeout(r, 300));
        loadPresets(); // fire-and-forget background sync
      } catch (error) {
        console.error("Error deleting playlist:", error);
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
    const startPlaylist = async () => {
      if (playlistItems.value.length === 0) return;

      const presets = playlistItems.value.map(item => item.presetId);
      const durations = playlistItems.value.map(item => item.duration * 10);

      try {
        await webservices.startPlaylist(getIpAddress(), {
          presets,
          durations,
          transition: playlistTransition.value,
          repeat: playlistRepeat.value,
        });
        isPlaylistRunning.value = true;
      } catch (error) {
        console.error("Error starting playlist:", error);
      }
    };

    // Stop playlist
    const stopPlaylist = async () => {
      try {
        await webservices.stopPlaylist(getIpAddress());
      } catch (error) {
        console.error("Error stopping playlist:", error);
      }
      isPlaylistRunning.value = false;
    };

    // Next preset in playlist
    const nextPresetInPlaylist = async () => {
      try {
        await webservices.nextPlaylistPreset(getIpAddress());
      } catch (error) {
        console.error("Error advancing playlist:", error);
      }
    };

    // Get effect label for a preset (for display in preset row)
    const getPresetEffectLabel = (preset) => {
      if (!preset.seg || !Array.isArray(preset.seg) || preset.seg.length === 0) return null;
      const fx = preset.seg[0].fx;
      if (fx === undefined || fx === null) return null;
      const effect = effectsList.value.find(e => e.effectId === fx);
      return effect ? effect.label : null;
    };

    // Live playlist state tracking
    const activePresetId = ref(null);
    const playlistProgressSeconds = ref(0);
    const playlistItemDuration = ref(0);
    let statePollingInterval = null;
    let progressTimer = null;

    const pollWledState = async () => {
      try {
        const ip = getIpAddress();
        const res = await fetch(`http://${ip}/json/state`);
        const state = await res.json();
        const newPs = state.ps ?? null;
        if (newPs !== activePresetId.value) {
          activePresetId.value = newPs;
          clearInterval(progressTimer);
          playlistProgressSeconds.value = 0;
          const item = playlistItems.value.find(i => i.presetId === newPs);
          playlistItemDuration.value = item ? item.duration : 0;
          if (playlistItemDuration.value > 0) {
            progressTimer = setInterval(() => {
              if (playlistProgressSeconds.value < playlistItemDuration.value) {
                playlistProgressSeconds.value++;
              }
            }, 1000);
          }
        }
      } catch (e) {
        // silently ignore polling errors
      }
    };

    watch([activeTab, expandedPlaylistId], ([tab, plId]) => {
      clearInterval(statePollingInterval);
      clearInterval(progressTimer);
      if (tab === 'playlist' && plId !== null) {
        pollWledState();
        statePollingInterval = setInterval(pollWledState, 1000);
      } else {
        activePresetId.value = null;
        playlistProgressSeconds.value = 0;
      }
    });

    onUnmounted(() => {
      clearInterval(statePollingInterval);
      clearInterval(progressTimer);
    });

    // Watch for new preset parameter changes
    watch([effectSpeed, effectIntensity, selectedPaletteId, primaryColor, secondaryColor, tertiaryColor, effectBrightness], () => {
      if (selectedEffectId.value && isAddingNew.value) {
        clearTimeout(window.effectPreviewTimeout);
        window.effectPreviewTimeout = setTimeout(() => {
          previewEffect();
        }, 300);
      }
    });

    // Watch for edit parameter changes (guarded so expand-population doesn't auto-preview)
    watch([editSpeed, editIntensity, editPaletteId, editPrimaryColor, editSecondaryColor, editTertiaryColor, editBrightness], () => {
      if (isInitializingEdit.value) return;
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
      useAutoName,
      regenerateName,
      onAutoNameToggle,
      onNameInput,
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
      getPresetEffectLabel,
      updateExistingPreset,

      // Live playlist tracking
      activePresetId,
      playlistProgressSeconds,
      playlistItemDuration,

      // Playlist
      savedPlaylists,
      expandedPlaylistId,
      isAddingNewPlaylist,
      editingPlaylistName,
      selectedAddPresetId,
      playlistItems,
      playlistRepeat,
      playlistTransition,
      isPlaylistRunning,
      totalPlaylistDuration,
      getSavedPlaylistDuration,
      togglePlaylistExpand,
      toggleAddNewPlaylist,
      regeneratePlaylistName,
      startSavedPlaylist,
      saveNewPlaylist,
      updatePlaylist,
      deletePlaylistById,
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
