(function () {
  "use strict";

  /** @type AudioContext */
  let CTX;
  /** @type DynamicsCompressorNode */
  let COMP_NODE;
  /** @type Map<string, PlayingOscillator> */
  let ACTIVE_KEYS;

  let BASE_FREQ = 440;
  //                 1                     8
  let MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11, 12 + 0, 12 + 2, 12 + 4];
  let MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10, 12 + 0, 12 + 2, 12 + 3];
  let SCALE = MINOR_SCALE;
  let KEY = 3;

  function main() {
    document.addEventListener("keydown", handleKeydown);
    document.addEventListener("keyup", handleKeyup);

    for (let btn of document.getElementsByClassName("btn-key")) {
      btn.addEventListener("click", switchKey);
    }
    for (let btn of document.getElementsByClassName("btn-scale")) {
      btn.addEventListener("click", switchScale);
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  function handleKeydown(event) {
    if (CTX === undefined) {
      CTX = new AudioContext();
      COMP_NODE = CTX.createDynamicsCompressor();
      COMP_NODE.connect(CTX.destination);

      ACTIVE_KEYS = new Map();
    }

    let { code, altKey, ctrlKey, metaKey, shiftKey, isComposing } = event;
    let halfs = keycodeToHalfs(code);
    if (
      halfs === null ||
      altKey ||
      ctrlKey ||
      metaKey ||
      shiftKey ||
      isComposing
    ) {
      return;
    }
    event.preventDefault();

    if (ACTIVE_KEYS.has(code)) return;
    ACTIVE_KEYS.set(code, new PlayingOscillator(halfsToFreq(KEY + halfs), 0.1));
  }

  /**
   * @param {KeyboardEvent} event
   */
  function handleKeyup({ code }) {
    let osci = ACTIVE_KEYS.get(code);
    if (osci === undefined) return;

    osci.stop();
    ACTIVE_KEYS.delete(code);
  }

  /**
   * @param {Event} event
   */
  function switchKey({ target }) {
    KEY = keyToHalfs(target.value) ?? keyToHalfs("C");
  }

  /**
   * @param {Event} event
   */
  function switchScale({ target }) {
    switch (target.value) {
      case "Major":
        SCALE = MAJOR_SCALE;
        return;
      case "Minor":
        SCALE = MINOR_SCALE;
        return;
      default:
        console.log(
          `WARNING: Illegal value ${target.value}. Scale defaulted to MAJOR_SCALE.`,
        );
        SCALE = MAJOR_SCALE;
        return;
    }
  }

  class PlayingOscillator {
    osciNode;

    /**
     * @param {number} freq
     * @param {number} gain
     */
    constructor(freq, gain) {
      this.gainNode = CTX.createGain();
      this.gainNode.gain.setValueAtTime(0, CTX.currentTime);
      this.gainNode.connect(COMP_NODE);

      let real = new Float32Array([0, 1, 0.5, 0.5, 0.25]);
      let imag = new Float32Array(real.length);
      let wave = CTX.createPeriodicWave(real, imag);

      this.osciNode = CTX.createOscillator();
      this.osciNode.frequency.setValueAtTime(freq, CTX.currentTime);
      this.osciNode.setPeriodicWave(wave);
      this.osciNode.connect(this.gainNode);

      this.gainNode.gain.setTargetAtTime(gain, CTX.currentTime, 0.1);
      this.osciNode.start();
    }

    async stop() {
      let wait = 0.1;
      this.gainNode.gain.setTargetAtTime(1 / 10000, CTX.currentTime, wait);
      await new Promise((ok, err) => setTimeout(() => ok(), wait * 1000));
      this.osciNode.stop();
    }
  }

  /**
   * @param {number} halfs
   */
  function halfsToFreq(halfs) {
    return BASE_FREQ * 2 ** (halfs / 12);
  }

  /**
   * @param {string} keycode
   */
  function keycodeToHalfs(keycode) {
    // prettier-ignore
    switch (keycode) {
    case "Digit1": return SCALE[0] + 12 * 1;
    case "Digit2": return SCALE[1] + 12 * 1;
    case "Digit3": return SCALE[2] + 12 * 1;
    case "Digit4": return SCALE[3] + 12 * 1;
    case "Digit5": return SCALE[4] + 12 * 1;
    case "Digit6": return SCALE[5] + 12 * 1;
    case "Digit7": return SCALE[6] + 12 * 1;
    case "Digit8": return SCALE[7] + 12 * 1;
    case "Digit9": return SCALE[8] + 12 * 1;
    case "Digit0": return SCALE[9] + 12 * 1;

    case "KeyQ": return SCALE[0] + 12 * 0;
    case "KeyW": return SCALE[1] + 12 * 0;
    case "KeyE": return SCALE[2] + 12 * 0;
    case "KeyR": return SCALE[3] + 12 * 0;
    case "KeyT": return SCALE[4] + 12 * 0;
    case "KeyY": return SCALE[5] + 12 * 0;
    case "KeyU": return SCALE[6] + 12 * 0;
    case "KeyI": return SCALE[7] + 12 * 0;
    case "KeyO": return SCALE[8] + 12 * 0;
    case "KeyP": return SCALE[9] + 12 * 0;

    case "KeyA": return SCALE[0] + 12 * -1;
    case "KeyS": return SCALE[1] + 12 * -1;
    case "KeyD": return SCALE[2] + 12 * -1;
    case "KeyF": return SCALE[3] + 12 * -1;
    case "KeyG": return SCALE[4] + 12 * -1;
    case "KeyH": return SCALE[5] + 12 * -1;
    case "KeyJ": return SCALE[6] + 12 * -1;
    case "KeyK": return SCALE[7] + 12 * -1;
    case "KeyL": return SCALE[8] + 12 * -1;
    case "Semicolon": return SCALE[9] + 12 * -1;

    case "KeyZ": return SCALE[0] + 12 * -2;
    case "KeyX": return SCALE[1] + 12 * -2;
    case "KeyC": return SCALE[2] + 12 * -2;
    case "KeyV": return SCALE[3] + 12 * -2;
    case "KeyB": return SCALE[4] + 12 * -2;
    case "KeyN": return SCALE[5] + 12 * -2;
    case "KeyM": return SCALE[6] + 12 * -2;
    case "Comma": return SCALE[7] + 12 * -2;
    case "Period": return SCALE[8] + 12 * -2;
    case "Slash": return SCALE[9] + 12 * -2;

    default: return null;
    }
  }

  /**
   * @param {string} key
   */
  function keyToHalfs(key) {
    // prettier-ignore
    switch (key) {
    case "Cb": return 2;
    case "C":  return 3;
    case "C#": return 4;

    case "Db": return 4;
    case "D":  return 5;
    case "D#": return 6;

    case "Eb": return 6;
    case "E":  return 7;
    case "E#": return 8;

    case "Fb": return 7;
    case "F":  return 8;
    case "F#": return 9;

    case "Gb": return 9;
    case "G":  return 10;
    case "G#": return 11;

    case "Ab": return 11;
    case "A":  return 12;
    case "A#": return 13;

    case "Bb": return 13;
    case "B":  return 14;
    case "B#": return 15;

    default: return null;
    }
  }

  addEventListener("load", main);
})();
