(function() {
  'use strict';

  angular.module('Mediafusion').filter('alarmListFilter', alarmListFilter);

  /* @ngInject */
  function alarmListFilter($filter) {

    /* Returning the Actual status based on the status value retrieved from backend.
     *
     */
    /*return function (status) {
      return (status === 'Active') ? $filter('translate')('alarmPage.active') : $filter('translate')('alarmPage.pending');
    };*/
  }
})();
