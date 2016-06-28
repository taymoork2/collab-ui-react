(function () {
  'use strict';

  angular
    .module('Core')
    .factory('OverviewHelper',
      function () {

        function isntCancelledOrSuspended(license) {
          return !(license.status === 'CANCELLED' || license.status === 'SUSPENDED');
        }

        function isExpired(license) {
          // expired includes everything but active + pending, such as disabled
          return !(license.status === 'ACTIVE' || license.status === 'PENDING');
        }

        function mapStatus(oldStatus, componentStatus) {
          if (oldStatus == 'danger') return 'danger';
          if (componentStatus == "partial_outage" || componentStatus == 'degraded_performance' || oldStatus == 'warning') return "warning";
          if (componentStatus == "operational") return "success";
          return "danger";
        }

        var statusIds = {
          //Spark
          SparkMeeting: 'lkjcjdfgfnbk',
          SparkMessage: '4z5sdybd2jxy',
          SparkCall: 'gfg7cvjszyw0',
          CCMAdministration: '7v9ds0q2zfsy',
          SparkHybridServices: 'f8tnkxbzs12q',
          DeveloperApi: 'vn0b18kjj7nf',
          SparkAccount: 'kq245y682023'
        };

        return {
          isntCancelledOrSuspended: isntCancelledOrSuspended,
          isExpired: isExpired,
          mapStatus: mapStatus,
          statusIds: statusIds
        };
      });
})();
