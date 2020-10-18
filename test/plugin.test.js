import 'regenerator-runtime/runtime.js';
import document from 'global/document';
import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';
import plugin from '../src/plugin';

// const Player = videojs.getComponent('Player');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-media-playback-test-helpers', {

  beforeEach: async function() {
    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video, {
      enableSourceset: true,
    });
    this.plugin = this.player.mediaPlaybackTestHelpers();

    await this.plugin.waitForReady();
  },

  afterEach() {
    this.player.dispose();
  }
});

QUnit.test('setSource/reset', async function(assert) {
  await this.plugin.setSource('assets/video/video-1s.mp4');
  assert.ok(this.player.currentSource().src, 'has a source');
  await this.plugin.reset();
  // After reset the 'src' is set to an empty string
  assert.notOk(this.player.currentSource().src, 'has no source after reset');
});

QUnit.test('play/pause', async function(assert) {
  await this.plugin.setSource('assets/video/video-1s.mp4');
  await this.plugin.play();
  assert.ok(!this.player.paused(), 'is not playing');

  await this.plugin.pause();
  assert.ok(this.player.paused(), 'is paused');
});

QUnit.test('mute', async function(assert) {
  await this.plugin.mute();
  assert.ok(this.player.muted(), 'was muted');
});

QUnit.test('mute resolves when already muted', async function(assert) {
  this.player.muted(true);
  await this.plugin.mute();
  assert.ok(this.player.muted(), 'still muted');
});

QUnit.test('unmute', async function(assert) {
  this.player.muted(true);
  await this.plugin.unmute();
  assert.ok(!this.player.muted(), 'was unmuted');
});

QUnit.test('unmute resolves when already unmuted', async function(assert) {
  await this.plugin.unmute();
  assert.ok(!this.player.muted(), 'still not muted');
});

QUnit.test('setVolume', async function(assert) {
  await this.plugin.setVolume(0.5);
  assert.equal(this.player.volume(), 0.5, 'volume was set');
});

QUnit.test('setVolume resolves when volume not changed', async function(assert) {
  const volume = this.player.volume();
  await this.plugin.setVolume(volume);
  assert.equal(this.player.volume(), volume, 'volume was set');
});

QUnit.test('setPoster', async function(assert) {
  const poster = 'assets/images/poster.jpg';
  await this.plugin.setPoster(poster);
  assert.equal(this.player.poster(), poster, 'poster was set');
});
