(function () {
  'use strict';

  angular
    .module('Core')
    .directive('customerWebexOverview', customerWebexOverview);

  function customerWebexOverview() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/core/customers/customerOverview/webexOverview.tpl.html',
      controller: 'CustomerWebexOverviewCtrl',
      controllerAs: 'customerWebexOverview'
    };

    return directive;
  }

})();
