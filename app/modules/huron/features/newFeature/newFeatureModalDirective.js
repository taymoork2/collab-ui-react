(function () {
  'use strict';

  angular
    .module('uc.hurondetails')
    .directive('ucNewFeatureModal', ucNewFeatureModal);

  function ucNewFeatureModal() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/features/newFeature/newFeatureModal.tpl.html'
    };

    return directive;
  }

})();
