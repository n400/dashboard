'use strict';

const path = require('path');
const paths = require('./paths');

function addToNodePath(dirs) {
  process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .concat(dirs)
    .join(path.delimiter);
}

function includeAllPackages() {
  addToNodePath(['node_modules'].concat(
    paths.crossPackageDependecies.map(pkg =>
      path.relative(paths.appDirectory, path.resolve(pkg, 'node_modules'))
    )
  ));
}

function includeRunningPackage() {
  addToNodePath([
    'node_modules',
    `${paths.appDirectory}/node_modules`
  ]);
}

module.exports = {
  includeRunningPackage: includeRunningPackage,
  includeAllPackages: includeAllPackages
}
