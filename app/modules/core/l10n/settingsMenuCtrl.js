(function () {
  'use strict';

  angular
    .module('Core')
    .controller('SettingsMenuCtrl', SettingsMenuCtrl);

  function SettingsMenuCtrl($location, $rootScope, $state, $stateParams, $translate, languages, SessionStorage, Storage, StorageKeys) {
    var vm = this;

    vm.options = _.map(languages, function (lang) {
      return {
        value: lang.value,
        label: $translate.instant(lang.label),
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
        Storage.put('language', vm.selected.value);
        SessionStorage.put(StorageKeys.REQUESTED_STATE_NAME, $state.current.name);
        SessionStorage.putObject(StorageKeys.REQUESTED_STATE_PARAMS, $stateParams);
        SessionStorage.putObject(StorageKeys.REQUESTED_QUERY_PARAMS, $location.search());
        $state.go('login');
        $rootScope.$broadcast('TABS_UPDATED');
      });
    };
  }

}());
