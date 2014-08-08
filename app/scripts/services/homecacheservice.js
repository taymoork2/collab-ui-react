'use strict';

angular.module('wx2AdminWebClientApp')
  .factory('homeCache', function($cacheFactory) {
  	return $cacheFactory('homeCache');
  });