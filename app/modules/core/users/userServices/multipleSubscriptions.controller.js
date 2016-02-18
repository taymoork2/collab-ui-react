(function () {
  'use strict';

  angular
    .module('Core')
    .controller('MultipleSubscriptionsCtrl', MultipleSubscriptionsCtrl);

  /* @ngInject */
  function MultipleSubscriptionsCtrl(Orgservice) {
    var vm = this;

    vm.multiSubscriptions = {
      oneBilling: false,
      selected: '',
      options: []
    };

    init();

    function init() {

      Orgservice.getLicensesUsage().then(function (subscriptions) {
        vm.multiSubscriptions.options = _.uniq(_.pluck(subscriptions, 'subscriptionId'));
        vm.multiSubscriptions.selected = _.first(vm.multiSubscriptions.options);
        vm.multiSubscriptions.oneBilling = _.size(vm.multiSubscriptions.options) === 1;
      }).catch(function (response) {
        Notification.errorResponse(response, 'onboardModal.subscriptionIdError');
      });

      function showMultiSubscriptions(billingServiceId, isTrial) {
        var isSelected = false;

        var isTrialSubscription = (_.isUndefined(billingServiceId) || _.isEmpty(billingServiceId)) && isTrial &&
          (_.eq('Trial', vm.multiSubscriptions.selected));
        if (_.isArray(billingServiceId)) {
          for (var i in billingServiceId) {
            if (_.eq(billingServiceId[i], vm.multiSubscriptions.selected)) {
              isSelected = true;
              break;
            }
          }
        } else {
          isSelected = (_.eq(billingServiceId, vm.multiSubscriptions.selected));
        }

        return vm.multiSubscriptions.oneBilling || isSelected || isTrialSubscription;
      }
      
    }
  }

})();
