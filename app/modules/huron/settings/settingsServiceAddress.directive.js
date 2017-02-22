(function () {
  'use strict';

  angular.module('Huron')
    .directive('hrSettingsServiceAddress', hrSettingsServiceAddress);

  /* @ngInject */
  function hrSettingsServiceAddress() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/huron/settings/settingsServiceAddress.tpl.html',
      controller: 'SettingsServiceAddressCtrl',
      controllerAs: 'settingsServiceAddress',
      bindToController: true,
      scope: true,
    };

    return directive;
  }
})();
