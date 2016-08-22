(function () {
  'use strict';
  angular
  .module('Status.incidents')
  .controller('DeleteIncidentController', DeleteIncidentController);
  function DeleteIncidentController($scope, $stateParams, $state, IncidentsWithoutSiteService, $window) {
    $scope.incidentName = $stateParams.incidentName;
    $scope.deleteIncidentBtn = function () {
      if ($scope.deleteCommand == 'DELETE') {
        IncidentsWithoutSiteService.delete({ incidentId: $stateParams.incidentId }).$promise.then(function () {
          $state.go("^");
          $window.alert("Successfully delete");
        }, function () {
          $window.alert("Try again later!");
        });
      } else {
        $window.alert('Please enter DELETE');
        $scope.deleteCommand = "";
      }
    };
  }
})();
