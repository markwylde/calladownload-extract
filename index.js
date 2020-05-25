const fs = require('fs');
const tar = require('tar');
const zlib = require('zlib');
const unzipper = require('unzipper');
const calladownload = require('calladownload');

function fileExists (file, callback) {
  fs.stat(file, function (error, stat) {
    if (error === null) {
      callback(null, true);
    } else if (error.code === 'ENOENT') {
      callback(null, false);
    } else {
      callback(error);
    }
  });
}

function extractTarball (sourceFile, destination, callback) {
  fs.mkdir(destination, function (error) {
    if (error) {
      // don't care
    }

    if (/(gz|tgz)$/i.test(sourceFile)) {
      fs.createReadStream(sourceFile)
        .pipe(zlib.createGunzip())
        .pipe(tar.x({ C: destination, strip: 1 }))
        .on('error', function (er) { callback(er); })
        .on('end', function () { callback(null); });
    } else {
      fs.createReadStream(sourceFile)
        .pipe(tar.x({ C: destination, strip: 1 }))
        .on('error', function (er) { callback(er); })
        .on('end', function () { callback(null); });
    }
  });
}

function extractZip (sourceFile, destination, callback) {
  fs.createReadStream(sourceFile)
    .pipe(unzipper.Extract({ path: destination }))
    .on('error', function (er) { callback(er); })
    .on('finish', function () { callback(null); });
}

function extractDownload (extractFn) {
  return function (url, downloadFile, destination, options, callback) {
    if (!options) {
      options = {};
    }

    function doExtract () {
      extractFn(downloadFile, destination, function (error, data) {
        if (error) {
          return callback(error);
        }
        callback(null, { url: url, downloadFile: downloadFile, destination: destination });
      });
    }

    fileExists(downloadFile, function (error, exists) {
      if (error) {
        return callback(error);
      }

      if (exists) {
        return doExtract();
      }

      calladownload(url, downloadFile, options, function (error) {
        if (error) {
          return callback(error);
        }

        doExtract();
      });
    });
  };
}

module.exports = {
  extractTarball,
  extractZip,
  extractTarballDownload: extractDownload(extractTarball),
  extractZipDownload: extractDownload(extractZip)
};
