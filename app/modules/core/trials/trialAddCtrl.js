(function () {
  'use strict';

  angular.module('Core')
    .controller('TrialAddCtrl', TrialAddCtrl);

  /* @ngInject */
  function TrialAddCtrl($scope, $state, $translate, $q, Authinfo, TrialService, HuronCustomer, Notification, Config) {
    var vm = this;

    vm.customerOrgId = null;
    vm.nameError = false;
    vm.emailError = false;
    vm.licenseDuration = 90;
    vm.licenseCount = 100;
    vm.startDate = new Date();
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

    $scope.$watch(function () {
      return vm.offers[Config.trials.squaredUC];
    }, function (newValue) {
      if (newValue) {
        vm.offers[Config.trials.collab] = true;
      }
    });

    vm.isSquaredUC = Authinfo.isSquaredUC;
    vm.isOffersEmpty = isOffersEmpty;

    vm.startTrial = startTrial;
    vm.isSquaredUCEnabled = isSquaredUCEnabled;
    vm.gotoAddNumber = gotoAddNumber;

    function isOffersEmpty() {
      return !(vm.offers[Config.trials.collab] || vm.offers[Config.trials.squaredUC]);
    }

    function isSquaredUCEnabled() {
      return vm.offers[Config.trials.squaredUC];
    }

    function gotoAddNumber() {
      $state.go('trialAdd.addNumbers');
    }

    function startTrial(keepModal) {
      vm.nameError = false;
      vm.emailError = false;
      angular.element('#startTrialButton').button('loading');

      var offersList = [];
      for (var i in vm.offers) {
        if (vm.offers[i]) {
          offersList.push(i);
        }
      }

      return TrialService.startTrial(vm.customerName, vm.customerEmail, vm.licenseDuration, vm.licenseCount, vm.startDate, offersList)
        .catch(function (response) {
          angular.element('#startTrialButton').button('reset');
          Notification.notify([response.data.message], 'error');
          if ((response.data.message).indexOf('Org') > -1) {
            vm.nameError = true;
          } else if ((response.data.message).indexOf('Admin User') > -1) {
            vm.emailError = true;
          }
          return $q.reject();
        }).then(function (response) {
          vm.customerOrgId = response.data.customerOrgId;
          if (offersList.indexOf(Config.trials.squaredUC) !== -1) {
            return HuronCustomer.create(response.data.customerOrgId, response.data.customerName, response.data.customerEmail)
              .catch(function () {
                angular.element('#startTrialButton').button('reset');
                Notification.notify([$translate.instant('trialModal.squareducError')], 'error');
                return $q.reject();
              });
          }
        }).then(function () {
          angular.element('#startTrialButton').button('reset');
          if (!keepModal) {
            $state.modal.close();
          }
          var successMessage = [$translate.instant('trialModal.addSuccess', {
            customerName: vm.customerName,
            licenseCount: vm.licenseCount,
            licenseDuration: vm.licenseDuration
          })];
          Notification.notify(successMessage, 'success');
          return vm.customerOrgId;
        });
    }
  }
})();
