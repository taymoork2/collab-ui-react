(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .controller('ClusterCreationWizardController', ClusterCreationWizardController);

  /* @ngInject */
  function ClusterCreationWizardController($modal, $modalInstance, $q, $state, $translate, $window, firstTimeSetup, yesProceed, Authinfo, AddResourceSectionService, ClusterCascadeBandwidthService, HybridMediaEmailNotificationService, HybridMediaReleaseChannelService, HybridMediaUpgradeScheduleService, ServiceDescriptorService, SipRegistrationSectionService, TrustedSipSectionService, VideoQualitySectionService, hasMfCascadeBwConfigToggle, hasMfClusterWizardFeatureToggle, hasMfFirstTimeCallingFeatureToggle, hasMfFeatureToggle, hasMfSIPFeatureToggle) {
    var vm = this;
    vm.serviceId = 'squared-fusion-media';
    vm.loading = false;
    vm.isSipSettingsEnabled = true;
    vm.videoQuality = false;
    vm.videoPropertySetId = null;
    vm.closeSetupModal = closeSetupModal;
    vm.createCluster = createCluster;
    vm.clusterlist = [];
    vm.hostName = '';
    vm.clusterName = '';
    vm.firstTimeSetup = firstTimeSetup;
    vm.clusterCreation = yesProceed;
    vm.configureNode = configureNode;
    vm.ovaTypeSelected = ovaTypeSelected;
    vm.emailUpdated = emailUpdated;
    vm.clusterListUpdated = clusterListUpdated;
    vm.hostNameUpdated = hostNameUpdated;
    vm.clusterNameUpdated = clusterNameUpdated;
    vm.upgradeScheduleUpdated = upgradeScheduleUpdated;
    vm.videoQualityUpdated = videoQualityUpdated;
    vm.releaseChannelUpdated = releaseChannelUpdated;
    vm.canGoNext = canGoNext;
    vm.hasMfFeatureToggle = hasMfFeatureToggle;
    vm.hasMfSIPFeatureToggle = hasMfSIPFeatureToggle;
    vm.hasMfCascadeBwConfigToggle = hasMfCascadeBwConfigToggle;
    vm.hasMfClusterWizardFeatureToggle = hasMfClusterWizardFeatureToggle;
    vm.hasMfFirstTimeCallingFeatureToggle = hasMfFirstTimeCallingFeatureToggle;
    vm.sipSettingsUpdated = sipSettingsUpdated;
    vm.sipSettingsEnabledCheck = sipSettingsEnabledCheck;
    vm.totalSteps = 7;
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
      label: $translate.instant('mediaFusion.easyConfig.hmsconfig'),
    }, {
      value: 2,
      label: $translate.instant('mediaFusion.easyConfig.hmsconfig'),
    }, {
      value: 3,
      label: $translate.instant('mediaFusion.easyConfig.serviceconfig'),
    }, {
      value: 4,
      label: $translate.instant('mediaFusion.easyConfig.finaltitle'),
    }];

    vm.headerSelected = vm.headerOptions[0];

    if (vm.firstTimeSetup) {
      vm.currentStep = 0;
      getPrimaryEmail();
    } else if (!vm.clusterCreation) {
      vm.currentStep = 0;
    } else {
      vm.currentStep = 2;
    }

    function createCluster() {
      $modalInstance.close();
      additionalCluster();
    }

    function getPrimaryEmail() {
      var email = Authinfo.getPrimaryEmail();
      ServiceDescriptorService.setEmailSubscribers(vm.serviceId, email);
    }

    function firstTimeCluster() {
      return $q.all(AddResourceSectionService.enableMediaServiceEntitlements()).then(function (result) {
        var resultRhesos = result[0];
        var resultSparkCall = result[1];
        if (resultRhesos.status === 204 && resultSparkCall.status === 204) {
          vm.loading = false;
          vm.currentStep = 2;
          return vm.loading && vm.currentStep;
        } else if (resultRhesos.status === 204) {
          vm.entitlementFailure = resultSparkCall;
          vm.currentStep = 7;
          vm.loading = false;
          return vm.loading && vm.currentStep;
        } else {
          vm.entitlementFailure = resultRhesos;
          vm.currentStep = 7;
          vm.loading = false;
          return vm.loading && vm.currentStep;
        }
      });
    }

    function additionalCluster() {
      if (newClusterCheck()) {
        AddResourceSectionService.addRedirectTargetClicked(vm.hostName, vm.clusterName).then(function () {
          AddResourceSectionService.redirectPopUpAndClose(vm.hostName, vm.clusterName, vm.releaseChannel.value);
        });
      } else {
        AddResourceSectionService.addRedirectTargetClicked(vm.hostName, vm.clusterName).then(function () {
          if (vm.firstTimeSetup) AddResourceSectionService.enableMediaService();
          AddResourceSectionService.redirectPopUpAndClose(vm.hostName, vm.clusterName, vm.releaseChannel.value);
          vm.clusterId = AddResourceSectionService.selectClusterId();
          vm.clusterDetail = AddResourceSectionService.selectedClusterDetails();
          if (!_.isUndefined(vm.videoQuality) && vm.firstTimeSetup) VideoQualitySectionService.setVideoQuality(vm.videoQuality, vm.videoPropertySetId);
          if (vm.hasMfFeatureToggle && vm.sipSettingEnabled) SipRegistrationSectionService.saveSipTrunkUrl(vm.sipConfigUrl, vm.clusterId);
          if (vm.hasMfSIPFeatureToggle && vm.sipSettingEnabled) TrustedSipSectionService.saveSipConfigurations(vm.trustedsipconfiguration, vm.clusterId);
          if (vm.hasMfCascadeBwConfigToggle && !_.isUndefined(vm.cascadeBandwidth) && vm.sipSettingEnabled) ClusterCascadeBandwidthService.saveCascadeConfig(vm.clusterId, vm.cascadeBandwidth);
          if (!_.isUndefined(vm.releaseChannel)) HybridMediaReleaseChannelService.saveReleaseChannel(vm.clusterId, vm.releaseChannel);
          if (!_.isUndefined(vm.formDataForUpgradeSchedule)) HybridMediaUpgradeScheduleService.updateUpgradeScheduleAndUI(vm.formDataForUpgradeSchedule, vm.clusterId);
          if (!_.isUndefined(vm.emailSubscribers)) HybridMediaEmailNotificationService.saveEmailSubscribers(vm.emailSubscribers);
        }).then(function () {
          $state.go('media-service-v2.list');
        });
      }
    }

    function configureNode(response) {
      vm.registerNode = response.registerNode;
    }
    function ovaTypeSelected(response) {
      vm.ovaType = response.ovaType;
    }

    function videoQualityUpdated(response) {
      if (!_.isUndefined(response.videoQuality)) {
        vm.videoQuality = response.videoQuality;
        vm.videoPropertySetId = response.videoPropertySetId;
      }
    }

    function clusterListUpdated(response) {
      if (!_.isUndefined(response.clusterlist)) vm.clusterlist = response.clusterlist;
    }

    function hostNameUpdated(response) {
      if (!_.isUndefined(response.hostName)) {
        vm.hostName = response.hostName;
        vm.validNode = response.validNode;
        vm.onlineNode = response.onlineNode;
        vm.offlineNode = response.offlineNode;
      }
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

    function emailUpdated(response) {
      if (!_.isUndefined(response.emailSubscribers)) vm.emailSubscribers = response.emailSubscribers;
    }

    function sipSettingsUpdated(response) {
      if (!_.isUndefined(response)) {
        vm.sipConfigUrl = response.sipConfigUrl;
        vm.trustedsipconfiguration = response.trustedsipconfiguration;
        vm.cascadeBandwidth = response.cascadeBandwidth;
        vm.validCascadeBandwidth = response.inValidBandwidth;
      }
    }

    function sipSettingsEnabledCheck(response) {
      if (!_.isUndefined(response.sipSettingEnabled)) vm.sipSettingEnabled = response.sipSettingEnabled;
    }
    function newClusterCheck() {
      return (_.includes(vm.clusterlist, vm.clusterName));
    }

    function clusterSettingsCheck() {
      return (vm.hasMfFeatureToggle || vm.hasMfSIPFeatureToggle || vm.hasMfCascadeBwConfigToggle);
    }

    function next() {
      vm.currentStep += 1;
      if (vm.currentStep <= 6) {
        switch (vm.currentStep) {
          case 0:
            vm.headerSelected = vm.headerOptions[0];
            break;
          case 1:
            if (vm.registerNode === '0') {
              vm.ovaDownload = true;
              if (vm.ovaType === '1') {
                $window.open('https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/Media-Fusion-Management-Connector/mfusion.ova');
              } else {
                $window.open('https://7f3b835a2983943a12b7-f3ec652549fc8fa11516a139bfb29b79.ssl.cf5.rackcdn.com/hybrid-media-demo/hybridmedia_demo.ova');
              }
            } else {
              if (vm.firstTimeSetup) {
                vm.loading = true;
                vm.currentStep = 0;
                firstTimeCluster();
              } else {
                vm.currentStep = 2;
                vm.clusterCreation = true;
              }
            }
            vm.headerSelected = vm.headerOptions[0];
            break;
          case 2:
            vm.headerSelected = vm.headerOptions[0];
            break;
          case 3:
            if (newClusterCheck()) {
              vm.currentStep = 6;
              vm.headerSelected = vm.headerOptions[4];
              break;
            } else if (clusterSettingsCheck()) {
              vm.headerSelected = vm.headerOptions[1];
              break;
            } else {
              vm.currentStep = 4;
              vm.headerSelected = vm.headerOptions[2];
              break;
            }
          case 4:
            vm.headerSelected = vm.headerOptions[2];
            break;
          case 5:
            if (vm.firstTimeSetup) {
              vm.headerSelected = vm.headerOptions[3];
              break;
            } else {
              vm.currentStep = 6;
              vm.headerSelected = vm.headerOptions[4];
              break;
            }
          case 6:
            vm.headerSelected = vm.headerOptions[4];
            break;
          case 7:
            vm.headerSelected = vm.headerOptions[0];
            break;
        }
      }
    }

    function canGoNext() {
      if (vm.currentStep === 0) {
        if (!_.isUndefined(vm.registerNode)) {
          return true;
        }
      } else if (vm.currentStep === 2) {
        if (vm.hostName && vm.clusterName && vm.validNode && !vm.onlineNode && !vm.offlineNode) {
          return true;
        } else if (!_.isUndefined(vm.hostName) && vm.hostName != '' && vm.validNode && !vm.onlineNode && !vm.offlineNode && !_.isUndefined(vm.clusterName) && vm.clusterName != '') {
          return true;
        } else {
          return false;
        }
      } else if (vm.currentStep === 3) {
        if (!vm.sipSettingEnabled) {
          return true;
        } else {
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
        }
      } else {
        return true;
      }
    }

    function back() {
      vm.currentStep -= 1;
      if (vm.currentStep <= 6) {
        switch (vm.currentStep) {
          case 0:
            vm.headerSelected = vm.headerOptions[0];
            break;
          case 1:
            vm.headerSelected = vm.headerOptions[0];
            break;
          case 2:
            vm.headerSelected = vm.headerOptions[0];
            break;
          case 3:
            if (clusterSettingsCheck()) {
              vm.headerSelected = vm.headerOptions[1];
              break;
            } else {
              vm.currentStep = 2;
              vm.headerSelected = vm.headerOptions[0];
              break;
            }
          case 4:
            if (newClusterCheck()) {
              vm.currentStep = 2;
              vm.headerSelected = vm.headerOptions[0];
              break;
            } else {
              vm.headerSelected = vm.headerOptions[2];
              break;
            }
          case 5:
            if (vm.firstTimeSetup) {
              vm.headerSelected = vm.headerOptions[3];
              break;
            } else {
              if (newClusterCheck()) {
                vm.currentStep = 2;
                vm.headerSelected = vm.headerOptions[0];
                break;
              } else {
                vm.currentStep = 4;
                vm.headerSelected = vm.headerOptions[2];
                break;
              }
            }
          case 6:
            vm.headerSelected = vm.headerOptions[4];
            break;
          case 7:
            vm.headerSelected = vm.headerOptions[0];
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
