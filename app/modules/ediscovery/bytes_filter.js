(function () {
  'use strict';

  /* @ngInject */
  function BytesFilter() {
    return function (bytes, precision) {
      if (bytes === 0) {
        return '0';
      }
      if (_.isNaN(parseFloat(bytes)) || !_.isFinite(bytes)) {
        return '';
      }
      if (typeof precision === 'undefined') {
        precision = 1;
      }

      var units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024)),
        val = (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision);

      return (val.match(/\.0*$/) ? val.substr(0, val.indexOf('.')) : val) + ' ' + units[number];
    };
  }

  module.exports = angular.module('ediscovery.bytes', [])
    .filter('bytesFilter', BytesFilter)
    .name;
}());
