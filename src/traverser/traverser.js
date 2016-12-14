let fs = require('fs');
let path = require('path');
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

const isValidFile = (file, extensions) => {
  return extensions.length > 0 ? extensions.indexOf(path.extname(file)) >= 0 : true;
};

const readFile = (fileName) => {
  return fs.readFileSync(fileName, {encoding: ENCODING});
};

const readFiles = (files, dir, extensions, fileHandler) => {
  let subDirectories = [];

  files.forEach((file) => {
    let filePath = path.join(dir, file);

    if (isDirectory(filePath)) {
      subDirectories.push(filePath);
    } else if (isValidFile(file, extensions)) {
      fileHandler(readFile(filePath), filePath);
    }
  });

  return subDirectories;
};

const readDirectory = (root, opts, fileHandler) => {
  if (!isDirectory(root)) {
    throw new Error(root + ' is not a directory.');
  }

  let validExtensions = opts.extensions || [];
  let files = fs.readdirSync(root);
  let subDirectories = readFiles(files, root, validExtensions, fileHandler);

  subDirectories.forEach((directory) => {
    readDirectory(directory, opts, fileHandler);
  });
};

export default readDirectory;