(function () {
  'use strict';

  angular
    .module('Core')
    .controller('SettingsMenuCtrl', SettingsMenuCtrl);

  function SettingsMenuCtrl($state, $translate, $rootScope, languages) {
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

    // sets moment with the correct locale for entire app
    moment.locale(vm.selected.value);

    vm.updateLanguage = function () {
      $translate.use(vm.selected.value).then(function () {
        moment.locale(vm.selected.value);
        $state.go('login');
        $rootScope.$broadcast('TABS_UPDATED');
      });
    };
  }

}());
