'use strict';

/* global _ */

angular.module('Hercules')
  .controller('ConnectorCtrl', ['$scope', '$rootScope', '$http', 'ConnectorService', 'Notification',
    function ($scope, $rootScope, $http, service, notif) {
      notif.init($scope);
      $scope.popup = notif.popup;

      $scope.loading = true;

      var loadData = function () {
        $scope.clusters = [];
        service.fetch({
          success: function (data) {
            $scope.clusters = data;
            $scope.loading = false;
          },
          error: function () {
            $scope.error = true;
            $scope.loading = false;
          }
        });
      };

      $scope.reload = function () {
        $scope.loading = true;
        loadData();
      };

      $scope.upgradeSoftware = function (clusterId, tlpUrl) {
        service.upgradeSoftware({
          clusterId: clusterId,
          tlpUrl: tlpUrl,
          success: $scope.reload,
          error: function (data, status) {
            notif.notify(['Request failed with status ' + status], 'error');
          }
        });
        return false;
      };

      loadData();
    }
  ]);
