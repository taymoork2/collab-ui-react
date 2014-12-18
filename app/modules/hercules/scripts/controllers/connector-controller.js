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
        service.fetch(function (err, data) {
          if (err) {
            var msgs = [];
            msgs.push('Unable to fetch data from the UC fusion backend');
            if (err.data) {
              msgs.push(err.data);
            }
            notif.notify(msgs, 'error');
          }
          $scope.clusters = data || [];
          $scope.loading = false;
        });
      };

      $scope.reload = function () {
        $scope.loading = true;
        loadData();
      };

      $scope.upgradeSoftware = function (clusterId, serviceType) {
        service.upgradeSoftware({
          clusterId: clusterId,
          serviceType: serviceType,
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
