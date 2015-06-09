(function () {
  'use strict';
  angular
    .module('Hercules')
    .controller('ExportUserStatusesController',
      /* @ngInject */
      function ($scope, USSService) {
        $scope.loading = true;
        $scope.exportError = true;
        $scope.exportActivated = false;
        $scope.exportPending = false;

        USSService.getStatusesSummary(function (err, userStatusesSummary) {
          var summary;
          if (userStatusesSummary) {
            summary = _.find(userStatusesSummary.summary, function (s) {
              return s.serviceId == $scope.selectedServiceId;
            });
          }
          $scope.summary = summary || {
            activated: 0,
            notActivated: 0,
            error: 0
          };
          $scope.loading = false;
        });

        $scope.exportCsv = function () {
          $scope.exportingUserStatusReport = true;
          // TODO: Do the export
        };
      });
})();
