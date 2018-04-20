(function () {
  'use strict';

  angular
    .module('GSS')
    .controller('UpdateIncidentCtrl', UpdateIncidentCtrl);

  /* @ngInject */
  function UpdateIncidentCtrl($scope, $state, $modal, $stateParams, $translate, Authinfo, GSSService, IncidentsService, Notification) {
    var vm = this;
    var update = 'update';
    var resolved = 'resolved';
    var operational = 'operational';
    var overridden = 'overridden';
    var componentStatusesPriority = ['under_maintenance', 'major_outage', 'partial_outage', 'degraded_performance', 'operational'];

    vm.showEditTitle = showEditTitle;
    vm.cancelEditTitle = cancelEditTitle;
    vm.isValidForTitle = isValidForTitle;
    vm.saveTitle = saveTitle;

    vm.isIncidentStatusResolved = isIncidentStatusResolved;
    vm.setOperationalForComponents = setOperationalForComponents;
    vm.toggleOverridden = toggleOverridden;
    vm.overrideGroupComponent = overrideGroupComponent;
    vm.isValidForIncident = isValidForIncident;
    vm.updateIncident = updateIncident;

    vm.initMessageData = initMessageData;
    vm.showEditMessage = showEditMessage;
    vm.saveMessage = saveMessage;
    vm.showAffectedComponents = showAffectedComponents;
    vm.hideAffectedComponent = hideAffectedComponent;
    vm.isValidForMessage = isValidForMessage;
    vm.getLocalizedIncidentStatus = getLocalizedIncidentStatus;
    vm.isLoadingMessage = true;
    vm.deleteMessage = deleteMessage;

    init();

    function init() {
      if ($stateParams && $stateParams.incident && $stateParams.actionType) {
        vm.incidentForUpdate = $stateParams.incident;
        vm.isUpdateMode = $stateParams.actionType === update;
      }

      vm.componentStatuses = [{
        label: $translate.instant('gss.componentStatus.operational'),
        value: 'operational',
      }, {
        label: $translate.instant('gss.componentStatus.degradedPerformance'),
        value: 'degraded_performance',
      }, {
        label: $translate.instant('gss.componentStatus.partialOutage'),
        value: 'partial_outage',
      }, {
        label: $translate.instant('gss.componentStatus.majorOutage'),
        value: 'major_outage',
      }, {
        label: $translate.instant('gss.componentStatus.underMaintenance'),
        value: 'under_maintenance',
      }];

      vm.impactStatuses = [{
        label: $translate.instant('gss.impactStatus.none'),
        value: 'none',
      }, {
        label: $translate.instant('gss.impactStatus.minor'),
        value: 'minor',
      }, {
        label: $translate.instant('gss.impactStatus.major'),
        value: 'major',
      }, {
        label: $translate.instant('gss.impactStatus.critical'),
        value: 'critical',
      }, {
        label: $translate.instant('gss.impactStatus.maintenance'),
        value: 'maintenance',
      }];

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

      initUI();

      $scope.$watch(
        function () {
          return GSSService.getServiceId();
        },
        function (newServiceId, oldServiceId) {
          if (newServiceId !== oldServiceId) {
            $state.go('^');
          }
        }
      );
    }

    function initUI() {
      initStatuses();
      loadComponentsForCurrentService();
      loadIncidentUpdateMessages();
    }

    function showEditTitle() {
      vm.isEditingTitle = true;

      vm.incidentNameForEdit = vm.incidentForUpdate.incidentName;
      vm.impactStatusForEdit = _.find(vm.impactStatuses, {
        value: vm.incidentForUpdate.impact,
      });
    }

    function cancelEditTitle() {
      vm.isEditingTitle = false;
    }

    function isValidForTitle() {
      return !_.isEmpty(vm.incidentNameForEdit);
    }

    function saveTitle() {
      if (!vm.isValidForTitle()) {
        return;
      }

      vm.isSavingTitle = true;

      IncidentsService
        .updateIncidentNameAndImpact(vm.incidentForUpdate.incidentId,
          vm.incidentNameForEdit,
          vm.impactStatusForEdit.value)
        .then(function () {
          Notification.success('gss.incidentsPage.updateIncidentSucceed', {
            incidentName: vm.incidentForUpdate.incidentName,
          });

          vm.incidentForUpdate.incidentName = vm.incidentNameForEdit;
          vm.incidentForUpdate.impact = vm.impactStatusForEdit.value;
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.incidentsPage.updateIncidentFailed', {
            incidentName: vm.incidentForUpdate.incidentName,
          });
        })
        .finally(function () {
          vm.cancelEditTitle();
          vm.isSavingTitle = false;
        });
    }

    function isIncidentStatusResolved() {
      return !_.isNil(vm.incidentForUpdate) && vm.incidentForUpdate.status === resolved;
    }

    function setOperationalForComponents() {
      vm.isShowSetComponentTips = true;
      setOperational(vm.components);
    }

    function toggleOverridden(groupComponent) {
      groupComponent.isOverridden = !groupComponent.isOverridden;
      vm.overrideGroupComponent(groupComponent);
    }

    function overrideGroupComponent(groupComponent) {
      if (groupComponent.isOverridden) {
        groupComponent.statusObj = getGroupComponentStatusForOverridden(groupComponent);
      }
    }

    function isValidForIncident() {
      return !_.isEmpty(vm.incidentForUpdate.message);
    }

    function updateIncident() {
      if (!vm.isValidForIncident()) {
        return;
      }

      vm.isUpdatingIncident = true;

      IncidentsService
        .updateIncident(vm.incidentForUpdate.incidentId, {
          status: vm.incidentForUpdate.status,
          message: vm.incidentForUpdate.message,
          email: Authinfo.getUserName(),
          affectComponents: getAffectedComponents(),
        })
        .then(function () {
          Notification.success('gss.incidentsPage.updateIncidentSucceed', {
            incidentName: vm.incidentForUpdate.incidentName,
          });

          initUI();
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.incidentsPage.updateIncidentFailed', {
            incidentName: vm.incidentForUpdate.incidentName,
          });
        })
        .finally(function () {
          vm.isUpdatingIncident = false;
        });
    }

    function initMessageData(message) {
      message.isEditingMessage = false;
      message.isSavingMessage = false;
      message.editMessage = message.message;

      message.isShowAffectedComponents = false;
      message.hasAffectedComponent = false;
    }

    function showEditMessage(message) {
      message.isEditingMessage = true;
    }

    function hideAffectedComponent(message) {
      message.isShowAffectedComponents = false;
    }

    function showAffectedComponents(message) {
      IncidentsService
        .getAffectedComponents(message.messageId)
        .then(function (components) {
          message.hasAffectedComponent = !_.isEmpty(components);
          message.affectedComponents = components;
        }).catch(function () {
          message.hasAffectedComponent = false;
        }).finally(function () {
          message.isShowAffectedComponents = true;
        });
    }

    function isValidForMessage(message) {
      return !_.isEmpty(message.editMessage);
    }

    function getLocalizedIncidentStatus(status) {
      return _.find(vm.radios, {
        value: status,
      }).label;
    }

    function saveMessage(message) {
      if (!vm.isValidForMessage(message)) {
        return;
      }

      message.isSavingMessage = true;

      IncidentsService
        .updateIncidentMessage(message.messageId, {
          email: Authinfo.getUserName(),
          message: message.editMessage,
        })
        .then(function (savedMessage) {
          message.message = savedMessage.message;
          message.lastModifiedTime = savedMessage.lastModifiedTime;

          Notification.success('gss.incidentsPage.modifyMessageSucceed');
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'gss.incidentsPage.modifyMessageFailed');
        })
        .finally(function () {
          message.isEditingMessage = false;
          message.isSavingMessage = false;
        });
    }

    function initStatuses() {
      vm.isUpdateMode = !isIncidentStatusResolved();

      vm.cancelEditTitle();
      vm.isSavingTitle = false;

      vm.isShowSetComponentTips = false;
      vm.isUpdatingIncident = false;
    }

    function loadComponentsForCurrentService() {
      IncidentsService
        .getComponents(GSSService.getServiceId())
        .then(function (components) {
          vm.components = components;
          initComponents(vm.components);
        });
    }

    function loadIncidentUpdateMessages() {
      IncidentsService
        .getIncident(vm.incidentForUpdate.incidentId)
        .then(function (data) {
          vm.incidentForUpdate = data;
          vm.isLoadingMessage = false;
        });
    }

    function findComponentStatus(status) {
      return _.find(vm.componentStatuses, {
        value: status,
      });
    }

    function setOperational(components) {
      _.map(components, function (component) {
        component.statusObj = findComponentStatus(operational);
        setOperational(component.components);
      });
    }

    function initComponents(components) {
      _.map(components, function (component) {
        component.originalOverriddenStatus = component.isOverridden;
        component.statusObj = findComponentStatus(component.status);

        initComponents(component.components);
      });
    }

    function getGroupComponentStatusForOverridden(groupComponent) {
      var statusPriority = _.map(groupComponent.components, function (childComponent) {
        return _.findIndex(componentStatusesPriority, function (status) {
          return status === childComponent.statusObj.value;
        });
      });

      return findComponentStatus(componentStatusesPriority[_.min(statusPriority)]);
    }

    function generateComponentObj(componentId, componentStatus) {
      return {
        componentId: componentId,
        status: componentStatus,
      };
    }

    function getAffectedComponents() {
      var affectedComponents = [];

      _.forEach(vm.components, function (component) {
        if (component.isOverridden) {
          if (!component.originalOverriddenStatus) {
            affectedComponents.push(generateComponentObj(component.componentId, overridden));
          }
        } else {
          if (component.originalOverriddenStatus) {
            affectedComponents.push(generateComponentObj(component.componentId, component.statusObj.value));
          } else {
            if (component.statusObj.value !== component.status) {
              affectedComponents.push(generateComponentObj(component.componentId, component.statusObj.value));
            }
          }
        }

        _.forEach(component.components, function (childComponent) {
          if (childComponent.status !== childComponent.statusObj.value) {
            affectedComponents.push(generateComponentObj(childComponent.componentId, childComponent.statusObj.value));
          }
        });
      });

      return affectedComponents;
    }

    function deleteMessage(message) {
      message.statusName = vm.getLocalizedIncidentStatus(message.status);
      var delMessage = message;

      $modal.open({
        type: 'small',
        template: require('modules/gss/incidents/message/deleteMessage.tpl.html'),
        controller: function () {
          var ctrl = this;
          ctrl.message = delMessage;
        },
        controllerAs: 'ctrl',
      }).result.then(function () {
        vm.isLoadingMessage = true;
        IncidentsService
          .deleteIncidentMessage(message.messageId)
          .then(function () {
            _.remove(vm.incidentForUpdate.messages, {
              messageId: message.messageId,
            });
            vm.isLoadingMessage = false;
            Notification.success('gss.incidentsPage.deleteMessageSucceed');
          })
          .catch(function (error) {
            Notification.errorWithTrackingId(error, 'gss.incidentsPage.deleteMessageFailed');
          });
      });
    }
  }
})();
