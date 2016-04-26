(function () {
  'use strict';

  angular.module('Mediafusion').filter('devStatus', function () {
    return function (mgmtStatus) {
      return (mgmtStatus) ? 'Stopped' : 'Active';
    };
  });
})();
