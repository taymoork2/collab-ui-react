(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucCustomerSubscriptionsOverview', ucCustomerSubscriptionsOverview);

  function ucCustomerSubscriptionsOverview() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/core/customers/customerSubscriptions/customerSubscriptionsOverview.tpl.html',
      controller: 'CustomerSubscriptionsOverviewCtrl',
      controllerAs: 'customerSubscriptionsOverview'
    };

    return directive;
  }

})();
