(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHelper',
      function () {

        function isntCancelledOrSuspended(license) {
          return !(license.status === 'CANCELLED' || license.status === 'SUSPENDED');
        }

        function mapStatus(oldStatus, componentStatus) {
          if (oldStatus == 'error') return 'error';
          if (componentStatus == "partial_outage" || oldStatus == 'warning') return "warning";
          if (componentStatus == "operational") return "success";
          return "error";
        }

        return {
          isntCancelledOrSuspended: isntCancelledOrSuspended,
          mapStatus: mapStatus,
        };
      });
})();
