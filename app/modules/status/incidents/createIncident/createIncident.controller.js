(function () {
  'use strict';
  angular
    .module('Status.incidents')
    .controller('CreateIncidentController', CreateIncidentController);

  function CreateIncidentController($scope, $state, $window, IncidentsWithSiteService) {
    $scope.newIncident = {
      status: '',
      msg: '',
      name: ''
    };
    $scope.CreateIncident = function () {
      IncidentsWithSiteService.save({
        "siteId": 1
      }, {
        "incidentName": $scope.newIncident.name,
        "status": $scope.newIncident.status,
        "message": $scope.newIncident.msg,
        "email": "chaoluo@cisco.com"
      }).$promise.then(function () {
        $state.go("^");
        $window.alert("Incident successfully created!");
      }, function () {
      });
    };
  }
})();
