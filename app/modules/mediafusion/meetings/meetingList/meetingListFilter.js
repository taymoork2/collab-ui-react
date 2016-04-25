(function() {
  'use strict';

  angular.module('Mediafusion').filter('meetingListFilter', function ($filter) {

    /* Returning the Actual status based on the status value retrieved from backend. 
     *
     */
    return function (status) {
      return (status === 'Active') ? $filter('translate')('meetingsPage.active') : $filter('translate')('meetingsPage.pending');
    };
  });
})();