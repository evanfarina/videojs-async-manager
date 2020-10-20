# videojs-media-playback-test-helpers

This plugin provides a set of test helpers that facilitate playing real media from your tests.

## Installation

via npm:
```sh
npm install --save videojs-media-playback-test-helpers
```

via yarn:
```sh
yarn add videojs-media-playback-test-helpers
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
await player.waitForReady();
```

A common practice is to create the player instance and wait for it to be in a ready state before each test. Below is an example using [QUnit](https://qunitjs.com/). **NOTE** - It's necesasry to pass the `enableSourceset` option to videojs because some of our helpers are reliant on the `sourceset` event firing.

```js
import videojs from 'video.js';

QUnit.module('test-helper-example', {
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
    this.plugin = this.player.mediaPlaybackTestHelpers();
    // Pause the test runner until the player's `ready` event has fired
    await this.plugin.waitForReady();
  },

  afterEach() {
    // Make sure to tear down the player instance after each test
    this.player.dispose();
  }
});
```

## Credit

Thanks to [Scott Parsons](https://www.linkedin.com/in/scottaparsons/) for writing much of the original code and getting these test helpers into a shareable state.


[videojs]:http://videojs.com/
