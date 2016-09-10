(function () {
  'use strict';
  angular
    .module('Status.incidents')
    .controller('IncidentListController', IncidentListController);

  function IncidentListController($scope, $state, IncidentsWithSiteService, statusService, $log) {
    $scope.showList = true;
    IncidentsWithSiteService.query({
      "siteId": statusService.getServiceId()
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
    $scope.$watch(
      function () {
        return statusService.getServiceId();
      },
      function (newServiceId, oldServiceId) {
        if (newServiceId === oldServiceId) {
          return;
        }
        $state.go("status.components");
      });
  }
})();
