(function () {
  'use strict';
  angular
    .module('Incidents')
    .controller('CreateIncidentController', CreateIncidentController);

  function CreateIncidentController($scope, $state, $log, $window, IncidentsService) {
    $scope.newIncident = {
      status: '',
      msg: '',
      name: ''
    };
    $scope.CreateIncident = function () {

      IncidentsService.save({
        "incidentName": $scope.newIncident.name,
        "status": $scope.newIncident.status,
        "message": $scope.newIncident.msg,
        "email": "chaoluo@cisco.com"
      }).$promise.then(function (req) {
        $log.log(req);
        $window.alert("Incident successfully created!");
        $state.go("incidents");
      }, function (req) {
        $log.log(req);
      });

    };
  }
})();
