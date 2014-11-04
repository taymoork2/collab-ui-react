'use strict';

angular.module('Core').filter('userListFilter', function ($filter) {
  return function (status) {
    return status == null ? $filter('translate')('usersPage.active') : $filter('translate')('usersPage.pending');
  };
});
