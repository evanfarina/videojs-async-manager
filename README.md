<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [videojs-async-manager](#videojs-async-manager)
  - [Installation](#installation)
  - [Usage](#usage)
      - [Example](#example)
  - [Credit](#credit)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# videojs-async-manager

This plugin provides a set of test helpers that facilitate playing real media from your tests.

## Installation

via npm:
```sh
npm install --save videojs-async-manager
```

via yarn:
```sh
yarn add videojs-async-manager
```

## Usage

This plugin is meant to be used in tests. The first step is to get a reference to a [video.js player](https://docs.videojs.com/player) object.

```js
import videojs from 'video.js';

const player = videojs('some-player-id');
```

Once you have a player reference, you can now make calls to the test helpers like so:
```js
// Pause the test until the player's ready event has fired
await player.asyncManager().waitForReady();
```

#### Example 
This example uses [QUnit](https://qunitjs.com/) but the general idea will be the same regardless of your test framework. **One important note -** It's necesasry to pass the `enableSourceset` option to videojs because some of our helpers are reliant on the `sourceset` event firing.

```js
import videojs from 'video.js';

QUnit.module('Managing async from tests', {
  beforeEach: async function() {
    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    // Add the video to our test fixture
    this.fixture.appendChild(this.video);
    // Create a player instance. IMPORTANT
    this.player = videojs(this.video, {
      enableSourceset: true, // Note: Passing this option is required so that Player emits the sourceset event
    });
    // Create a plugin instance
    this.mediaWaiter = this.player.asyncManager();
    // Pause the test runner until the player's `ready` event has fired
    await this.mediaWaiter.waitForReady();
  },

  afterEach() {
    // Make sure to tear down the player instance after each test
    this.player.dispose();
  },
  
  Qunit.test('Media playback in tests!', async function() {
    // The player is already ready because of our waitForReady call in beforeEach.
    // Let's set the media's source...
    await this.mediaWaiter.setSource('assets/video/video-1s.mp4');
    
    // Request playback and wait for the media to begin playing
    await this.mediaWaiter.play();
    assert.ok(!this.player.paused(), 'The media is playing');
    
    // Request that the media pause
    await this.mediaWaiter.pause();
    assert.ok(this.player.paused(), 'is paused');
  });
  
  QUnit.test('seekToTime', async function(assert) {
    await this.mediaWaiter.setSource('assets/video/video-10s.mp4');
    await this.mediaWaiter.play();
    await this.mediaWaiter.seekToTime(2);

    assert.ok(this.player.currentTime() >= 2, 'seeked to 2s while playing');

    await this.mediaWaiter.pause();
    await this.mediaWaiter.seekToTime(4);
    assert.ok(this.player.currentTime() >= 4, 'seeked to 4s when paused');
  });
});
```

## Credit

Thanks to [Scott Parsons](https://www.linkedin.com/in/scottaparsons/) for writing much of the original code and getting these test helpers into a shareable state.


[videojs]:http://videojs.com/
