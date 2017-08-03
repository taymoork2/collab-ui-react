(function () {
  'use strict';

  angular.module('Core')
    .controller('WizardFinishCtrl', WizardFinishCtrl);

  /* @ngInject */
  function WizardFinishCtrl($q, $scope, $translate, Authinfo, Notification, SetupWizardService, TrialWebexService) {
    $scope.hasPendingLicenses = SetupWizardService.hasPendingLicenses();
    $scope.sendEmailModel = false;
    $scope.isCustomerLaunchedFromPartner = Authinfo.isCustomerLaunchedFromPartner();
    $scope.setSendCustomerEmailFlag = setSendCustomerEmailFlag;
    $scope.orderDetails = {
      subscriptionId: formatSubscriptionId(SetupWizardService.getActingSubscriptionId()),
      orderId: SetupWizardService.getCurrentOrderNumber(),
    };
    $scope.initNext = function () {
      var deferred = $q.defer();
      if (!_.isUndefined($scope.wizard) && _.isFunction($scope.wizard.getRequiredTabs)) {
        var required = $scope.wizard.getRequiredTabs();
        if (_.isArray(required) && required.length > 0) {
          var errors = [];
          for (var i = 0; i < required.length; i++) {
            errors.push($translate.instant('firstTimeWizard.completeRequired', {
              name: required[i],
            }));
          }
          Notification.notify(errors, 'error');
          deferred.reject();
        }
      }
      deferred.resolve();
      return deferred.promise;
    };

    init();

    function init() {
      pushBlankProvisioningCall();
    }

    function setSendCustomerEmailFlag(flag) {
      if (!_.isBoolean(flag)) {
        return $q.reject('A boolean must be passed.');
      }
      TrialWebexService.setProvisioningWebexSendCustomerEmailFlag(flag);
    }

    function pushBlankProvisioningCall() {
      if (!_.has(SetupWizardService.provisioningCallbacks, 'meetingSettings') && $scope.hasPendingLicenses) {
        var emptyProvisioningCall = {
          meetingSettings: (function () {
            return TrialWebexService.provisionSubscriptionWithoutWebexSites().then(function () {
              Notification.success('firstTimeWizard.webexProvisioningSuccess');
            }).catch(function (response) {
              Notification.errorWithTrackingId(response, 'firstTimeWizard.webexProvisioningError');
            });
          }),
        };

        SetupWizardService.addProvisioningCallbacks(emptyProvisioningCall);
      }
    }
    function formatSubscriptionId(id) {
      if (id.lastIndexOf('/') !== -1) {
        return id.slice(0, id.lastIndexOf('/'));
      }
      return id;
    }
  }
})();
