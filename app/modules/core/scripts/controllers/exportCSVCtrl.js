(function () {
  'use strict';

  angular.module('Core')
    .controller('ExportCSVCtrl', ExportCSVCtrl);

  /* @ngInject */
  function ExportCSVCtrl($scope, $rootScope, $translate, $q, FeatureToggleService, UserListService, PartnerService, Log, Notification) {

    $scope.exporting = $rootScope.exporting;
    var promise = null;

    $scope.isCareEnabled = false;
    FeatureToggleService.atlasCareTrialsGetStatus().then(function (careStatus) {
      $scope.isCareEnabled = careStatus;
    });

    $scope.exportCSV = function () {
      if ($scope.exportType === $rootScope.typeOfExport.USER) {
        promise = UserListService.exportCSV($scope.activeFilter);
      } else if ($scope.exportType === $rootScope.typeOfExport.CUSTOMER) {
        promise = PartnerService.exportCSV($scope.isCareEnabled);
      } else {
        Log.debug('Invalid export type: ' + $scope.exportType);
        Notification.notify([$translate.instant('errors.csvError')], 'error');
        promise = null;
      }

      if (promise) {
        promise.then(null, function (error) {
          Log.debug(error);
          Notification.notify([$translate.instant('errors.csvError')], 'error');
        }).finally(function () {
          $rootScope.exporting = false;
          $rootScope.$broadcast('EXPORT_FINISHED');
        });
        return promise;
      }
      return $q.reject();
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
})();
