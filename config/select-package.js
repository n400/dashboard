'use strict';

const packageParam = '--package=';

function findPackageParam(args, callback) {
  var idx = null;
  for (var i = 0; i < args.length; i++) {
    if (args[i].indexOf(packageParam) === 0) {
      idx = i;
      break;
    }
  }

  if (idx !== null) {
    callback(args[idx].replace(packageParam, ''), idx);
  }
}

module.exports = findPackageParam;
