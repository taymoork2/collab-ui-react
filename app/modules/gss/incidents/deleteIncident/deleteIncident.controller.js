(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('DeleteIncidentCtrl', DeleteIncidentCtrl);

  /* @ngInject */
  function DeleteIncidentCtrl($state, $stateParams, IncidentsService, Notification) {
    var vm = this;
    var deleteCommand = 'DELETE';

    vm.goBack = goBack;
    vm.isValid = isValid;
    vm.deleteIncident = deleteIncident;

    init();

    function init() {
      vm.isLoading = false;
      vm.delConfirmText = deleteCommand;
      if ($stateParams && $stateParams.incident) {
        vm.incident = $stateParams.incident;
      }
    }

    function deleteIncident() {
      if (!vm.isValid()) {
        return;
      }

      vm.isLoading = true;

      IncidentsService
        .deleteIncident(vm.incident.incidentId)
        .then(function () {
          Notification.success('gss.incidentsPage.deleteIncidentSucceed', {
            incidentName: vm.incident.incidentName,
          });

          goBack();
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.incidentsPage.deleteIncidentFailed', {
            incidentName: vm.incidentName,
          });
        })
        .finally(function () {
          vm.isLoading = false;
        });
    }

    function isValid() {
      return vm.deleteCommand === deleteCommand;
    }

    function goBack() {
      $state.go('^');
    }
  }
})();
