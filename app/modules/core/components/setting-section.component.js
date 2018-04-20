require('./_setting-section.scss');

(function () {
  angular.module('Core')
    .component('settingSection', {
      bindings: {
        setting: '=',
      },
      transclude: true,
      template: require('modules/core/components/setting-section.html'),
    });
})();
