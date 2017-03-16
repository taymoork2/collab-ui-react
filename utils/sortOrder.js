'use strict';

/**
 * Sorting order for the files to load
 */
/* eslint-env es6 */
function sortOrder(a, b) {
  const index = { preload: 3, styles: 2, app: 1 };
  const aI = index[a.names[0]];
  const bI = index[b.names[0]];
  return aI && bI ? bI - aI : -1;
}

module.exports = sortOrder;
