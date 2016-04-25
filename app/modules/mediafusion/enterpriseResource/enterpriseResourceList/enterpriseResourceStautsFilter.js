(function() {
  'use strict';

  angular.module('Mediafusion').filter('status', function () {
    return function (mgmtStatus) {
      ////console.log("statusFilter mgmtStatus = " + mgmtStatus);
      return (mgmtStatus === null || mgmtStatus === 'MANAGED') ? 'Active' : 'Deactivated';
    };
  });

  angular.module('Mediafusion').filter('suspendResume', function ($filter) {
    return function (mgmtStatus) {
      ////console.log("suspendResumeFilter mgmtStatus = " + mgmtStatus);
      return (mgmtStatus === null || mgmtStatus === 'MANAGED') ? $filter('translate')('vtsPage.takeOffline') : $filter('translate')('vtsPage.bringOnline');
    };
  });
})();