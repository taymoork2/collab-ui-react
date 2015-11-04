'use strict';

angular.module('Core')
  .controller('ExportCustomersCtrl', ['$scope', '$rootScope', 'PartnerService', 'Notification',
    function ($scope, $rootScope, PartnerService, Notification) {

      $scope.exporting = $rootScope.exporting;

      $scope.exportCSV = function () {
        var promise = PartnerService.exportCSV();
        promise.then(null, function (error) {
          Notification.notify(error, 'error');
        });

        return promise;
      };

      // Set exporting value in $scope to true if an
      // export to CSV is taking place
      $scope.$on('EXPORTING', function () {
        $scope.exporting = true;
      });

      // Set exporting value in $scope to false if there's
      // no export to CSV taking place
      $scope.$on('EXPORT_FINISHED', function () {
        $scope.exporting = false;
      });
    }
  ]);
