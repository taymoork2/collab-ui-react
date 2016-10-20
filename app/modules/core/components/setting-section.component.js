(function () {
  angular.module('Core')
    .component('settingSection', {
      bindings: {
        setting: '='
      },
      transclude: true,
      templateUrl: "modules/core/components/setting-section.html"
    });
})();
