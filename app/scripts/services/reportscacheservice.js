'use strict';

angular.module('wx2AdminWebClientApp')
  .factory('reportsCache', function($cacheFactory) {
  	return $cacheFactory('reportsCache');
  });