let _ = require('lodash');

const resolveFileName = (fileName) => {
  if (!fileName) {
    throw new Error('File name does not exist ' + fileName);
  }

  let fileNameArr = fileName.split(/\./);
  fileNameArr.splice(fileNameArr.length - 1, 1);

  return _.camelCase(fileNameArr.join('.'));
};

const resolveRelativePath = (root, absPath) => {
  let result = '';
  let rootArr = typeof root === 'string' ? _.without(root.split(/\/|\\/), '') : root;
  let absArr = typeof absPath === 'string' ? _.without(absPath.split(/\/|\\/), '') : absPath;
  let matchesNum = 0;

  while(rootArr[matchesNum] === absArr[matchesNum]) {
    matchesNum++;
    if (matchesNum >= rootArr.length || matchesNum >= absArr.length) {
      break;
    }
  }

  let goBack = rootArr.length - matchesNum;

  if (goBack === 0) {
    result += './';
  }

  while (goBack > 0) {
    result += '../';
    goBack--;
  }

  while (matchesNum < absArr.length) {
    result += absArr[matchesNum] + '/';
    matchesNum++;
  }

  return result;
};

const resolveRelativeUrl = (root, absPath) => {
  let rootArr = _.without(root.split(/\/|\\/), '');
  let absArr = _.without(absPath.split(/\/|\\/), '');

  let fileName = absArr.splice(absArr.length - 1, 1);
  rootArr.splice(rootArr.length - 1, 1);

  return resolveRelativePath(rootArr, absArr) + fileName;
};

const getRootDirectory = (filePath) => {
  let rootArr = _.without(filePath.split(/\/|\\/), '');
  rootArr.splice(rootArr.length - 1, 1);
  return rootArr.join('/');
};

module.exports = {
  resolveFileName,
  resolveRelativePath,
  resolveRelativeUrl,
  getRootDirectory
};