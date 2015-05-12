'use strict';

angular.module('Mediafusion').filter('status', function () {
  return function (mgmtStatus) {
    ////console.log("statusFilter mgmtStatus = " + mgmtStatus);
    return (mgmtStatus) ? 'Stopped' : 'Active';
  };
});
