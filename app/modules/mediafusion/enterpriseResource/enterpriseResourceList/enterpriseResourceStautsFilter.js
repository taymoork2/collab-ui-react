'use strict';

angular.module('Mediafusion').filter('statusFilter', function ($filter) {
  return function (status) {
    // console.log(status);
    return (status == null || status === 'ENABLED') ? 'Active' : 'Offline';
  };
});
