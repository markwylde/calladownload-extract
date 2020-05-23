const fs = require('fs');
const tar = require('tar');
const zlib = require('zlib');
const calladownload = require('calladownload');

function extractTarball (sourceFile, destination, callback) {
  if (/(gz|tgz)$/i.test(sourceFile)) {
    // This file is gzipped, use zlib to deflate the stream before passing to tar.
    fs.createReadStream(sourceFile)
      .pipe(zlib.createGunzip())
      .pipe(tar.x({ C: destination }))
      .on('error', function (er) { callback(er); })
      .on('end', function () { callback(null); });
  } else {
    // This file is not gzipped, just deflate it.
    fs.createReadStream(sourceFile)
      .pipe(tar.x({ C: destination }))
      .on('error', function (er) { callback(er); })
      .on('end', function () { callback(null); });
  }
}

function extractTarballDownload (url, downloadFile, destination, options, callback) {
  if (!options) options = {};
  calladownload(url, downloadFile, options, function (error) {
    if (error) {
      return callback(error);
    }

    extractTarball(downloadFile, destination, function (error, data) {
      if (error) {
        return callback(error);
      }
      callback(null, { url: url, downloadFile: downloadFile, destination: destination });
    });
  });
}

exports.extractTarball = extractTarball;
exports.extractTarballDownload = extractTarballDownload;
