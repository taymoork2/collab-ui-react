(function () {
  'use strict';

  angular
    .module('Core')
    .controller('SettingsMenuCtrl', SettingsMenuCtrl);

  function SettingsMenuCtrl($scope, $state, $translate, Authinfo, $rootScope, languages) {
    var vm = this;

    vm.selected = {};
    vm.filterPlaceholder = $translate.instant('common.select');
    vm.selectPlaceholder = $translate.instant('common.selectLanguage');

    vm.options = _.map(languages, function (lang) {
      return {
        value: lang.value,
        label: $translate.instant('lang.label')
      };
    });

    vm.selected = _.find(vm.options, function (lang) {
      return lang.value === $translate.use();
    }) || {};

    $scope.updateLanguage = function () {
      $translate.use(vm.selected.value).then(function () {
        Authinfo.initializeTabs();
        $state.go('login');
        $rootScope.$broadcast('TABS_UPDATED');
      });
    };
  }

}());
