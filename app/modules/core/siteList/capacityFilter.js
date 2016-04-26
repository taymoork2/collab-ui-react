(function() {
  'use strict';

  angular.module('Core').filter('capacityFilter', capacityFilter);

  function capacityFilter($filter) {
    return function (capacity, offerName) {
      if (capacity && offerName) {
        return $filter('translate')(offerName);
      }
      return '';
    };
  }
})();
