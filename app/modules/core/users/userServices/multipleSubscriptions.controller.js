(function () {
  'use strict';

  angular
    .module('Core')
    .controller('MultipleSubscriptionsCtrl', MultipleSubscriptionsCtrl);

  /* @ngInject */
  function MultipleSubscriptionsCtrl(Orgservice) {
    var vm = this;

    init();

    function init() {

      Orgservice.getLicensesUsage().then(function (subscriptions) {
        vm.multiSubscriptions.options = _.uniq(_.pluck(subscriptions, 'subscriptionId'));
        vm.multiSubscriptions.selected = _.first(vm.multiSubscriptions.options);
        vm.multiSubscriptions.oneBilling = _.size(vm.multiSubscriptions.options) === 1;
      }).catch(function (response) {
        Notification.errorResponse(response, 'onboardModal.subscriptionIdError');
      });
    }
  }

})();
