(function () {
  'use strict';

  angular.module('Hercules')
    .component('ewEmergencyUpgradeConfiguration', {
      bindings: {
        clusterId: '<',
      },
      controller: EmergencyUpgradeConfigurationCtrl,
      template: require('modules/hercules/emergency-upgrade-configuration/ew-emergency-upgrade-configuration.component.html'),
    });

  /* @ngInject */
  function EmergencyUpgradeConfigurationCtrl($translate, HybridServicesClusterService, Notification) {
    var vm = this;
    var clusterId;

    vm.$onInit = $onInit;
    vm.$onChanges = $onChanges;
    vm.onTimeChange = onTimeChange;

    function $onInit() {
      vm.syncing = false;
      vm.formData = {};
      vm.formOptions = {
        time: getTimeOptions(),
      };
    }

    function $onChanges(changes) {
      if (changes.clusterId) {
        clusterId = changes.clusterId.currentValue;
        if (clusterId &&
          changes.clusterId.previousValue !== clusterId) {
          updateUI();
        }
      }
    }

    function onTimeChange(newTime) {
      updateEmergencyUpgradeAndUI(newTime);
    }

    function updateUI() {
      vm.syncing = true;
      return getUpgradeSchedule(clusterId)
        .then(function (upgradeSchedule) {
          vm.formData = convertDataForUI(upgradeSchedule);
          vm.timezone = upgradeSchedule.scheduleTimeZone;
          vm.syncing = false;
        })
        .catch(function (error) {
          // Do not reset vm.syncing if there was an error
          Notification.errorWithTrackingId(error);
        });
    }

    function convertDataForUI(data) {
      return {
        urgentScheduleTime: {
          label: labelForTime(data.urgentScheduleTime),
          value: data.urgentScheduleTime,
        },
      };
    }

    function getUpgradeSchedule(id) {
      return HybridServicesClusterService.get(id)
        .then(function (cluster) {
          return cluster.upgradeSchedule;
        });
    }

    function updateEmergencyUpgradeAndUI(data) {
      vm.syncing = true;
      return HybridServicesClusterService.setUpgradeSchedule(clusterId, {
        urgentScheduleTime: data.value,
      })
        .then(updateUI)
        .catch(function (error) {
          Notification.errorWithTrackingId(error);
        })
        .finally(function () {
          vm.syncing = false;
        });
    }

    function labelForTime(time) {
      var currentLanguage = $translate.use();
      if (currentLanguage === 'en_US') {
        return moment(time, 'HH:mm').format('hh:mm A');
      } else {
        return time;
      }
    }

    function getTimeOptions() {
      var values = _.range(0, 24).map(function (time) {
        return _.padStart(time, 2, '0') + ':00';
      });
      return _.map(values, function (value) {
        return {
          label: labelForTime(value),
          value: value,
        };
      });
    }
  }
})();
