'use strict';

/* global _ */

angular.module('Hercules')
  .controller('ConnectorCtrl', ['$scope', '$rootScope', '$http', 'ConnectorGrouper', 'ConnectorService', 'Notification',
    function ($scope, $rootScope, $http, grouper, service, notif) {
      notif.init($scope);
      $scope.popup = notif.popup;

      $scope.loading = true;

      $scope.groupings = [{
        attr: 'display_name',
        translate_attr: 'hercules.connectors.display_name'
      }, {
        attr: 'host_name',
        translate_attr: 'hercules.connectors.host_name'
      }, {
        attr: 'cluster_id',
        translate_attr: 'hercules.connectors.cluster_id'
      }, {
        attr: 'version',
        translate_attr: 'hercules.connectors.version'
      }, {
        attr: 'status_code',
        translate_attr: 'hercules.connectors.status'
      }];

      $scope.current_grouping = $scope.groupings[1];

      var loadData = function () {
        service.fetch({
          success: function (data) {
            $scope.connectors = data;
            $scope.aggregated_status = service.aggregateStatus(data);
            $scope.loading = false;
          },
          error: function () {
            $scope.error = true;
            $scope.loading = false;
          }
        });
      };

      var updateGrouping = function () {
        $scope.grouped_connectors = grouper.groupBy($scope.connectors, $scope.current_grouping.attr);
      };

      $scope.$watch('connectors', updateGrouping);
      $scope.$watch('current_grouping', updateGrouping);

      $scope.reload = function () {
        $scope.loading = true;
        $scope.connectors = [];
        loadData();
      };

      $scope.upgradeSoftware = function (connectorId) {
        service.upgradeSoftware({
          connectorId: connectorId,
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
