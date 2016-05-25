  (function () {
    'use strict';

    angular
      .module('Core')
      .controller('MessagingSetupCtrl', MessagingSetupCtrl);

    /* @ngInject */
    function MessagingSetupCtrl($scope, $translate, AccountOrgService, Authinfo, FeatureToggleService, Notification) {
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

      vm.placeholder = 'Select retention time';
      vm.selected = {
        label: '',
        value: ''
      };
      vm.options = [{
        label: 'Delete immediately',
        value: 'immediate'
      }, {
        label: '30 days',
        value: '30'
      }, {
        label: '60 days',
        value: '60'
      }, {
        label: '90 days',
        value: '90'
      }, {
        label: 'Keep forever',
        value: 'indefinite'
      }];

      FeatureToggleService.supports(FeatureToggleService.features.atlasAppleFeatures).then(function (result) {
        vm.showAppSecurity = result;
      });

      init();

      function init() {
        getServices();
        getOrgSettings();
        getAppSecurity();
      }

      function getServices() {
        AccountOrgService.getServices(orgId, null)
          .success(function (data, status) {
            var interopIndex = _.findIndex(data.entitlements, function (obj) {
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
          .success(function (data, status) {
            var dataRetentionIndex = _.findIndex(data.settings, function (obj) {
              return obj.key === 'dataRetentionPeriodDays';
            });
            if (dataRetentionIndex > -1) {
              var selectedIndex = _.findIndex(vm.options, function (obj) {
                return obj.value === data.settings[dataRetentionIndex].value;
              });
              vm.selected = vm.options[selectedIndex];
              currentDataRetentionPeriod = data.settings[dataRetentionIndex].value;
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

      $scope.$on('wizard-messenger-setup-event', function () {

        if (!_.isEmpty(vm.selected.value) && !currentDataRetentionPeriod) {
          AccountOrgService.addOrgDataRetentionPeriodDays(orgId, vm.selected.value)
            .then(function (response) {
              Notification.notify([$translate.instant('firstTimeWizard.messengerRetentionSuccess')], 'success');
            })
            .catch(function (response) {
              Notification.notify([$translate.instant('firstTimeWizard.messengerRetentionError')], 'error');
            });
        }

        if (!_.isEmpty(vm.selected.value) && currentDataRetentionPeriod && currentDataRetentionPeriod !== vm.selected.value) {
          AccountOrgService.modifyOrgDataRetentionPeriodDays(orgId, vm.selected.value)
            .then(function (response) {
              Notification.notify([$translate.instant('firstTimeWizard.messengerRetentionEditSuccess')], 'success');
            })
            .catch(function (response) {
              Notification.notify([$translate.instant('firstTimeWizard.messengerRetentionEditError')], 'error');
            });
        }

        FeatureToggleService.supports(FeatureToggleService.features.atlasAppleFeatures).then(function (result) {
          vm.showAppSecurity = result;

          if (result) {
            // Calls AppSecuritySetting service to update device security enforcement
            if (vm.currentAppSecurity !== vm.appSecurity) {
              AccountOrgService.setAppSecurity(orgId, vm.currentAppSecurity)
                .then(function (response) {
                  Notification.notify([$translate.instant('firstTimeWizard.messengerAppSecuritySuccess')], 'success');
                })
                .catch(function (response) {
                  Notification.notify([$translate.instant('firstTimeWizard.messengerAppSecurityError')], 'error');
                });
            }
          }
        });

        if (vm.msgIntegration && !msgIntFlag) {
          AccountOrgService.addMessengerInterop(orgId)
            .then(function (response) {
              Notification.notify([$translate.instant('firstTimeWizard.messengerEnableWebexSuccess')], 'success');
            })
            .catch(function (response) {
              Notification.notify([$translate.instant('firstTimeWizard.messengerEnableWebexError')], 'error');
            });

        } else if (!vm.msgIntegration && msgIntFlag) {
          AccountOrgService.deleteMessengerInterop(orgId)
            .then(function (response) {
              Notification.notify([$translate.instant('firstTimeWizard.messengerDisableWebexError')], 'success');
            })
            .catch(function (response) {
              Notification.notify([$translate.instant('firstTimeWizard.messengerDisableWebexError')], 'error');
            });
        }

      });

    }
  })();
