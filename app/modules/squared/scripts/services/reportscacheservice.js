'use strict';

angular.module('Squared')
  .factory('reportsCache', function($cacheFactory) {
    return $cacheFactory('reportsCache');
  });