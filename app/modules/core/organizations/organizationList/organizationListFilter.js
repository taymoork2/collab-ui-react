'use strict';

angular.module('Core').filter('organizationsListFilter', function ($filter) {
  return function (status) {
    return (typeof status === 'undefined' || status === null || status == 'active') ? $filter('translate')('org.active') : $filter('translate')('org.pending');
  };
});
