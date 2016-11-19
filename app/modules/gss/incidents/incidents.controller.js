(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('IncidentsCtrl', IncidentsCtrl);

  /* @ngInject */
  function IncidentsCtrl($scope, $state, GSSService, IncidentsService) {
    var vm = this;
    var resolved = 'resolved';

    vm.isResolved = isResolved;
    vm.deleteIncident = deleteIncident;

    init();

    function isResolved(status) {
      return status === resolved;
    }

    function loadIncidents(serviceId) {
      IncidentsService
        .getIncidents(serviceId)
        .then(function (incidentList) {
          vm.hasIncident = !_.isEmpty(incidentList);
          vm.list = incidentList;
        }).catch(function () {
          vm.hasIncident = false;
          vm.list = [];
        });
    }

    function deleteIncident(incident) {
      $state.go('gss.incidents.delete', {
        incident: incident
      });
    }

    function init() {
      vm.hasIncident = false;

      $scope.$watch(
        function () {
          return GSSService.getServiceId();
        },
        function (newServiceId) {
          if (!_.isUndefined(newServiceId)) {
            loadIncidents(newServiceId);
          }
        }
      );
    }
  }
})();
