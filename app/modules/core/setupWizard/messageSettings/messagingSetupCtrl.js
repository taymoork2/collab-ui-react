(function () {
  'use strict';

  angular
    .module('Core')
    .controller('MessagingSetupCtrl', MessagingSetupCtrl);

  /* @ngInject */
  function MessagingSetupCtrl($scope, $translate, AccountOrgService, Analytics, Authinfo, FeatureToggleService, Notification) {
    var msgIntFlag = false;
    var currentDataRetentionPeriod = null;
    var orgId = Authinfo.getOrgId();
    var vm = this;
    vm.showMessengerInterop = false;
    vm.msgIntegration = false;
    vm.dataShare = true;
    vm.showAppSecurity = true;
    vm.appSecurity = false;
    vm.currentAppSecurity = false;
    // US11663 - Hide data retention content for now.  Will be restored in the future.
    vm.showDrContent = false;

    vm.placeholder = $translate.instant('firstTimeWizard.messagingSetupPlaceholder');
    vm.selected = {
      label: '',
      value: ''
    };
    vm.options = [{
      label: $translate.instant('firstTimeWizard.messagingSetupDataRetentionOption1'),
      value: 'immediate'
    }, {
      label: $translate.instant('firstTimeWizard.messagingSetupDataRetentionOption2'),
      value: '30'
    }, {
      label: $translate.instant('firstTimeWizard.messagingSetupDataRetentionOption3'),
      value: '60'
    }, {
      label: $translate.instant('firstTimeWizard.messagingSetupDataRetentionOption4'),
      value: '90'
    }, {
      label: $translate.instant('firstTimeWizard.messagingSetupDataRetentionOption5'),
      value: 'indefinite'
    }];

    FeatureToggleService.supports(FeatureToggleService.features.atlasAppleFeatures).then(function (result) {
      vm.showAppSecurity = result;
    }).finally(init);
    
    function init() {
      getServices();
      getOrgSettings();
      getAppSecurity();
    });

    function getServices() {
      AccountOrgService.getServices(orgId, null)
        .then(function (response) {
          var interopIndex = _.findIndex(response.data.entitlements, function (obj) {
            return obj.serviceId === 'messengerInterop';
          });
          if (interopIndex > -1) {
            vm.msgIntegration = true;
            msgIntFlag = true;
          }
        });
    }

    function getOrgSettings() {
      AccountOrgService.getOrgSettings(orgId)
        .then(function (response) {
          var dataRetentionIndex = _.findIndex(response.data.settings, function (obj) {
            return obj.key === 'dataRetentionPeriodDays';
          });
          if (dataRetentionIndex > -1) {
            var selectedIndex = _.findIndex(vm.options, function (obj) {
              return obj.value === response.data.settings[dataRetentionIndex].value;
            });
            vm.selected = vm.options[selectedIndex];
            currentDataRetentionPeriod = response.data.settings[dataRetentionIndex].value;
          }
        });
    }

    // Calls AppSecuritySetting service to get device security enforcement from enforceClientSecurity API
    function getAppSecurity() {
      return AccountOrgService.getAppSecurity(orgId)
        .then(function (response) {
          _.set(vm, 'appSecurity', response.data.enforceClientSecurity);
          vm.currentAppSecurity = vm.appSecurity;
        });
    }

    $scope.setupNext = function () {
      if (!_.isEmpty(vm.selected.value) && !currentDataRetentionPeriod) {
        AccountOrgService.addOrgDataRetentionPeriodDays(orgId, vm.selected.value)
          .then(function (response) {
            Notification.success($translate.instant('firstTimeWizard.messengerRetentionSuccess'));
          })
          .catch(function (response) {
            Notification.error($translate.instant('firstTimeWizard.messengerRetentionError'));
          });
      }

      if (!_.isEmpty(vm.selected.value) && currentDataRetentionPeriod && currentDataRetentionPeriod !== vm.selected.value) {
        AccountOrgService.modifyOrgDataRetentionPeriodDays(orgId, vm.selected.value)
          .then(function (response) {
            Notification.success($translate.instant('firstTimeWizard.messengerRetentionEditSuccess'));
          })
          .catch(function (response) {
            Notification.error($translate.instant('firstTimeWizard.messengerRetentionEditError'));
          });
      }

      FeatureToggleService.supports(FeatureToggleService.features.atlasAppleFeatures).then(function (result) {
        vm.showAppSecurity = result;

        if (result) {
          // Calls AppSecuritySetting service to update device security enforcement
          if (vm.currentAppSecurity !== vm.appSecurity) {
            AccountOrgService.setAppSecurity(orgId, vm.currentAppSecurity)
              .then(function (response) {
                Notification.success($translate.instant('firstTimeWizard.messengerAppSecuritySuccess'));
                Analytics.trackEvent('Device enforceClientSecurity', {
                  orgId: orgId
                });
              })
              .catch(function (response) {
                Notification.error($translate.instant('firstTimeWizard.messengerAppSecurityError'));
              });
          }
        }
      });

      if (vm.msgIntegration && !msgIntFlag) {
        AccountOrgService.addMessengerInterop(orgId)
          .then(function (response) {
            Notification.success($translate.instant('firstTimeWizard.messengerEnableWebexSuccess'));
          })
          .catch(function (response) {
            Notification.error($translate.instant('firstTimeWizard.messengerEnableWebexError'));
          });

      } else if (!vm.msgIntegration && msgIntFlag) {
        AccountOrgService.deleteMessengerInterop(orgId)
          .then(function (response) {
            Notification.success($translate.instant('firstTimeWizard.messengerDisableWebexError'));
          })
          .catch(function (response) {
            Notification.error($translate.instant('firstTimeWizard.messengerDisableWebexError'));
          });
      }
    };
  }
})();
