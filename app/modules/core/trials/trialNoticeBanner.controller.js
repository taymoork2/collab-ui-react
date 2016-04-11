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
    vm.daysLeft = null;
    vm.hasRequested = false;
    vm.partnerAdminEmail = null;
    vm.partnerAdminDisplayName = null;
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

          // TODO: override globally to true for now, remove this and respective feature-toggle logic after 2016-04-09
          ft.atlasTrialConversion = true;

          vm.daysLeft = daysLeft;

          vm.partnerAdminEmail = _.get(partnerInfo, 'data.partners[0].userName');
          vm.partnerAdminDisplayName = _.get(partnerInfo, 'data.partners[0].displayName');
        });
    }

    function canShow() {
      return ft.atlasTrialConversion && Authinfo.isUserAdmin() && (TrialService.getTrialIds().length > 0);
    }

    function sendRequest() {
      return vm._helpers.sendEmail()
        .then(function () {
          Notification.success('trials.requestConfirmNotifyMsg', {
            partnerAdminDisplayName: vm.partnerAdminDisplayName
          });
          vm.hasRequested = true;
        });
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
      var customerName = Authinfo.getOrgName();
      var customerEmail = Authinfo.getPrimaryEmail();
      var partnerEmail = vm.partnerAdminEmail;
      return EmailService.emailNotifyPartnerTrialConversionRequest(
        customerName, customerEmail, partnerEmail);
    }
  }
})();
