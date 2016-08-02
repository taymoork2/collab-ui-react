(function () {
  'use strict';

  angular.module('Core').filter('userListFilter', userListFilter);

  /* @ngInject */
  function userListFilter($filter) {
    return function (status) {
      var translate = status || 'active';
      return $filter('translate')('usersPage.' + translate);
    };
  }
})();
