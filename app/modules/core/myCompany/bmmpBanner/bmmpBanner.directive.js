(function () {
  'use strict';

  angular
    .module('Core')
    .directive('crBmmpBanner', crBmmpBanner);

  function crBmmpBanner() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/core/myCompany/bmmpBanner/bmmpBanner.tpl.html',
      controller: 'BmmpBannerCtrl',
      controllerAs: 'bbCtrl',
      bindToController: true,
      scope: true
    };

    return directive;
  }
})();
