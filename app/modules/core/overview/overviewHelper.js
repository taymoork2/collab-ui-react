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
          if (oldStatus == 'danger') return 'danger';
          if (componentStatus == "partial_outage" || oldStatus == 'warning') return "warning";
          if (componentStatus == "operational") return "success";
          return "danger";
        }

        var statusIds = {
          //Spark
          SparkMessage: '4z5sdybd2jxy',
          SparkCall: 'gfg7cvjszyw0',
          CCMAdministration: '7v9ds0q2zfsy',
          SparkHybridServices: 'f8tnkxbzs12q',
          DeveloperApi: 'vn0b18kjj7nf',
          SparkAccount: 'kq245y682023',

          //huron status ids:
          huronAdministrationPortal: '7wsvlx8l1jrt',
          huronExternalNetworks: 's74l4c9767vr',
          huronPhoneCalls: 'hj719nnf2x53',
          huronEndUserPortal: 'tf9lqz2w33h6',
          huronDeviceOnboarding: 'd2v3k4zvtd5h',
          huronMediaService: 'y3pns3gxww3h',
          huronVoicemailService: 'lc8wl40ssck0'
        };

        return {
          isntCancelledOrSuspended: isntCancelledOrSuspended,
          mapStatus: mapStatus,
          statusIds: statusIds
        };
      });
})();
