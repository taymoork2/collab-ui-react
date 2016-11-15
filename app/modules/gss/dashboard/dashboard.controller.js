(function () {
  'use strict';

  angular.module('GSS')
    .controller('DashboardCtrl', DashboardCtrl);

  /* @ngInject */
  function DashboardCtrl($scope, $state, $translate, DashboardService, GSSService, Notification) {
    var vm = this;

    vm.showList = false;
    vm.statuses = [
      {
        label: $translate.instant('gss.componentStatus.operational'),
        value: 'operational'
      },
      {
        label: $translate.instant('gss.componentStatus.degradedPerformance'),
        value: 'degraded_performance'
      },
      {
        label: $translate.instant('gss.componentStatus.partialOutage'),
        value: 'partial_outage'
      },
      {
        label: $translate.instant('gss.componentStatus.majorOutage'),
        value: 'major_outage'
      },
      {
        label: $translate.instant('gss.componentStatus.underMaintenance'),
        value: 'under_maintenance'
      }
    ];
    vm.goToNewIncidentPage = goToNewIncidentPage;
    vm.goToComponentsPage = goToComponentsPage;
    vm.modifyComponentStatus = modifyComponentStatus;
    vm.modifyComponentStatusForOverridden = modifyComponentStatusForOverridden;
    vm.modifySubComponentStatus = modifySubComponentStatus;

    function goToNewIncidentPage() {
      $state.go('gss.under.construction');
    }

    function goToComponentsPage() {
      $state.go('gss.under.construction');
    }

    function modifyComponentStatus(component) {
      DashboardService.modifyComponent({
        componentId: component.componentId,
        status: component.statusObj.value
      }).then(function () {
        component.status = component.statusObj.value;
        Notification.success('gss.componentStatusChanged', {
          componentName: component.componentName,
          status: component.status
        });
      }).catch(function (error) {
        Notification.errorWithTrackingId(error, 'gss.incidentsPage.noAffectedComponent');
      });
    }

    function modifyComponentStatusForOverridden(component) {
      component.isOverridden = true;
      var subComponents = component.components;

      /*
       component status relation:
       operational < degraded_performance < partial_outage < major_outage < under_maintenance
       */

      var lowest = vm.statuses.length;
      _.forEach(subComponents, function (subComponent) {
        var priority = getStatusPriority(subComponent.statusObj);
        if (lowest > priority) {
          lowest = priority;
        }
      });

      var targetStatusObj = vm.statuses[lowest];
      if (targetStatusObj.value !== component.statusObj.value) {
        component.statusObj = targetStatusObj;
        component.status = component.statusObj.value;
        vm.modifyComponentStatus(component);
      }
    }

    function modifySubComponentStatus(component, subComponent) {
      vm.modifyComponentStatus(subComponent);

      if (!(component.isOverridden)) {
        return;
      }

      vm.modifyComponentStatusForOverridden(component);
    }

    function getStatusPriority(statusObj) {
      return _.findIndex(vm.statuses, {
        value: statusObj.value
      });
    }

    function getStatusObj(status) {
      return _.find(vm.statuses, {
        value: status
      });
    }

    function loadIncidents(serviceId) {
      DashboardService.getIncidents(serviceId)
        .then(function (incidentList) {
          vm.showList = incidentList.length !== 0;
          vm.incidentList = incidentList;

        }).catch(function () {
          vm.showList = false;
          vm.incidentList = null;
        });
    }

    function loadComponents(serviceId) {
      DashboardService
        .getComponents(serviceId)
        .then(function (components) {
          vm.components = components;

          _.forEach(components, function (component) {
            component.statusObj = getStatusObj(component.status);

            _.forEach(component.components, function (subComponent) {
              subComponent.statusObj = getStatusObj(subComponent.status);
            });
          });
        }).catch(function () {
          vm.components = [];
        });
    }

    $scope.$watch(
      function () {
        return GSSService.getServiceId();
      },
      function (newServiceId) {
        if (newServiceId !== undefined) {
          loadIncidents(newServiceId);
          loadComponents(newServiceId);
        }
      }
    );
  }
})();
