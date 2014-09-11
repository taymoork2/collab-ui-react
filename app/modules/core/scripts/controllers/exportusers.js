'use strict';

angular.module('Core')
  .controller('ExportUsersCtrl', ['$scope', '$rootScope', 'UserListService', 'Notification',
    function($scope, $rootScope, UserListService, Notification) {

      $scope.exportBtn = {
        disabled: false
      };

      $scope.exportCSV = function() {
        var promise = UserListService.exportCSV($scope);
        promise.then(null, function(error) {
          Notification.notify(Array.new(error), 'error');
        });

        return promise;
      };

      if ($rootScope.exporting === true) {
        $scope.exportBtn.disabled = true;
      }

      $scope.$on('EXPORT_FINISHED', function() {
        $scope.exportBtn.disabled = false;
      });
    }
]);
