(function () {
  'use strict';

  angular.module('Mediafusion').filter('metricsListFilter', metricsListFilter);

  /* @ngInject */
  function metricsListFilter($filter) {

    /* Returning the Actual status based on the status value retrieved from backend.
     *
     */
    return function (status) {
      return (status === 'Active') ? $filter('translate')('metricsPage.active') : $filter('translate')('metricsPage.pending');
    };
  }
})();
