(function () {
  'use strict';

  angular.module('Core').filter('userListFilter', userListFilter);

  /* @ngInject */
  function userListFilter($filter) {
    return function (status) {
      if (typeof status === 'undefined' || status === null || status == 'active') {
        return $filter('translate')('usersPage.active');
      } else if (status === 'pending') {
        return $filter('translate')('usersPage.pending');
      } else if (status === 'error') {
        return $filter('translate')('usersPage.error');
      }
    };
  }
})();
