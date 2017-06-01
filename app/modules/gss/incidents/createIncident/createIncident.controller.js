(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('CreateIncidentCtrl', CreateIncidentCtrl);

  /* @ngInject */
  function CreateIncidentCtrl($state, $translate, Authinfo, GSSService, IncidentsService, Notification) {
    var vm = this;

    vm.createIncident = createIncident;
    vm.isValid = isValid;
    vm.goBack = goBack;

    init();

    function init() {
      vm.radios = [{
        label: $translate.instant('gss.incidentStatus.investigating'),
        value: 'investigating',
        id: 'investigating',
      }, {
        label: $translate.instant('gss.incidentStatus.identified'),
        value: 'identified',
        id: 'identified',
      }, {
        label: $translate.instant('gss.incidentStatus.monitoring'),
        value: 'monitoring',
        id: 'monitoring',
      }, {
        label: $translate.instant('gss.incidentStatus.resolved'),
        value: 'resolved',
        id: 'resolved',
      }];

      vm.status = vm.radios[0].value;
      vm.isLoading = false;
    }

    function createIncident() {
      if (!vm.isValid()) {
        return;
      }

      vm.isLoading = true;
      IncidentsService.createIncident(GSSService.getServiceId(), {
        incidentName: vm.incidentName,
        status: vm.status,
        message: vm.message,
        email: Authinfo.getUserName(),
      }).then(function () {
        goBack();

        Notification.success('gss.incidentsPage.createIncidentSucceed', {
          incidentName: vm.incidentName,
        });
      }).catch(function (error) {
        Notification.errorWithTrackingId(error, 'gss.incidentsPage.createIncidentFailed', {
          incidentName: vm.incidentName,
        });
      }).finally(function () {
        vm.isLoading = false;
      });
    }

    function isValid() {
      return hasIncidentName() && hasMessage();
    }

    function hasIncidentName() {
      return !_.isEmpty(vm.incidentName);
    }

    function hasMessage() {
      return !_.isEmpty(vm.message);
    }

    function goBack() {
      $state.go('^');
    }
  }
})();
