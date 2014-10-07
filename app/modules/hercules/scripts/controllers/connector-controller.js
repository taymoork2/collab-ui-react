'use strict';

/* global _ */

angular.module('Hercules')
  .controller('ConnectorCtrl', ['$scope', '$rootScope', '$http', 'ConnectorGrouper',
    function($scope, $rootScope, $http, grouper) {
      $scope.loading = true;

      $scope.groupings = [
        { attr: 'display_name', translate_attr: 'hercules.connectors.display_name' },
        { attr: 'host_name',    translate_attr: 'hercules.connectors.host_name' },
        { attr: 'cluster_id',   translate_attr: 'hercules.connectors.cluster_id' },
        { attr: 'version',      translate_attr: 'hercules.connectors.version' },
        { attr: 'status',       translate_attr: 'hercules.connectors.status' }
      ];

      $scope.current_grouping = $scope.groupings[0];

      var decorateData = function(data) {
        _.each(data, function(c) {
          switch (c.status) {
            case 'running':
              c.status_class = 'success';
              break;
            case 'installed':
              c.status_class = 'warning';
              break;
            default:
              c.status_class = 'danger';
          }
        });
        return data;
      };

      var loadData = function() {
        $http
          .get('https://hercules.ladidadi.org/v1/connectors')
          .success(function (data) {
            $scope.connectors = decorateData(data);
            $scope.loading = false;
          })
          .error(function () {
            console.error('error fetching ladidadi data', arguments);
            $scope.error = true;
            $scope.loading = false;
          });
      };

      var updateGrouping = function() {
        $scope.grouped_connectors = grouper.groupBy($scope.connectors, $scope.current_grouping.attr);
      };

      $scope.$watch('connectors', updateGrouping);
      $scope.$watch('current_grouping', updateGrouping);

      $scope.reload = function() {
        $scope.loading = true;
        $scope.connectors = [];
        loadData();
      };

      loadData();
    }
  ]);
