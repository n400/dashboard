'use strict';

const argv = process.argv.slice(2);

// Select package to build
require('../config/select-package')(argv, function(pkg, idx) {
  process.env.PACKAGE = pkg;
  argv.splice(idx, 1);
});

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/node-path').includeAllPackages();
require('../config/env');

const jest = require('jest');

// Watch unless on CI or in coverage mode
if (!process.env.CI && argv.indexOf('--coverage') < 0) {
  argv.push('--watch');
}


jest.run(argv);
