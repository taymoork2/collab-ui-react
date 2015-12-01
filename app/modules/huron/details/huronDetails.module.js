(function () {
  'use strict';

  angular.module('uc.hurondetails', ['uc.lines'],
    function (formlyConfigProvider) {
      var commonWrappers = ['ciscoWrapper'];
      formlyConfigProvider.setType({
        name: 'nested',
        template: '<formly-form model="model[options.key]" fields="options.data.fields"></formly-form>',
        wrapper: commonWrappers
      });
      formlyConfigProvider.setType({
        name: 'switch',
        template: '<cs-toggle-switch ng-model="model[options.key]" toggle-id="model[options.key]" name="toggleSwitch"></cs-toggle-switch>',
        wrapper: commonWrappers
      });
      formlyConfigProvider.setType({
        name: 'icon-button',
        template: '<i ng-class="to.btnClass" ng-click="to.onClick(options, this)"></i>',
        wrapper: commonWrappers
      });
    }
  );

})();
