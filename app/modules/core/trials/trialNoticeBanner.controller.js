(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialNoticeBannerCtrl', TrialNoticeBannerCtrl);

  /* @ngInject */
  function TrialNoticeBannerCtrl($q, Authinfo, EmailService, FeatureToggleService, Notification, TrialService, UserListService) {
    var vm = this;
    var ft = {
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
      return $q.all([
          FeatureToggleService.supports(FeatureToggleService.features.atlasTrialConversion),
          getDaysLeft(),
          getPrimaryPartnerInfo()
        ])
        .then(function (results) {
          var enabled = results[0],
            daysLeft = results[1],
            partnerInfo = results[2];
          ft.atlasTrialConversion = enabled;
          vm.daysLeft = daysLeft;
          vm.partnerName = _.get(partnerInfo, 'data.partners[0].displayName');
        });
    }

    function canShow() {
      return ft.atlasTrialConversion && Authinfo.isUserAdmin();
    }

    function sendRequest() {
      // TODO: add sendEmail() here
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
