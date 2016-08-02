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
    // US11663 - Hide data retention content for now.  Will be restored in the future.
    vm.showDataRetentionContent = false;

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

    FeatureToggleService.atlasDataRetentionSettingsGetStatus().then(function (toggle) {
      vm.showDataRetentionContent = toggle;
    }).finally(init);

    function init() {
      getServices();
      getOrgSettings();
    }

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

    $scope.setupNext = function () {
      if (!_.isEmpty(vm.selected.value) && !currentDataRetentionPeriod) {
        AccountOrgService.addOrgDataRetentionPeriodDays(orgId, vm.selected.value)
          .then(function (response) {
            Notification.success('firstTimeWizard.messengerRetentionSuccess');
          })
          .catch(function (response) {
            Notification.error('firstTimeWizard.messengerRetentionError');
          });
      }

      if (!_.isEmpty(vm.selected.value) && currentDataRetentionPeriod && currentDataRetentionPeriod !== vm.selected.value) {
        AccountOrgService.modifyOrgDataRetentionPeriodDays(orgId, vm.selected.value)
          .then(function (response) {
            Notification.success('firstTimeWizard.messengerRetentionEditSuccess');
          })
          .catch(function (response) {
            Notification.error('firstTimeWizard.messengerRetentionEditError');
          });
      }

      if (vm.msgIntegration && !msgIntFlag) {
        AccountOrgService.addMessengerInterop(orgId)
          .then(function (response) {
            Notification.success('firstTimeWizard.messengerEnableWebexSuccess');
          })
          .catch(function (response) {
            Notification.error('firstTimeWizard.messengerEnableWebexError');
          });

      } else if (!vm.msgIntegration && msgIntFlag) {
        AccountOrgService.deleteMessengerInterop(orgId)
          .then(function (response) {
            Notification.success('firstTimeWizard.messengerDisableWebexError');
          })
          .catch(function (response) {
            Notification.error('firstTimeWizard.messengerDisableWebexError');
          });
      }
    };
  }
})();
