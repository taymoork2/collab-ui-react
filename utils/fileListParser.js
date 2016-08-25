/**
 * File list parsing utility
 */
'use strict';

var fs = require('fs');

function toList(filePath) {
  if (!filePath) {
    throw new Error('no \'filePath\' specified');
  }

  var listItems = [];

  try {
    listItems = fs.readFileSync(filePath, "utf8");
    listItems = listItems.split(/\r?\n/);
    listItems = listItems.filter(function (line) {
      return line.trim() !== '';
    });
  } catch (err) {
    throw new Error(err);
  }

  return listItems;
}

module.exports = {
  toList: toList
};
