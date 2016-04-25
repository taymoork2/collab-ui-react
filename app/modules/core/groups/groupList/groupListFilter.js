(function() {
  'use strict';

  angular.module('Core').filter('userListFilter', function ($filter) {
    return function (status) {
      // //console.log(status);
      return (status === null || status == 'active') ? $filter('translate')('usersPage.active') : $filter('translate')('usersPage.pending');
    };
  });
})();