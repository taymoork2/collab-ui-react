(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('ClusterCreationWizardController', ClusterCreationWizardController);

  /* @ngInject */
  function ClusterCreationWizardController($modal, $modalInstance, $state, $translate, AddResourceSectionService, ClusterCascadeBandwidthService, HybridMediaReleaseChannelService, HybridMediaUpgradeScheduleService, SipRegistrationSectionService, TrustedSipSectionService, firstTimeSetup, hasMfCascadeBwConfigToggle, hasMfFeatureToggle, hasMfSIPFeatureToggle) {
    var vm = this;
    vm.isSuccess = true;
    vm.closeSetupModal = closeSetupModal;
    vm.createCluster = createCluster;
    vm.clusterlist = [];
    vm.hostName = '';
    vm.clusterName = '';
    vm.firstTimeSetup = firstTimeSetup;
    vm.clusterListUpdated = clusterListUpdated;
    vm.hostNameUpdated = hostNameUpdated;
    vm.clusterNameUpdated = clusterNameUpdated;
    vm.cascadeBandwidthUpdated = cascadeBandwidthUpdated;
    vm.sipConfigUrlUpdated = sipConfigUrlUpdated;
    vm.trustedSipConfigUpdated = trustedSipConfigUpdated;
    vm.upgradeScheduleUpdated = upgradeScheduleUpdated;
    vm.releaseChannelUpdated = releaseChannelUpdated;
    vm.canGoNext = canGoNext;
    vm.hasMfFeatureToggle = hasMfFeatureToggle;
    vm.hasMfSIPFeatureToggle = hasMfSIPFeatureToggle;
    vm.hasMfCascadeBwConfigToggle = hasMfCascadeBwConfigToggle;
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

    function createCluster() {
      $modalInstance.close();
      if (newClusterCheck()) {
        AddResourceSectionService.addRedirectTargetClicked(vm.hostName, vm.clusterName).then(function () {
          AddResourceSectionService.redirectPopUpAndClose(vm.hostName, vm.clusterName);
        });
      } else {
        AddResourceSectionService.addRedirectTargetClicked(vm.hostName, vm.clusterName).then(function () {
          AddResourceSectionService.redirectPopUpAndClose(vm.hostName, vm.clusterName);
          vm.clusterId = AddResourceSectionService.selectClusterId();
          vm.clusterDetail = AddResourceSectionService.selectedClusterDetails();
          if (vm.hasMfFeatureToggle) SipRegistrationSectionService.saveSipTrunkUrl(vm.sipConfigUrl, vm.clusterId);
          if (vm.hasMfSIPFeatureToggle) TrustedSipSectionService.saveSipConfigurations(vm.trustedsipconfiguration, vm.clusterId);
          if (vm.hasMfCascadeBwConfigToggle && !_.isUndefined(vm.cascadeBandwidth)) ClusterCascadeBandwidthService.saveCascadeConfig(vm.clusterId, vm.cascadeBandwidth);
          if (!_.isUndefined(vm.releaseChannel)) HybridMediaReleaseChannelService.saveReleaseChannel(vm.clusterId, vm.releaseChannel);
          if (!_.isUndefined(vm.formDataForUpgradeSchedule)) HybridMediaUpgradeScheduleService.updateUpgradeScheduleAndUI(vm.formDataForUpgradeSchedule, vm.clusterId);
        });
      }
    }

    function clusterListUpdated(response) {
      if (!_.isUndefined(response.clusterlist)) vm.clusterlist = response.clusterlist;
    }

    function hostNameUpdated(response) {
      if (!_.isUndefined(response.hostName)) vm.hostName = response.hostName;
    }

    function clusterNameUpdated(response) {
      if (!_.isUndefined(response.clusterName)) vm.clusterName = response.clusterName;
    }

    function upgradeScheduleUpdated(response) {
      if (!_.isUndefined(response.upgradeSchedule)) vm.formDataForUpgradeSchedule = response.upgradeSchedule;
    }

    function releaseChannelUpdated(response) {
      if (!_.isUndefined(response.releaseChannel)) vm.releaseChannel = response.releaseChannel;
    }

    function sipConfigUrlUpdated(response) {
      if (!_.isUndefined(response.sipConfigUrl)) vm.sipConfigUrl = response.sipConfigUrl;
    }

    function trustedSipConfigUpdated(response) {
      if (!_.isUndefined(response.trustedsipconfiguration)) vm.trustedsipconfiguration = response.trustedsipconfiguration;
    }

    function cascadeBandwidthUpdated(response) {
      if (!_.isUndefined(response.cascadeBandwidth)) {
        vm.cascadeBandwidth = response.cascadeBandwidth;
        vm.validCascadeBandwidth = response.inValidBandwidth;
      }
    }

    function newClusterCheck() {
      return (_.includes(vm.clusterlist, vm.clusterName));
    }

    function clusterSettingsCheck() {
      return (vm.hasMfFeatureToggle || vm.hasMfSIPFeatureToggle || vm.hasMfCascadeBwConfigToggle);
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
      if (vm.currentStep === 0) {
        if (vm.hostName && vm.clusterName) {
          return true;
        } else if (!_.isUndefined(vm.hostName) && vm.hostName != '' && !_.isUndefined(vm.clusterName) && vm.clusterName != '') {
          return true;
        } else {
          return false;
        }
      } else if (vm.currentStep === 1) {
        var sip = true;
        var trust = true;
        var cascasde = true;
        if (vm.hasMfFeatureToggle) {
          sip = ((!_.isUndefined(vm.sipConfigUrl) && vm.sipConfigUrl != ''));
        }
        if (vm.hasMfSIPFeatureToggle) {
          trust = ((!_.isUndefined(vm.trustedsipconfiguration) && vm.trustedsipconfiguration != ''));
        }
        if (vm.hasMfCascadeBwConfigToggle) {
          cascasde = !vm.validCascadeBandwidth;
        }

        return sip && trust && cascasde;
      } else {
        return true;
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
