(function () {
  'use strict';

  angular
    .module('Core')
    .controller('MultipleSubscriptionsCtrl', MultipleSubscriptionsCtrl);

  /* @ngInject */
  function MultipleSubscriptionsCtrl(Orgservice, Notification) {
    var vm = this;

    vm.oneBilling = false;
    vm.selectedSubscription = '';
    vm.subscriptionOptions = [];
    vm.roomSystemsExist = false;

    vm.showLicenses = showLicenses;

    init();

    function init() {

      Orgservice.getLicensesUsage().then(function (subscriptions) {
        vm.subscriptionOptions = _.uniq(_.pluck(subscriptions, 'subscriptionId'));
        vm.selectedSubscription = _.first(vm.subscriptionOptions);
        vm.oneBilling = _.size(vm.subscriptionOptions) === 1;
      }).catch(function (response) {
        Notification.errorResponse(response, 'onboardModal.subscriptionIdError');
      });

    }

    function showLicenses(billingServiceId, isTrial) {
      var isSelected = false;

      var isTrialSubscription = (_.isUndefined(billingServiceId) || _.isEmpty(billingServiceId)) && isTrial &&
        (_.eq('Trial', vm.selectedSubscription));
      if (_.isArray(billingServiceId)) {
        for (var i in billingServiceId) {
          if (_.eq(billingServiceId[i], vm.selectedSubscription)) {
            isSelected = vm.roomSystemsExist = true;
            break;
          }
        }
      } else {
        isSelected = vm.roomSystemsExist = _.eq(billingServiceId, vm.selectedSubscription);
      }

      return vm.oneBilling || isSelected || isTrialSubscription;
    }

  }

})();
