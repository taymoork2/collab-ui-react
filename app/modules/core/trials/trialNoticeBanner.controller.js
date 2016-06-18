(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialNoticeBannerCtrl', TrialNoticeBannerCtrl);

  /* @ngInject */
  function TrialNoticeBannerCtrl($q, Authinfo, EmailService, Notification, TrialService, UserListService) {
    var vm = this;

    vm.canShow = canShow;
    vm.daysLeft = null;
    vm.hasRequested = false;
    vm.partnerAdminEmail = null;
    vm.partnerAdminDisplayName = null;
    vm.sendRequest = sendRequest;
    vm._helpers = {
      getDaysLeft: getDaysLeft,
      getPrimaryPartnerInfo: getPrimaryPartnerInfo,
      sendEmail: sendEmail,
      getWebexSiteUrl: getWebexSiteUrl
    };

    init();

    ///////////////////////

    function init() {
      return $q.all([
          getDaysLeft(),
          getPrimaryPartnerInfo()
        ])
        .then(function (results) {
          var daysLeft = results[0],
            partnerInfo = results[1];

          vm.daysLeft = daysLeft;

          vm.partnerAdminEmail = _.get(partnerInfo, 'data.partners[0].userName');
          vm.partnerAdminDisplayName = _.get(partnerInfo, 'data.partners[0].displayName');
        });
    }

    function canShow() {
      return Authinfo.isUserAdmin() && (TrialService.getTrialIds().length > 0);
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
      var webexSiteUrl = vm._helpers.getWebexSiteUrl();
      return EmailService.emailNotifyPartnerTrialConversionRequest(
        customerName, customerEmail, partnerEmail, webexSiteUrl);
    }

    function getWebexSiteUrl() {
      // find the first instance matching the criteria...
      var result = _.find(Authinfo.getConferenceServices(), function (service) {
        return _.get(service, 'license.siteUrl', null);
      });
      // ...and return the appropriate value
      return _.get(result, 'license.siteUrl', null);

    }
  }
})();
