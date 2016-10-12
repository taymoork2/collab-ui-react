(function () {
  'use strict';

  angular
    .module('Status.incidents')
    .controller('DeleteIncidentController', DeleteIncidentController);
  function DeleteIncidentController($scope, $stateParams, $state, IncidentsWithoutSiteService) {
    $scope.incidentName = $stateParams.incidentName;
    var vm = this;
    vm.deleteIncidentBtn = deleteIncidentBtn;

    function deleteIncidentBtn() {
      if ($scope.deleteCommand == 'DELETE') {
        IncidentsWithoutSiteService.delete({ incidentId: $stateParams.incidentId }).$promise.then(function () {
          $state.go("^");
        }, function () {

        });
      } else {
        $scope.deleteCommand = "";
      }
    }
  }
})();
