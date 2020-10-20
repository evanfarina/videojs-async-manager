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

To include videojs-media-playback-test-helpers on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-media-playback-test-helpers.min.js"></script>
<script>
  var player = videojs('my-video');

  player.mediaPlaybackTestHelpers();
</script>
```

### Browserify/CommonJS

When using with Browserify, install videojs-media-playback-test-helpers via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-media-playback-test-helpers');

var player = videojs('my-video');

player.mediaPlaybackTestHelpers();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-media-playback-test-helpers'], function(videojs) {
  var player = videojs('my-video');

  player.mediaPlaybackTestHelpers();
});
```

## Credit

Thanks to [Scott Parsons](https://www.linkedin.com/in/scottaparsons/) for writing much of the original code and getting these test helpers into a shareable state.


[videojs](http://videojs.com/)
