const generate = require('videojs-generate-karma-config');

module.exports = function(config) {

  // see https://github.com/videojs/videojs-generate-karma-config
  // for options
  const options = {
    browsers() {
      return ['chromeWithFlags'];
    },
    
    customLaunchers(defaults) {
      return Object.assign(defaults, {
        chromeWithFlags: {
          base: 'ChromeHeadless',
          flags: [
            '--disable-translate',
            '--disable-extensions',
            // Chrome 66+ introduces a policy that requires user interaction before autoplay is allowed
            // this flag disables that policy and allows autoplay regardless of user interaction
            '--autoplay-policy=no-user-gesture-required',
          ]
        }
      });
    },
  };

  config = generate(config, options);

  // any other custom stuff not supported by options here!
};
