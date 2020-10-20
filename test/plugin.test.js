import 'regenerator-runtime/runtime.js';
import document from 'global/document';
import QUnit from 'qunit';
import sinon from 'sinon';
import videojs from 'video.js';
import plugin from '../src/plugin';

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
    this.sandbox = sinon.createSandbox();
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
  assert.ok(this.player.currentSource().src, 'The media has a source');
  await this.plugin.reset();
  // After reset the 'src' is set to an empty string
  assert.notOk(this.player.currentSource().src, 'The media has no source after reset');
});

QUnit.test('play/pause', async function(assert) {
  await this.plugin.setSource('assets/video/video-1s.mp4');
  await this.plugin.play();
  assert.ok(!this.player.paused(), 'The media is playing');

  await this.plugin.pause();
  assert.ok(this.player.paused(), 'The media is paused');
});

QUnit.test('mute', async function(assert) {
  await this.plugin.mute();
  assert.ok(this.player.muted(), 'The media was muted');
});

QUnit.test('mute resolves when already muted', async function(assert) {
  this.player.muted(true);
  await this.plugin.mute();
  assert.ok(this.player.muted(), 'The media is still muted');
});

QUnit.test('unmute', async function(assert) {
  this.player.muted(true);
  await this.plugin.unmute();
  assert.ok(!this.player.muted(), 'The media was unmuted');
});

QUnit.test('unmute resolves when already unmuted', async function(assert) {
  await this.plugin.unmute();
  assert.ok(!this.player.muted(), 'The media is unmuted');
});

QUnit.test('setVolume', async function(assert) {
  await this.plugin.setVolume(0.5);
  assert.equal(this.player.volume(), 0.5, 'The volume was set');
});

QUnit.test('setVolume resolves when volume not changed', async function(assert) {
  const volume = this.player.volume();
  await this.plugin.setVolume(volume);
  assert.equal(this.player.volume(), volume, 'The volume was set');
});

QUnit.test('setPoster', async function(assert) {
  const poster = 'assets/images/poster.jpg';
  await this.plugin.setPoster(poster);
  assert.equal(this.player.poster(), poster, 'The poster was set');
});

QUnit.test('seekToEnd', async function(assert) {
  await this.plugin.setSource('assets/video/video-10s.mp4');
  await this.plugin.seekToEnd();
  assert.ok(this.player.ended(), 'player is ended');
});

QUnit.test('seekToTime', async function(assert) {
  await this.plugin.setSource('assets/video/video-10s.mp4');
  await this.plugin.play();
  await this.plugin.seekToTime(2);

  assert.ok(this.player.currentTime() >= 2, 'seeked to 2s while playing');

  await this.plugin.pause();
  await this.plugin.seekToTime(4);
  assert.ok(this.player.currentTime() >= 4, 'seeked to 4s when paused');
});

QUnit.test('waitForTime', async function(assert) {
  await this.plugin.setSource('assets/video/video-10s.mp4');
  await this.plugin.play();
  await this.plugin.waitForTime(1);

  const currentTime = this.player.currentTime();
  assert.ok(currentTime > 1 && currentTime < 3, 'waited until after 1s');

  await this.plugin.waitForTime(3);

  assert.ok(this.player.currentTime() > 3, 'waited until after 3s');
});

QUnit.test('waitForEnd', async function(assert) {
  await this.plugin.setSource('assets/video/video-1s.mp4');
  await this.plugin.play();
  await this.plugin.waitForEnd();

  assert.ok(this.player.ended(), 'is ended');

  // Make sure an error isn't thrown if waitForEnd is called after the player has ended
  await this.plugin.waitForEnd();
  assert.ok(true, 'The test did not hang and no error was thrown');
});

QUnit.test('waitForEvent: loadstart', async function(assert) {
  const onLoadStart = this.sandbox.stub();

  this.plugin.waitForEvent('loadstart').then(onLoadStart);
  await this.plugin.setSource('assets/video/video-1s.mp4');

  await this.plugin.play();

  assert.ok(onLoadStart.calledOnce, 'called on loadstart');
});