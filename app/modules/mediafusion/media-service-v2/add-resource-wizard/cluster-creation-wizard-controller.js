(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('clusterCreationWizardController', clusterCreationWizardController);

  /* @ngInject */
  function clusterCreationWizardController($translate, $state, $q, $modalInstance, $modal, AddResourceSectionService, TrustedSipSectionService, SipRegistrationSectionService, ClusterCascadeBandwidthService, HybridMediaUpgradeScheduleService, HybridMediaReleaseChannelService, hasMfFeatureToggle, hasMfSIPFeatureToggle, hasMfCascadeBwConfigToggle) {
    var vm = this;
    vm.isSuccess = true;
    vm.closeSetupModal = closeSetupModal;
    vm.createCluster = createCluster;
    vm.clusterlist = [];
    vm.hostName = '';
    vm.clusterName = '';
    vm.firstTimeSetup = $state.params.firstTimeSetup;
    vm.childHasUpdatedData = childHasUpdatedData;
    vm.hostUpdateData = hostUpdateData;
    vm.clusterUpdatedData = clusterUpdatedData;
    vm.cascadeBandwidthUpdatedData = cascadeBandwidthUpdatedData;
    vm.sipConfigUrlUpdatedData = sipConfigUrlUpdatedData;
    vm.trustedSipConfigUpdatedData = trustedSipConfigUpdatedData;
    vm.upgradeScheduleUpdatedData = upgradeScheduleUpdatedData;
    vm.releaseChannelUpdatedData = releaseChannelUpdatedData;
    vm.canGoNext = canGoNext;
    vm.hasMfFeatureToggle = hasMfFeatureToggle;
    vm.hasMfSIPFeatureToggle = hasMfSIPFeatureToggle;
    vm.hasMfCascadeBwConfigToggle = hasMfCascadeBwConfigToggle;
    vm.nextCheck = false;
    vm.totalSteps = 3;
    vm.currentStep = 0;
    vm.next = next;
    vm.back = back;
    vm.radio = 1;
    vm.ovaType = 1;
    vm.noProceed = false;
    vm.yesProceed = $state.params.yesProceed;
    vm.fromClusters = $state.params.fromClusters;
    vm.showDownloadableOption = vm.fromClusters;

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
      if (vm.firstTimeSetup) {
        firstTimeCluster();
      } else {
        AdditionalCluster();
      }
    }

    function firstTimeCluster() {
      $q.all(AddResourceSectionService.enableMediaServiceEntitlements()).then(function (result) {
        var resultRhesos = result[0];
        var resultSparkCall = result[1];
        if (!_.isUndefined(resultRhesos) && !_.isUndefined(resultSparkCall)) {
          //create cluster
          //on success call media service activation service enableMediaService
          AddResourceSectionService.addRedirectTargetClicked(vm.hostName, vm.clusterName, vm.firstTimeSetup).then(function () {
            //call the rest of the services which needs to be enabled
            AddResourceSectionService.enableMediaService();
            AddResourceSectionService.redirectPopUpAndClose(vm.hostName, vm.clusterName);
          }).then(function () {
            $state.go('media-service-v2.list');
          });
        } else {
          $state.go('services-overview', {}, { reload: true });
        }
      });
    }

    function AdditionalCluster() {
      if (newClusterCheck()) {
        AddResourceSectionService.addRedirectTargetClicked(vm.hostName, vm.clusterName, vm.firstTimeSetup).then(function () {
          AddResourceSectionService.redirectPopUpAndClose(vm.hostName, vm.clusterName);
        });
      } else {
        AddResourceSectionService.addRedirectTargetClicked(vm.hostName, vm.clusterName, vm.firstTimeSetup).then(function () {
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

    function childHasUpdatedData(someData) {
      if (!_.isUndefined(someData.clusterlist)) {
        vm.clusterlist = someData.clusterlist;
      }
    }

    function hostUpdateData(someData) {
      if (!_.isUndefined(someData.hostName)) {
        vm.hostName = someData.hostName;
      }
    }

    function clusterUpdatedData(someData) {
      if (!_.isUndefined(someData.clusterName)) {
        vm.clusterName = someData.clusterName;
      }
    }

    function cascadeBandwidthUpdatedData(someData) {
      if (!_.isUndefined(someData.cascadeBandwidth)) {
        vm.cascadeBandwidth = someData.cascadeBandwidth;
        vm.validCascadeBandwidth = someData.inValidBandwidth;
      }
    }

    function upgradeScheduleUpdatedData(someData) {
      if (!_.isUndefined(someData.upgradeSchedule)) {
        vm.formDataForUpgradeSchedule = someData.upgradeSchedule;
      }
    }

    function releaseChannelUpdatedData(someData) {
      if (!_.isUndefined(someData.releaseChannel)) {
        vm.releaseChannel = someData.releaseChannel;
      }
    }

    function sipConfigUrlUpdatedData(someData) {
      if (!_.isUndefined(someData.sipConfigUrl)) {
        vm.sipConfigUrl = someData.sipConfigUrl;
      }
    }

    function trustedSipConfigUpdatedData(someData) {
      if (!_.isUndefined(someData.trustedsipconfiguration)) {
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
      if (vm.hasMfFeatureToggle || vm.hasMfSIPFeatureToggle || vm.hasMfCascadeBwConfigToggle) {
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
      if (!vm.firstTimeSetup) {
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
