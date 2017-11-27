(function () {
  'use strict';

  angular
    .module('Core')
    .controller('MultipleSubscriptionsCtrl', MultipleSubscriptionsCtrl);

  /* @ngInject */
  function MultipleSubscriptionsCtrl(Notification, Orgservice) {
    var vm = this;

    vm.oneBilling = false;
    vm.selectedSubscription = '';
    vm.subscriptionOptions = [];
    vm.roomSystemsExist = false;
    vm.showLicenses = showLicenses;
    vm.showCareLicenses = showCareLicenses;

    init();

    function init() {
      Orgservice.getInternallyManagedSubscriptions().then(function (subscriptions) {
        vm.subscriptionOptions = _.uniq(_.map(subscriptions, 'subscriptionId'));
        vm.subscriptionOptions = _.sortBy(vm.subscriptionOptions, function (o) {
          return o === 'Trial' ? 1 : -1;
        });
        vm.selectedSubscription = _.head(vm.subscriptionOptions);
        vm.oneBilling = _.size(vm.subscriptionOptions) === 1;
        vm.roomSystemsExist = _.some(_.flatten(_.uniq(_.map(subscriptions, 'licenses'))), {
          licenseType: 'SHARED_DEVICES',
        });
      }).catch(function (response) {
        Notification.errorResponse(response, 'onboardModal.subscriptionIdError');
      });
    }

    function showCareLicenses(careLicenses) {
      var careDisplay = false;

      if (careLicenses) {
        _.forEach(careLicenses, function (care) {
          if (care.license) {
            careDisplay = careDisplay || showLicenses(care.license.billingServiceId, care.license.isTrial);
          }
        });
      }
      return careDisplay;
    }

    function showLicenses(billingServiceId, isTrial) {
      var isSelected = false;

      var isTrialSubscription = (_.isUndefined(billingServiceId) || _.isEmpty(billingServiceId)) && isTrial &&
        (_.eq('Trial', vm.selectedSubscription));
      if (_.isArray(billingServiceId)) {
        for (var i in billingServiceId) {
          if (_.eq(billingServiceId[i], vm.selectedSubscription)) {
            isSelected = true;
            break;
          }
        }
      } else {
        isSelected = _.eq(billingServiceId, vm.selectedSubscription);
      }

      return vm.oneBilling || isSelected || isTrialSubscription;
    }
  }
})();
