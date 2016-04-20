(function () {
  'use strict';

  angular
    .module('Core')
    .controller('TrialExtInterestCtrl', TrialExtInterestCtrl);

  /* @ngInject */
  function TrialExtInterestCtrl($location, $translate, Log, TrialExtInterestService) {
    var vm = this;

    //initialize ng-show variables
    vm.success = false;
    vm.badLink = false;
    vm.error = false;

    function showHide(success, badLink, error) {
      vm.success = success;
      vm.badLink = badLink;
      vm.error = error;
    }

    function notifyPartnerSuccess() {
      showHide(true, false, false);
    }

    function notifyPartnerBadLink() {
      showHide(false, true, false);
    }

    function notifyPartnerError() {
      showHide(false, false, true);
    }

    function notifyPartner(encryptedParam) {
      TrialExtInterestService.notifyPartnerAdmin(encryptedParam)
        .then(notifyPartnerSuccess)
        .catch(function (response) {
          var status = _.get(response, 'data.status');
          if (status === 400 || status === 403 || status === 404) {
            notifyPartnerBadLink();
          } else {
            notifyPartnerError();
          }
        });
    }

    var encryptedParam = $location.search().eqp;
    if (encryptedParam) {
      notifyPartner(encryptedParam);
    } else {
      notifyPartnerBadLink();
      Log.error($translate.instant('trialExtInterest.invalidLinkNoParam'));
    }
  }
})();
