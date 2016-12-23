let fs = require('fs');
let path = require('path');
let _ = require('lodash');
const ENCODING = 'utf-8';

const isDirectory = (file) => {
  if(!file) {
    throw new Error(file + ' is not a file');
  }

  let stat = undefined;

  try {
    stat = fs.statSync(file);
  } catch(error) {
    throw new Error(file + ' does not exist');
  }

  return stat.isDirectory();
};

const isValidFile = (file, opts) => {
  let includeExtensions = opts.include || [];
  let excludeExtensions = opts.exclude || [];
  let isExcluded = _.find(excludeExtensions, (ext) => _.endsWith(file, ext));
  let isIncluded = includeExtensions.length > 0 ? _.find(includeExtensions, (ext) => _.endsWith(file, ext)) : true;
  return isIncluded && !isExcluded;
};

const readFile = (fileName) => {
  return fs.readFileSync(fileName, {encoding: ENCODING});
};

const readFiles = (files, dir, opts, fileHandler) => {
  let subDirectories = [];

  files.forEach((file) => {
    let filePath = path.join(dir, file);

    if (isDirectory(filePath)) {
      subDirectories.push(filePath);
    } else if (isValidFile(file, opts)) {
      fileHandler(readFile(filePath), filePath);
    }
  });

  return subDirectories;
};

const readDirectory = (root, opts, fileHandler) => {
  if (!isDirectory(root)) {
    throw new Error(root + ' is not a directory.');
  }

  let files = fs.readdirSync(root);
  let subDirectories = readFiles(files, root, opts, fileHandler);

  subDirectories.forEach((directory) => {
    readDirectory(directory, opts, fileHandler);
  });
};

module.exports = readDirectory;