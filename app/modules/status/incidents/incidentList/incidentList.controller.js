(function () {
  'use strict';
  angular
    .module('Status.incidents')
    .controller('IncidentListController', IncidentListController);

  function IncidentListController($scope, $state, IncidentsWithSiteService, $log) {
    $scope.showList = true;
    IncidentsWithSiteService.query({
      "siteId": 1
    }).$promise.then(function (incidentList) {
      $log.log(incidentList);
      if (incidentList.length == 0) {
        $scope.showList = false;
      }
      $scope.incidentList = incidentList;
    }, function () {
      $scope.showList = false;
    });
    $scope.toCreatePage = function () {
      $state.go(".new");
    };
  }
})();
