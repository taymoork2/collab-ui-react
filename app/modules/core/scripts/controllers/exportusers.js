'use strict';

angular.module('Core')
  .controller('ExportUsersCtrl', ['$scope', '$rootScope', 'UserListService', 'Notification', '$translate',
    function ($scope, $rootScope, UserListService, Notification, $translate) {

      $scope.exportCSV = function () {
        var promise = UserListService.exportCSV($scope.activeFilter);
        promise.then(null, function (error) {
          Notification.notify(error, 'error');
        });

        return promise;
      };

      // Set the appropriate export icon and tooltip where it shows an
      // export to CSV is taking place
      $scope.$on('EXPORTING', function () {
        $('#export-icon').html('<i class=\'icon icon-spinner icon-lg\'></i>');
        $scope.exportIconTooltip = $translate.instant('usersPage.csvBtnExportingTitle');
      });

      // Set the appropriate export icon and tooltip where it shows
      // export to CSV has completed
      $scope.$on('EXPORT_FINISHED', function () {
        $('#export-icon').html('<i class=\'icon icon-content-share icon-lg\'></i>');
        $scope.exportIconTooltip = $translate.instant('usersPage.csvBtnTitle');
      });
    }
  ]);
