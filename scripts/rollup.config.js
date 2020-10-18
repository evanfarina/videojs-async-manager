const generate = require('videojs-generate-rollup-config');
import copy from 'rollup-plugin-copy'

// see https://github.com/videojs/videojs-generate-rollup-config
// for options
const options = {
	plugins(defaults) {
		return {
			browser: defaults.browser.concat([
        'copy'
      ]),
			test: defaults.test.concat([
        'copy'
			]),
			module: defaults.module.concat([
        'copy'
      ]),
		}
	},
	primedPlugins(defaults) {
    return Object.assign(defaults, {
      copy: copy({
				targets: [
					{
						src: 'testt',
						dest: 'testt'
					},
				]
			})
    });
  }
};
const config = generate(options);

// Add additonal builds/customization here!

// export the builds to rollup
export default Object.values(config.builds);
