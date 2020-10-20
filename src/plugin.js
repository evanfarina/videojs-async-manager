import videojs from 'video.js';
import {version as VERSION} from '../package.json';

const Plugin = videojs.getPlugin('plugin');

const LIFECYCLE_EVENTS = [
  'ready',
  'loadstart',
  'loadeddata',
  'loadedmetadata',
  'canplay',
  'autoplay-success',
  'autoplay-failure',
];

// Default options for the plugin.
const defaults = {};

/**
 * An advanced Video.js plugin. For more information on the API
 *
 * See: https://blog.videojs.com/feature-spotlight-advanced-plugins/
 */
class MediaPlaybackTestHelpers extends Plugin {

  /**
   * Create a MediaPlaybackTestHelpers plugin instance.
   *
   * @param  {Player} player
   *         A Video.js Player instance.
   *
   * @param  {Object} [options]
   *         An optional options object.
   *
   *         While not a core part of the Video.js plugin architecture, a
   *         second argument of options is a convenient way to accept inputs
   *         from your plugin's caller.
   */
  constructor(player, options) {
    // the parent class will add player under this.player
    super(player);

    this.options = videojs.mergeOptions(defaults, options);

    this.Promise = player.options().Promise || window.Promise;
    this._setupEventPromises();
    this.on(this.player, 'playerreset', this._onReset);
  }

  assert_(desc, test) {
    if (!test) {
      throw new Error(desc);
    }
  }

  _setupEventPromises() {
    this.lifecycleEventPromises_ = {};
    LIFECYCLE_EVENTS.forEach(eventName => {
      this.lifecycleEventPromises_[eventName] = new this.Promise(resolve => {
        this.one(this.player, eventName, resolve);
        // Need to remove listeners for events that may not have fired before reset
        this.one(this.player, 'playerreset', () => {
          this.off(this.player, eventName, resolve);
        });
      });
    });
  }

  _onReset() {
    this._setupEventPromises();
  }
  
  resolveWhenTimeReached_(time) { 
    return new this.Promise(resolve => {
      const checkForTime = () => {
        const currentTime = this.player.currentTime();
        if (currentTime >= time) {
          this.player.off('timeupdate', checkForTime);
          resolve();
        }
      };
      
      this.player.on('timeupdate', checkForTime);
    });
  }

  /**
   * Wait until an event has completed - see LIFECYCLE_EVENTS for all applicable events
   * 
   * @param {string} - The name of the event
   * @return {Promise}
   */
  waitForEvent(eventName) {
    return this.lifecycleEventPromises_[eventName];
  }

  /**
   * Play the media and wait until playing promise is complete
   * 
   * @return {Promise}
   */
  play() {
    return new this.Promise(resolve => {
      if (!this.player.paused()) {
        return resolve();
      }

      return this.player.play().then(resolve);
    });
  }

  /**
   * Pause the media and wait for the pause event
   * 
   * @return {Promise}
   */
  pause() {
    return new this.Promise(resolve => {
      if (this.player.paused()) {
        resolve();
        return;
      }

      this.player.one('pause', resolve);
      this.player.pause();
    });
  }

  /**
   * Mute the player and wait for the volumechange event
   * 
   * @return {Promise}
   */
  mute() {
    return new this.Promise(resolve => {
      // resolve early if already muted
      if (this.player.muted()) {
        resolve();
      } else {
        this.player.one('volumechange', resolve);
        this.player.muted(true);
      }
    });
  }

  /**
   * Unmute the player and wait for the volumechange event
   * 
   * @return {Promise}
   */
  unmute() {
    return new this.Promise(resolve => {
      // resolve early if already muted
      if (!this.player.muted()) {
        resolve();
      } else {
        this.player.one('volumechange', resolve);
        this.player.muted(false);
      }
    });
  }

  /**
   * Set the source of the media and wait for the sourceset event
   * 
   * @param {object|string} src - The desired source
   * @return {Promise}
   */
  setSource(src) {
    return new this.Promise(resolve => {
      this.player.one('sourceset', resolve);
      this.player.src(src);
    });
  }

  /**
   * Set the player volume and wait for the volumechange event
   * 
   * @param {number} volume - The desired volume
   * @return {Promise}
   */
  setVolume(volume) {
    this.assert_('setVolume: Requires a volume', volume || volume === 0);

    return new this.Promise(resolve => {
      // volumechange event will not fire if not actually changing
      if (this.player.volume() === volume) {
        resolve();
      } else {
        this.player.one('volumechange', resolve);
        this.player.volume(volume);
      }
    });
  }

  /**
   * Set the player poster and wait for the posterchange event
   * 
   * @param {string} poster - The poster to set
   * @return {Promise}
   */
  setPoster(poster) {
    this.assert_('setPoster: Requires a poster', poster || poster === '');

    return new this.Promise(resolve => {
      this.player.one('posterchange', resolve);
      this.player.poster(poster);
    });
  }

  /**
   * Reset the player and wait for playerreset event
   * 
   * @return {Promise}
   */
  reset() {
    return new this.Promise(resolve => {
      this.player.one('playerreset', resolve);
      this.player.reset();
    });
  }

  /**
   * Seek to a time in in the media
   * 
   * @param {number} time - The time in seconds
   * @return {Promise}
   */
  seekToTime(time) {
    this.assert_('seekToTime: Requires a time', time || time === 0);

    this.player.currentTime(time);

    return this.resolveWhenTimeReached_(time);
  }

  /**
   * Seek to the media end - resolves on ended event
   * Note: Causes the player to play if not already playing
   * 
   * @return {Promise}
   */
  seekToEnd() {
    return new this.Promise(resolve => {
      if (this.player.ended()) {
        resolve();
        return;
      }

      this.player.one('ended', resolve);

      // Calling play before currentTime to ensure loadedmetadata is fired
      if (this.player.paused()) {
        this.player.play();
      }

      // We need to source to be ready before we can get the duration
      this
        .waitForEvent('loadedmetadata')
        .then(() => {
          this.player.currentTime(this.player.duration() - 0.1);
        });
    });
  }

  /**
   * Wait for the player ready event to complete
   * 
   * @return {Promise}
   */
  waitForReady() {
    return new this.Promise(resolve => {
      this.player.ready(resolve);
    });
  }

  /**
   * Wait until the media has reached a specified time
   * 
   * @param {number} time - Time to wait in seconds
   */
  waitForTime(time) {
    this.assert_('waitForTime: Requires a time', time || time === 0);
    this.assert_('waitForTime: Requires the player to be playing', !this.player.paused());

    return this.resolveWhenTimeReached_(time);
  }

  /**
   * Wait until the media has reached the end
   * Note: Does not cause the media to play. If wanting to skip
   * to the media end use the `end` helper.
   * 
   * @return {Promise}
   */
  waitForEnd() {
    this.assert_(
      'waitForEnd: Requires the player to be playing or to have already ended',
      !this.player.paused() || this.player.ended()
    );

    return new this.Promise(resolve => {
      if (this.player.ended()) {
        resolve();
        return;
      }

      this.player.one('ended', resolve);
    });
  }

  /**
   * Wait until the media has reached a specified time
   * 
   * @return {Promise}
   */
  waitForPlay() {
    return new this.Promise(resolve => {
      if (!this.player.paused()) {
        resolve();
        return;
      }

      this.player.one('playing', resolve);
    });
  }
}

// Define default values for the plugin's `state` object here.
MediaPlaybackTestHelpers.defaultState = {};

// Include the version number.
MediaPlaybackTestHelpers.VERSION = VERSION;

// Register the plugin with video.js.
videojs.registerPlugin('mediaPlaybackTestHelpers', MediaPlaybackTestHelpers);

export default MediaPlaybackTestHelpers;
