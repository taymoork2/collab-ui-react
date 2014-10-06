'use strict';

angular.module('Hercules')
  .controller('ConnectorCtrl', ['$scope', '$rootScope', '$http', 'ConnectorGrouper',
    function($scope, $rootScope, $http, grouper) {

      $scope.loading = true;

      $scope.groupings = [
        { attr:'display_name', name:'Service Name' },
        { attr:'host_name',    name:'Expressway Host' },
        { attr:'cluster_id',   name:'Cluster' },
        { attr:'version',      name:'Version' }
      ];

      $scope.current_grouping = $scope.groupings[0];

      $http
        .get('https://hercules.ladidadi.org/v1/connectors')
        .success(function (data) {
          $scope.connectors = data;
          $scope.loading = false;
        })
        .error(function () {
          console.error('error fetching ladidadi data', arguments);
          $scope.error = true;
          $scope.loading = false;
        });

      var updateGrouping = function() {
        $scope.grouped_connectors = grouper.groupBy($scope.connectors, $scope.current_grouping.attr);
      };

      $scope.$watch('connectors', updateGrouping);
      $scope.$watch('current_grouping', updateGrouping);

    }
  ]);
