(function() {
  'use strict';

  angular.module('Core').filter('capacityFilter', function ($filter) {
    return function (capacity, offerName) {
      if (capacity && offerName) {
        return $filter('translate')(offerName);
      }
      return '';
    };
  });
})();