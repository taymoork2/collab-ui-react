(function () {
  'use strict';

  angular.module('Core')
    .controller('TrialEditCtrl', TrialEditCtrl);

  /* @ngInject */
  function TrialEditCtrl($state, $stateParams, $translate, Authinfo, PartnerService, Notification) {
    var vm = this;

    vm.currentTrial = angular.copy($stateParams.currentTrial);
    vm.showPartnerEdit = $stateParams.showPartnerEdit;

    vm.editTerms = true;

    vm.offers = {};
    vm.licenseDurationOptions = [{
      label: $translate.instant('partnerHomePage.ninetyDays'),
      value: 90,
      name: 'licenseDuration',
      id: 'licenseDuration90'
    }, {
      label: $translate.instant('partnerHomePage.onehundredtwentyDays'),
      value: 120,
      name: 'licenseDuration',
      id: 'licenseDuration120'
    }, {
      label: $translate.instant('partnerHomePage.onehundredeightyDays'),
      value: 180,
      name: 'licenseDuration',
      id: 'licenseDuration180'
    }];

    vm.isSquaredUC = Authinfo.isSquaredUC;
    vm.getDaysLeft = getDaysLeft;
    vm.editTrial = editTrial;

    initializeOffers();

    ///////////////////

    function initializeOffers() {
      if (vm.currentTrial && vm.currentTrial.offers) {
        for (var i in vm.currentTrial.offers) {
          var offer = vm.currentTrial.offers[i];
          if (offer && offer.id) {
            vm.offers[offer.id] = true;
          }
        }
      }
    }

    function getDaysLeft(daysLeft) {
      if (daysLeft < 0) {
        return $translate.instant('customerPage.expired');
      } else if (daysLeft === 0) {
        return $translate.instant('customerPage.expiresToday');
      } else {
        return daysLeft;
      }
    }

    function editTrial() {
      var createdDate = new Date();
      var offersList = [];
      for (var i in vm.offers) {
        if (vm.offers[i]) {
          offersList.push(i);
        }
      }
      angular.element('#saveSendButton').button('loading');
      return PartnerService.editTrial(vm.currentTrial.duration, vm.currentTrial.trialId, vm.currentTrial.licenses, vm.currentTrial.usage, vm.currentTrial.customerOrgId, offersList)
        .then(function (data, status) {
          angular.element('#saveSendButton').button('reset');
          angular.extend($stateParams.currentTrial, vm.currentTrial);
          var successMessage = [$translate.instant('trialModal.editSuccess', {
            customerName: vm.currentTrial.customerName,
            licenseCount: vm.currentTrial.licenses,
            licenseDuration: vm.currentTrial.duration
          })];
          Notification.notify(successMessage, 'success');
          $state.modal.close();
        })
        .catch(function (response) {
          angular.element('#saveSendButton').button('reset');
          Notification.notify([response.data.message], 'error');
        });
    };
  }
})();
