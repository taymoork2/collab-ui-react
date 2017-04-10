(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('ucExternalNumberOverview', ucExternalNumberOverview);

  function ucExternalNumberOverview() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/huron/externalNumbers/externalNumberOverview.tpl.html',
      controller: 'ExternalNumberOverviewCtrl',
      controllerAs: 'externalNumberOverview',
    };

    return directive;
  }

})();
