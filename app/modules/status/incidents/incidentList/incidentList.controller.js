(function () {
  'use strict';
  angular
    .module('Status.incidents')
    .controller('IncidentListController', IncidentListController);

  function IncidentListController($scope, $state, IncidentsService) {
    $scope.showList = true;
    IncidentsService.query().$promise.then(function (incidentList) {
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
