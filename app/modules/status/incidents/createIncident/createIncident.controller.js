(function () {
  'use strict';

  angular
    .module('Status.incidents')
    .controller('CreateIncidentController', CreateIncidentController);

  function CreateIncidentController($scope, $state, IncidentsWithSiteService, statusService, Authinfo) {
    $scope.newIncident = {
      status: 'investigating',
      msg: '',
      name: ''
    };
    var vm = this;
    var useremail = Authinfo.getUserName();
    vm.CreateIncident = CreateIncident;
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
    function CreateIncident() {
      IncidentsWithSiteService.save({
        "siteId": statusService.getServiceId()
      }, {
        "incidentName": $scope.newIncident.name,
        "status": $scope.newIncident.status,
        "message": $scope.newIncident.msg,
        "email": useremail
      }).$promise.then(function () {
        $state.go("^");
      }, function () {
      });
    }
  }
})();
