/**
 * useWledEffects.js
 * 
 * Composable utility for working with WLED effects
 * Provides easy access to custom effects and device analysis
 * 
 * Author: Generated for GridLights Mobile App
 */

import { ref, computed } from 'vue';
import webservices, { DEFAULT_WLED_EFFECTS } from '../webservices';

/**
 * Composable for managing WLED effects
 * @param {string} ipAddress - Optional IP address to load analysis for
 */
export function useWledEffects(ipAddress = null) {
  const currentAnalysis = ref(null);
  const isLoading = ref(false);
  const error = ref(null);

  // Load analysis from localStorage if IP is provided
  if (ipAddress) {
    currentAnalysis.value = webservices.getStoredAnalysis(ipAddress);
  }

  // Computed properties for easy access
  const customEffects = computed(() => {
    return currentAnalysis.value?.effects?.custom || [];
  });

  const allEffects = computed(() => {
    return currentAnalysis.value?.effects?.all || [];
  });

  const deviceInfo = computed(() => {
    return currentAnalysis.value?.deviceInfo || null;
  });

  const hasCustomEffects = computed(() => {
    return customEffects.value.length > 0;
  });

  const customEffectCount = computed(() => {
    return customEffects.value.length;
  });

  /**
   * Analyze a WLED instance
   * @param {string} ip - IP address to analyze
   * @returns {Promise<Object>} Analysis result
   */
  const analyzeDevice = async (ip) => {
    isLoading.value = true;
    error.value = null;
    
    try {
      const analysis = await webservices.analyzeWledInstance(ip);
      currentAnalysis.value = analysis;
      return analysis;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Load stored analysis for a device
   * @param {string} ip - IP address
   */
  const loadStoredAnalysis = (ip) => {
    currentAnalysis.value = webservices.getStoredAnalysis(ip);
  };

  /**
   * Clear stored analysis for a device
   * @param {string} ip - IP address
   */
  const clearAnalysis = (ip) => {
    webservices.clearStoredAnalysis(ip);
    if (currentAnalysis.value?.ipAddress === ip) {
      currentAnalysis.value = null;
    }
  };

  /**
   * Get all analyzed devices
   * @returns {Array} List of analyzed devices
   */
  const getAnalyzedDevices = () => {
    return webservices.getAnalyzedDevices();
  };

  /**
   * Check if an effect is custom (not in default list)
   * @param {string} effectName - Name of the effect
   * @returns {boolean} True if custom effect
   */
  const isCustomEffect = (effectName) => {
    return !DEFAULT_WLED_EFFECTS.includes(effectName);
  };

  /**
   * Get effect by ID from current analysis
   * @param {number} effectId - Effect ID
   * @returns {Object|null} Effect object with name and id
   */
  const getEffectById = (effectId) => {
    if (!currentAnalysis.value?.effects?.all) {
      return null;
    }
    
    const effectName = currentAnalysis.value.effects.all[effectId];
    if (!effectName) {
      return null;
    }

    return {
      id: effectId,
      name: effectName,
      isCustom: isCustomEffect(effectName)
    };
  };

  /**
   * Search effects by name
   * @param {string} searchTerm - Search term
   * @returns {Array} Array of matching effects
   */
  const searchEffects = (searchTerm) => {
    if (!currentAnalysis.value?.effects?.all) {
      return [];
    }

    const term = searchTerm.toLowerCase();
    return currentAnalysis.value.effects.all
      .map((name, id) => ({
        id,
        name,
        isCustom: isCustomEffect(name)
      }))
      .filter(effect => effect.name.toLowerCase().includes(term));
  };

  return {
    // State
    currentAnalysis,
    isLoading,
    error,
    
    // Computed
    customEffects,
    allEffects,
    deviceInfo,
    hasCustomEffects,
    customEffectCount,
    
    // Methods
    analyzeDevice,
    loadStoredAnalysis,
    clearAnalysis,
    getAnalyzedDevices,
    isCustomEffect,
    getEffectById,
    searchEffects,
  };
}

/**
 * Get custom effects for the currently connected device
 * Uses the saved IP address from localStorage
 * @returns {Object} WLED effects composable
 */
export function useCurrentDeviceEffects() {
  const savedIp = localStorage.getItem('ipAddress') || '4.3.2.1';
  return useWledEffects(savedIp);
}

export default useWledEffects;

