(function () {
  'use strict';

  angular
    .module('uc.callrouter', ['uc.callpark', 'uc.autoattendant'],
      function (formlyConfigProvider) {
        var commonWrappers = ['ciscoWrapper'];
        formlyConfigProvider.setType({
          name: 'custom-combobox',
          templateUrl: 'modules/huron/callRouter/formly-field-custom-combobox.tpl.html',
          wrapper: commonWrappers
        });
      });
})();
