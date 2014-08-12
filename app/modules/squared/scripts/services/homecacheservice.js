'use strict';

angular.module('Squared')
  .factory('homeCache', function($cacheFactory) {
  	return $cacheFactory('homeCache');
  });