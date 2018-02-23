(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('clusterCreationWizardController', clusterCreationWizardController);

  /* @ngInject */
  function clusterCreationWizardController($translate, $state, $log, $modalInstance, firstTimeSetup, $modal, AddResourceSectionService, TrustedSipSectionService, SipRegistrationSectionService, ClusterCascadeBandwidthService, HybridMediaUpgradeScheduleService, hasMfFeatureToggle, hasMfSIPFeatureToggle, hasMfCascadeBwConfigToggle) {
    var vm = this;
    vm.isSuccess = true;
    vm.closeSetupModal = closeSetupModal;
    vm.createCluster = createCluster;
    vm.clusterlist = [];
    vm.hostName = '';
    vm.clusterName = '';
    vm.firstTimeSetup = firstTimeSetup;
    vm.childHasUpdatedData = childHasUpdatedData;
    vm.hostUpdateData = hostUpdateData;
    vm.clusterUpdatedData = clusterUpdatedData;
    vm.cascadeBandwidthUpdatedData = cascadeBandwidthUpdatedData;
    vm.sipConfigUrlUpdatedData = sipConfigUrlUpdatedData;
    vm.trustedSipConfigUpdatedData = trustedSipConfigUpdatedData;
    vm.upgradeScheduleUpdatedData = upgradeScheduleUpdatedData;
    vm.canGoNext = canGoNext;
    vm.hasMfFeatureToggle = hasMfFeatureToggle;
    vm.hasMfSIPFeatureToggle = hasMfSIPFeatureToggle;
    vm.nextCheck = false;
    vm.totalSteps = 3;
    vm.currentStep = 0;
    vm.next = next;
    vm.back = back;

    vm.upgradeSchedule = [{
      value: 0,
      label: $translate.instant('hercules.expresswayClusterSettings.upgradeScheduleHeader'),
    }];

    vm.headerOptions = [{
      value: 0,
      label: $translate.instant('mediaFusion.easyConfig.titleV2'),
    }, {
      value: 1,
      label: $translate.instant('mediaFusion.easyConfig.requiredclusterconfig'),
    }, {
      value: 2,
      label: $translate.instant('mediaFusion.easyConfig.optionalclusterconfig'),
    }, {
      value: 3,
      label: $translate.instant('mediaFusion.easyConfig.finaltitle'),
    }];

    vm.headerSelected = vm.headerOptions[0];
    $log.log('hasMFFeatureToggle' + hasMfFeatureToggle + 'hasMFSIPFeatureToggle' + hasMfSIPFeatureToggle + 'hasMfCascadeBwConfigToggle' + hasMfCascadeBwConfigToggle);

    function createCluster() {
      $modalInstance.close();
      if (newClusterCheck()) {
        AddResourceSectionService.addRedirectTargetClicked(vm.hostName, vm.clusterName).then(function () {
          // get thre response, if its new cluster do all necessary service calls
          AddResourceSectionService.redirectPopUpAndClose(vm.hostName, vm.clusterName);
        });
      } else {
        AddResourceSectionService.addRedirectTargetClicked(vm.hostName, vm.clusterName).then(function () {
          // get thre response, if its new cluster do all necessary service calls
          AddResourceSectionService.redirectPopUpAndClose(vm.hostName, vm.clusterName);
          vm.clusterId = AddResourceSectionService.selectClusterId();
          vm.clusterDetail = AddResourceSectionService.selectedClusterDetails();
          $log.log('Json' + JSON.stringify(vm.clusterDetail));
          TrustedSipSectionService.saveSipConfigurations(vm.trustedsipconfiguration, vm.clusterId);
          SipRegistrationSectionService.saveSipTrunkUrl(vm.sipConfigUrl, vm.clusterId);
          ClusterCascadeBandwidthService.saveCascadeConfig(vm.clusterId, vm.cascadeBandwidth);
          HybridMediaUpgradeScheduleService.updateUpgradeScheduleAndUI(vm.formDataForUpgradeSchedule, vm.clusterId);
        });
      }
    }

    function childHasUpdatedData(someData) {
      if (!_.isUndefined(someData.clusterlist)) {
        $log.log('cluster list' + JSON.stringify(someData.clusterlist));
        vm.clusterlist = someData.clusterlist;
      }
    }

    function hostUpdateData(someData) {
      if (!_.isUndefined(someData.hostName)) {
        $log.log('special' + JSON.stringify(someData.hostName));
        vm.hostName = someData.hostName;
      }
    }

    function clusterUpdatedData(someData) {
      if (!_.isUndefined(someData.clusterName)) {
        $log.log('clusterName' + JSON.stringify(someData.clusterName));
        vm.clusterName = someData.clusterName;
      }
    }

    function cascadeBandwidthUpdatedData(someData) {
      if (!_.isUndefined(someData.cascadeBandwidth)) {
        $log.log('cascadeBandwidth' + JSON.stringify(someData.cascadeBandwidth));
        vm.cascadeBandwidth = someData.cascadeBandwidth;
      }
    }

    function upgradeScheduleUpdatedData(someData) {
      if (!_.isUndefined(someData.upgradeSchedule)) {
        $log.log('formData' + JSON.stringify(someData.upgradeSchedule));
        vm.formDataForUpgradeSchedule = someData.upgradeSchedule;
      }
    }

    function sipConfigUrlUpdatedData(someData) {
      if (!_.isUndefined(someData.sipConfigUrl)) {
        $log.log('sipConfigUrl' + JSON.stringify(someData.sipConfigUrl));
        vm.sipConfigUrl = someData.sipConfigUrl;
      }
    }

    function trustedSipConfigUpdatedData(someData) {
      if (!_.isUndefined(someData.trustedsipconfiguration)) {
        $log.log('trustedsipconfiguration' + JSON.stringify(someData.trustedsipconfiguration));
        vm.trustedsipconfiguration = someData.trustedsipconfiguration;
      }
    }

    function newClusterCheck() {
      if (vm.clusterlist.indexOf(vm.clusterName) > -1) {
        return true;
      } else {
        return false;
      }
    }

    function clusterSettingsCheck() {
      if (vm.hasMfFeatureToggle && vm.hasMfSIPFeatureToggle && hasMfCascadeBwConfigToggle) {
        return true;
      } else {
        return false;
      }
    }

    function next() {
      vm.currentStep += 1;
      if (vm.currentStep <= 3) {
        switch (vm.currentStep) {
          case 0:
            vm.headerSelected = vm.headerOptions[0];
            break;
          case 1:
            if (newClusterCheck()) {
              vm.currentStep = 3;
              vm.headerSelected = vm.headerOptions[3];
              break;
            } else if (clusterSettingsCheck()) {
              vm.headerSelected = vm.headerOptions[1];
              break;
            } else {
              vm.currentStep = 2;
              vm.headerSelected = vm.headerOptions[2];
              break;
            }
          case 2:
            vm.headerSelected = vm.headerOptions[2];
            break;
          case 3:
            vm.headerSelected = vm.headerOptions[3];
            break;
        }
      }
    }

    function canGoNext() {
      if (vm.hostName && vm.clusterName) {
        return true;
      } else if (!_.isUndefined(vm.hostName) && vm.hostName != '' && !_.isUndefined(vm.clusterName) && vm.clusterName != '') {
        return true;
      } else {
        return false;
      }
    }

    function back() {
      vm.currentStep -= 1;
      if (vm.currentStep <= 3) {
        switch (vm.currentStep) {
          case 0:
            vm.headerSelected = vm.headerOptions[0];
            break;
          case 1:
            if (clusterSettingsCheck()) {
              vm.headerSelected = vm.headerOptions[1];
              break;
            } else {
              vm.currentStep = 0;
              vm.headerSelected = vm.headerOptions[0];
              break;
            }
          case 2:
            if (newClusterCheck()) {
              vm.currentStep = 0;
              vm.headerSelected = vm.headerOptions[0];
              break;
            } else {
              vm.headerSelected = vm.headerOptions[2];
              break;
            }
          case 3:
            vm.headerSelected = vm.headerOptions[3];
            break;
        }
      }
    }

    function closeSetupModal(isCloseOk) {
      if (!firstTimeSetup) {
        $modalInstance.dismiss();
        return;
      }
      if (isCloseOk) {
        $state.go('services-overview');
        $modalInstance.dismiss();
        return;
      }
      $modal.open({
        template: require('modules/hercules/service-specific-pages/common-expressway-based/confirm-setup-cancel-dialog.html'),
        type: 'dialog',
      })
        .result.then(function (isAborting) {
          if (isAborting) {
            $modalInstance.dismiss();
          }
        });
    }
  }
}());
