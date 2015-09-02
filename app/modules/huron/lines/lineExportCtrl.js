(function () {
  'use strict';

  angular.module('Huron')
    .controller('LineExportCtrl', ['$scope', '$rootScope', 'LineListService', 'Notification',
      function ($scope, $rootScope, LineListService, Notification) {

        $scope.exportBtn = {
          disabled: false
        };

        $scope.exportCSV = function () {
          var promise = LineListService.exportCSV($scope);
          promise.then(null, function (error) {
            Notification.notify(Array.new(error), 'error');
          });
          return promise;
        };

        if ($rootScope.exporting === true) {
          $scope.exportBtn.disabled = true;
        }

        $scope.$on('EXPORT_FINISHED', function () {
          $scope.exportBtn.disabled = false;
        });
      }
    ]);
})();
