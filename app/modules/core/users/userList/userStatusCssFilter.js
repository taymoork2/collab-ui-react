'use strict';

angular.module('Core').filter('userStatusCssFilter', function ($filter) {
  return function (status) {
    return (typeof status === 'undefined' || status === null || status == 'active') ? 'user-status-green' : 'user-status-yellow';
  };
});
