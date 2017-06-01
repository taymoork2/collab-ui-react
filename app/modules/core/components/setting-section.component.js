require('./_setting-section.scss');

(function () {
  angular.module('Core')
    .component('settingSection', {
      bindings: {
        setting: '=',
      },
      transclude: true,
      templateUrl: "modules/core/components/setting-section.html",
    });
})();
