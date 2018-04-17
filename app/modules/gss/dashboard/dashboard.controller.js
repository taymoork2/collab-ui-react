(function () {
  'use strict';

  angular.module('GSS')
    .controller('DashboardCtrl', DashboardCtrl);

  /* @ngInject */
  function DashboardCtrl($modal, $scope, $state, $translate, DashboardService, GSSService, Notification) {
    var vm = this;
    var incidentStatusResolved = 'resolved';
    var incidentStatus = [{
      localizedStatus: $translate.instant('gss.incidentStatus.investigating'),
      status: 'investigating',
    }, {
      localizedStatus: $translate.instant('gss.incidentStatus.identified'),
      status: 'identified',
    }, {
      localizedStatus: $translate.instant('gss.incidentStatus.monitoring'),
      status: 'monitoring',
    }, {
      localizedStatus: $translate.instant('gss.incidentStatus.resolved'),
      status: incidentStatusResolved,
    }];

    vm.goToNewIncidentPage = goToNewIncidentPage;
    vm.goToUpdateIncidentPage = goToUpdateIncidentPage;
    vm.addComponent = addComponent;
    vm.toggleOverridden = toggleOverridden;
    vm.modifyGroupComponentStatus = modifyGroupComponentStatus;
    vm.modifySubComponentStatus = modifySubComponentStatus;
    vm.getLocalizedIncidentStatus = getLocalizedIncidentStatus;

    init();

    function goToNewIncidentPage() {
      $state.go('gss.incidents.new');
    }

    function goToUpdateIncidentPage(incident) {
      $state.go('gss.incidents.update', {
        incident: incident,
        actionType: 'update',
      });
    }

    function addComponent() {
      $modal.open({
        type: 'small',
        controller: 'AddComponentCtrl',
        controllerAs: 'addComponentCtrl',
        template: require('modules/gss/components/addComponent/addComponent.tpl.html'),
        modalClass: 'add-component',
      }).result.then(function () {
        loadComponents(GSSService.getServiceId());
      });
    }

    function toggleOverridden(component) {
      component.isOverridden = !component.isOverridden;

      if (component.isOverridden) {
        setGroupComponentStatusForOverridden(component);
        modifyComponentOverridden(component, 'overridden');
      } else {
        modifyComponentOverridden(component, component.statusObj.value);
      }
    }

    function modifyGroupComponentStatus(groupComponent) {
      modifyComponentStatus(groupComponent, groupComponent.statusObj.value);
    }

    function modifySubComponentStatus(component, subComponent) {
      modifyComponentStatus(subComponent, subComponent.statusObj.value);

      if (component.isOverridden) {
        setGroupComponentStatusForOverridden(component);
      }
    }

    function getLocalizedIncidentStatus(status) {
      return _.find(incidentStatus, {
        status: status,
      }).localizedStatus;
    }

    function isIncidentResolved(incident) {
      return incident.status === incidentStatusResolved;
    }

    function modifyComponentStatus(component, status) {
      DashboardService.modifyComponent({
        componentId: component.componentId,
        status: status,
      }).then(function () {
        component.status = status;
        Notification.success('gss.componentStatusChanged', {
          componentName: component.componentName,
          status: component.status,
        });
      }).catch(function (error) {
        Notification.errorWithTrackingId(error, 'gss.incidentsPage.noAffectedComponent');
      });
    }

    function modifyComponentOverridden(component, overridden) {
      DashboardService.modifyComponent({
        componentId: component.componentId,
        status: overridden,
      });
    }

    function init() {
      vm.showList = false;
      vm.statuses = [
        {
          label: $translate.instant('gss.componentStatus.operational'),
          value: 'operational',
        },
        {
          label: $translate.instant('gss.componentStatus.degradedPerformance'),
          value: 'degraded_performance',
        },
        {
          label: $translate.instant('gss.componentStatus.partialOutage'),
          value: 'partial_outage',
        },
        {
          label: $translate.instant('gss.componentStatus.majorOutage'),
          value: 'major_outage',
        },
        {
          label: $translate.instant('gss.componentStatus.underMaintenance'),
          value: 'under_maintenance',
        },
      ];

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

    function setGroupComponentStatusForOverridden(component) {
      var newStatus = getGroupComponentStatusForOverridden(component);

      if (newStatus.value !== component.statusObj.value) {
        component.statusObj = newStatus;

        Notification.success('gss.componentStatusChanged', {
          componentName: component.componentName,
          status: component.statusObj.value,
        });
      }
    }

    function getGroupComponentStatusForOverridden(groupComponent) {
      var highestPriority = 0;
      _.forEach(groupComponent.components, function (subComponent) {
        var priority = getStatusPriority(subComponent.statusObj);
        if (highestPriority < priority) {
          highestPriority = priority;
        }
      });

      return vm.statuses[highestPriority];
    }

    function getStatusPriority(statusObj) {
      return _.findIndex(vm.statuses, {
        value: statusObj.value,
      });
    }

    function loadIncidents(serviceId) {
      DashboardService.getIncidents(serviceId)
        .then(function (incidentList) {
          vm.incidentList = _.filter(incidentList, function (incident) {
            return !isIncidentResolved(incident);
          });
          vm.showList = !_.isEmpty(vm.incidentList);
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

    function getStatusObj(status) {
      return _.find(vm.statuses, {
        value: status,
      });
    }
  }
})();
