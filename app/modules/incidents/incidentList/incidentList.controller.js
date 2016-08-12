(function () {
  'use strict';
  angular
    .module('Incidents')
    .controller('IncidentListController', IncidentListController);

  function IncidentListController($scope, $state, IncidentsService) {
    var vm = this;
    $scope.showList = true;
    IncidentsService.query().$promise.then(function (incidentList) {
      if (incidentList.length == 0) {
        $scope.showList = false;
      }
      vm.incidentList = incidentList;
    }, function () {
      $scope.showList = false;
    });
    vm.toCreatePage = function () {
      $state.go("createIncident");
    };
  }

})();
