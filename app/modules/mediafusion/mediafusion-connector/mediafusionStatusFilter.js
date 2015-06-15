'use strict';

angular.module('Mediafusion').filter('devStatus', function () {
  return function (mgmtStatus) {
    ////console.log("devStatus statusFilter mgmtStatus = " + mgmtStatus);
    return (mgmtStatus) ? 'Stopped' : 'Active';
  };
});
