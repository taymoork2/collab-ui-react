'use strict';

angular.module('Huron').filter('lineListFilter', function ($filter) {
  return function (status) {
    return (typeof status === 'undefined' || status === null || status == 'active') ? $filter('translate')('usersPage.active') : $filter('translate')('usersPage.pending');
  };
});
