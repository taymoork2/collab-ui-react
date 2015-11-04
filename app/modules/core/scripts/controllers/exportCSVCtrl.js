'use strict';

angular.module('Core')
  .controller('ExportCSVCtrl', ['$scope', '$rootScope', 'UserListService', 'PartnerService', 'Log', 'Notification',
    function ($scope, $rootScope, UserListService, PartnerService, Log, Notification) {

      $scope.exporting = $rootScope.exporting;
      var promise = null;

      $scope.exportCSV = function () {
        if ($scope.exportType === $rootScope.typeOfExport.USER) {
          promise = UserListService.exportCSV($scope.activeFilter);
        } else if ($scope.exportType === $rootScope.typeOfExport.CUSTOMER) {
          promise = PartnerService.exportCSV();
        } else {
          Log.debug('Invalid export type: ' + $scope.exportType);
          Notification.notify('Invalid export', 'error');
        }

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
