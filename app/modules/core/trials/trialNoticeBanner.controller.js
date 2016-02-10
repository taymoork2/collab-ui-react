(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialNoticeBannerCtrl', TrialNoticeBannerCtrl);

  /* @ngInject */
  function TrialNoticeBannerCtrl($q, Authinfo, EmailService, FeatureToggleService, Notification, TrialService, UserListService) {
    var vm = this;
    var _ft = {
      atlasTrialConversion: false
    };

    vm.canShow = canShow;
    vm.daysLeft = 0;
    vm.hasRequested = false;
    vm.sendRequest = sendRequest;
    vm._helpers = {
      getDaysLeft: getDaysLeft,
      getPrimaryPartnerInfo: getPrimaryPartnerInfo,
      sendEmail: sendEmail
    };

    init();

    ///////////////////////

    function init() {
      return FeatureToggleService.supports(FeatureToggleService.features.atlasTrialConversion)
        .then(function (enabled) {
          _ft.atlasTrialConversion = enabled;
        })
        .then(getDaysLeft)
        .then(function (daysLeft) {
          vm.daysLeft = daysLeft;
        })
        .then(getPrimaryPartnerInfo)
        .then(function (partnerInfo) {
          vm.partnerName = _.get(partnerInfo, 'data.partners[0].displayName');
        });
    }

    function canShow() {
      return _ft.atlasTrialConversion && Authinfo.isCustomerAdmin();
    }

    function sendRequest() {
      Notification.success('trials.requestConfirmNotifyMsg', {
        partnerName: vm.partnerName
      });
      vm.hasRequested = true;
    }

    function getDaysLeft() {
      var trialIds = TrialService.getTrialIds();
      return TrialService.getExpirationPeriod(trialIds);
    }

    function getPrimaryPartnerInfo() {
      var custOrgId = Authinfo.getOrgId();
      return UserListService.listPartnersAsPromise(custOrgId);
    }

    function sendEmail() {
      // TODO: need to work around server-side-only available encryption for email template params
    }
  }
})();
