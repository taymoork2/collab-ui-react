(function() {
  'use strict';

  angular.module('Mediafusion').filter('eventListFilter', function ($filter) {

    /* Returning the Actual status based on the status value retrieved from backend. 
     *
     */
    /*return function (status) {
      return (status === 'Active') ? $filter('translate')('eventPage.active') : $filter('translate')('eventPage.pending');
    };*/
  });
})();