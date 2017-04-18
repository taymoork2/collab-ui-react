'use strict';

const entries = [
  'manifest',
  'preload',
  'styles',
  'bootstrap-vendor',
  'bootstrap',
];

function sortOrder(a, b) {
  const entryA = a.names[0];
  const entryB = b.names[0];

  // prefer 'a' over 'b' if either entry is not found
  if (!entries.includes(entryA) || !entries.includes(entryB)) {
    return -1;
  }

  // otherwise, let their index values decide the sort
  return entries.indexOf(entryA) - entries.indexOf(entryB);
}

module.exports = sortOrder;
