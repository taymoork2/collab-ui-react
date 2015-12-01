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

        var statusIds = {
          AdministrationPortal: 'j76kyrpvqt0z',
          ExternalNetworks: 'qlnmz8l9gpj1',
          HelpAndFeedback: 'f9l0kdsmtxdh',
          MediaCalling: 'bn5g1kfrkn9z',
          MobileClients: '3jt3mznmj93f',
          Rooms: 'g2pw271l0wdx',
          WebAndDesktopClients: 'nnpr95kck99p',
          CalendarService: 'kwyx8ylxsbvb',
          CloudHybridServicesManagement: '46zcdvc5cxcd',
          SparkDeveloperAPI: 'vn0b18kjj7nf',

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
