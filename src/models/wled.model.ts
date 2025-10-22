/**
 * WLED.ts
 * TypeScript data models for the WLED WebSocket/JSON API.
 *
 * This interface describes the typical full JSON message payload that WLED
 * sends over its WebSocket connection, containing both "state" and "info".
 */

export interface WLEDWebSocketMessage {
  /** Current operational state of the LEDs and segments */
  state: WLEDState;

  /** Static device and runtime info */
  info: WLEDInfo;
}

/**
 * ---------------------------
 *   WLED STATE
 * ---------------------------
 */
export interface WLEDState {
  /** Whether the LEDs are on or off */
  on: boolean;

  /** Global brightness, range 0–255 */
  bri: number;

  /** Transition duration between effects/colors in deciseconds (e.g. 7 = 0.7s) */
  transition: number;

  /** Currently active preset ID, or -1 if none is active */
  ps: number;

  /** Currently active playlist ID, or -1 if none is active */
  pl: number;

  /** If non-null, describes active error state */
  error?: string | null;

  /** Nightlight configuration */
  nl?: WLEDNightlight;

  /** UDP sync configuration for sending and receiving data packets */
  udpn?: WLEDUdpn;

  /** An array of segment configurations describing LED groups */
  seg: WLEDSegment[];
}

/** Nightlight controls (auto off / fade out) */
export interface WLEDNightlight {
  /** Whether the nightlight is active/enabled */
  on: boolean;

  /** Duration in minutes */
  dur: number;

  /** Fade-down effect (true = fade, false = instant off) */
  fade: boolean;

  /** Target brightness after fade complete */
  tbri: number;

  /** Optional macro to run when nightlight ends (0 = none) */
  macro: number;
}

/** UDP packet sync enable/disable */
export interface WLEDUdpn {
  /** If true, device sends UDP broadcast data */
  send: boolean;

  /** If true, device listens for UDP packets */
  recv: boolean;
}

/**
 * A segment is an individually controllable portion of the LED strip.
 */
export interface WLEDSegment {
  /** Segment numeric ID (0-based, sequential) */
  id: number;

  /** Start LED index of segment */
  start: number;

  /** Stop LED index (non-inclusive, i.e., last LED + 1) */
  stop: number;

  /** Calculated length of this segment (stop - start) */
  len: number;

  /** Whether this segment is active/visible */
  on: boolean;

  /** Brightness for this segment (0–255) */
  bri: number;

  /**
   * Array of up to 3 color layers: each a tuple
   * [R, G, B] for RGB setups or [R, G, B, W] for RGBW setups.
   * Index 0 = primary, 1 = secondary, 2 = tertiary color.
   */
  col: number[][];

  /** Effect ID number (lookup via WLED effect list) */
  fx: number;

  /** Effect speed (0–255, higher = faster in most effects) */
  sx: number;

  /** Effect intensity (0–255, behavior depends on effect) */
  ix: number;

  /** Palette ID (matches palette number in WLED UI) */
  pal: number;

  /** Whether this segment is currently selected in UI */
  sel: boolean;

  /** If true, LEDs in this segment are rendered in reverse order */
  rev: boolean;

  /** If true, this segment mirrors its first half onto the second half */
  mi?: boolean;

  /** (v0.14+) Whether the segment is cloned from another source segment */
  cln?: number | null;
}

/**
 * ---------------------------
 *   WLED INFO
 * ---------------------------
 */
export interface WLEDInfo {
  /** Firmware version string, e.g. "0.14.0-b2" */
  ver: string;

  /** Numeric version ID (useful for comparisons) */
  vid: number;

  /** LED strip configuration */
  leds: WLEDLedInfo;

  /** Friendly display name configured for this WLED instance */
  name: string;

  /** Whether live mode (e.g. E1.31/UDP) is active */
  live: boolean;

  /** IP address of the currently connected live source as 4-byte array */
  lip: [number, number, number, number];

  /** Number of active WebSocket clients */
  ws: number;

  /** If true, currently playing a preset playlist */
  wifi?: WLEDWifiInfo;

  /** Palette and effect counts (may be omitted in older versions) */
  palettes?: number;
}

/** LED strip / setup metadata */
export interface WLEDLedInfo {
  /** Total number of addressable LEDs */
  count: number;

  /** True if LEDs are RGBW type (4-channel) */
  rgbw: boolean;

  /** GPIO pins used for LED output */
  pin: number[];

  /** Current estimated power use in milliamps */
  pwr: number;

  /** Current render framerate (frames per second) */
  fps: number;
}

/** Wi-Fi configuration and connection info */
export interface WLEDWifiInfo {
  /** Current signal strength (RSSI) */
  rssi: number;

  /** IP address as dotted string */
  ip: string;

  /** SSID string */
  ssid: string;
}
