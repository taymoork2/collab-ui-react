(function () {
  'use strict';

  angular.module('core.trial')
    .controller('TrialNoticeBannerCtrl', TrialNoticeBannerCtrl);

  /* @ngInject */
  function TrialNoticeBannerCtrl($q, Authinfo, Notification, TrialService, UserListService) {
    var vm = this;
    var primaryPartnerAdminId;

    vm.requestResultEnum = {
      SUCCESS: 0,
      PARTIAL_FAILURE: 1,
      TOTAL_FAILURE: 2,
      NOT_REQUESTED: 3,
    };

    vm.canShow = canShow;
    vm.daysLeft = undefined;
    vm.requestResult = vm.requestResultEnum.NOT_REQUESTED;
    vm.partnerAdmin = [];
    vm.sendRequest = sendRequest;
    vm._helpers = {
      getPartnerInfo: getPartnerInfo,
      getWebexSiteUrl: getWebexSiteUrl,
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
      return TrialService.notifyPartnerTrialExt()
        .catch(function (err) {
          Notification.errorWithTrackingId(err, 'trials.requestConfirmTotalFailNotifyMsg');
          vm.requestResult = vm.requestResultEnum.TOTAL_FAILURE;
          return $q.reject(err);
        })
        .then(function (results) {
          var notifySuccess = _.filter(results.data.notifyPartnerEmailStatusList, {
            status: 200,
          });

          if (notifySuccess.length === 0) {
            Notification.errorWithTrackingId(results, 'trials.requestConfirmTotalFailNotifyMsg');
            vm.requestResult = vm.requestResultEnum.TOTAL_FAILURE;
          } else if (notifySuccess.length === results.data.notifyPartnerEmailStatusList.length) {
            Notification.success('trials.requestConfirmNotifyMsg');
            vm.requestResult = vm.requestResultEnum.SUCCESS;
          } else {
            Notification.errorWithTrackingId(results, 'trials.requestConfirmPartialFailNotifyMsg', {
              partnerOrgName: partnerOrgName,
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
