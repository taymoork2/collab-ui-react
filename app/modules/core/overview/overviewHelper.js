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
          SparkDeveloperAPI: 'vn0b18kjj7nf'
        };

        return {
          isntCancelledOrSuspended: isntCancelledOrSuspended,
          mapStatus: mapStatus,
          statusIds: statusIds
        };
      });
})();
