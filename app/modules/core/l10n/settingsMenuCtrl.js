(function () {
  'use strict';

  angular
    .module('Core')
    .controller('SettingsMenuCtrl', SettingsMenuCtrl);

  function SettingsMenuCtrl($state, $stateParams, $translate, Authinfo, $rootScope, languages) {
    var vm = this;

    vm.options = _.map(languages, function (lang) {
      return {
        value: lang.value,
        label: $translate.instant(lang.label)
      };
    });

    vm.selected = _.find(vm.options, function (lang) {
      return lang.value === $translate.use();
    }) || {};

    vm.updateLanguage = function () {
      $translate.use(vm.selected.value).then(function () {
        Authinfo.initializeTabs();
        $state.go($state.current, $stateParams, {
          notify: true,
          reload: true
        });
        $rootScope.$broadcast('TABS_UPDATED');
      });
    };
  }

}());
