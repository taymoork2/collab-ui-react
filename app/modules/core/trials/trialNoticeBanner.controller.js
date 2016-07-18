(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialNoticeBannerCtrl', TrialNoticeBannerCtrl);

  /* @ngInject */
  function TrialNoticeBannerCtrl($q, Authinfo, EmailService, Notification, TrialService, UserListService) {
    var vm = this;
    var primaryPartnerAdminId;

    vm.requestResultEnum = {
      SUCCESS: 0,
      PARTIAL_FAILURE: 1,
      TOTAL_FAILURE: 2,
      NOT_REQUESTED: 3
    };

    vm.canShow = canShow;
    vm.daysLeft = undefined;
    vm.requestResult = vm.requestResultEnum.NOT_REQUESTED;
    vm.partnerAdmin = [];
    vm.sendRequest = sendRequest;
    vm._helpers = {
      getPartnerInfo: getPartnerInfo,
      sendEmail: sendEmail,
      getWebexSiteUrl: getWebexSiteUrl
    };

    init();

    ///////////////////////

    function init() {
      TrialService.getDaysLeftForCurrentUser().then(function (daysLeft) {
        vm.daysLeft = daysLeft;
      });
      getPartnerInfo();

    }

    function canShow() {
      return Authinfo.isUserAdmin() && !!TrialService.getTrialIds().length && (primaryPartnerAdminId !== Authinfo.getUserId());

    }

    function sendRequest() {
      var partnerOrgName = Authinfo.getOrgName();
      var customerEmail = Authinfo.getPrimaryEmail();

      return vm._helpers.sendEmail(partnerOrgName, customerEmail)
        .then(function (results) {

          var emailError = _.filter(results, {
            status: 400
          });
          if (emailError.length === 0) {
            Notification.success('trials.requestConfirmNotifyMsg');
            vm.requestResult = vm.requestResultEnum.SUCCESS;
          } else if (emailError.length === vm.partnerAdmin.length) {
            Notification.error('trials.requestConfirmTotalFailNotifyMsg');
            vm.requestResult = vm.requestResultEnum.TOTAL_FAILURE;

          } else {
            Notification.error('trials.requestConfirmPartialFailNotifyMsg', {
              partnerOrgName: partnerOrgName
            });
            vm.requestResult = vm.requestResultEnum.PARTIAL_FAILURE;

          }

        });
    }

    function getPartnerInfo() {
      return UserListService.listPartnersAsPromise(Authinfo.getOrgId()).then(function (response) {
        primaryPartnerAdminId = _.get(response, 'data.partners[0].id');
        vm.partnerAdmin = _.get(response, 'data.partners');
      });
    }

    function sendEmail(customerName, customerEmail) {
      var webexSiteUrl = vm._helpers.getWebexSiteUrl();
      //for all partner admins - build an array of send email function calls
      var partnerEmail = _.map(vm.partnerAdmin, function (admin) {
        return EmailService.emailNotifyPartnerTrialConversionRequest(
          customerName, customerEmail, admin.userName, webexSiteUrl).catch(function (err) {
          err.userName = admin.userName;
          return err;
        });
      });
      return $q.all(partnerEmail);
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
