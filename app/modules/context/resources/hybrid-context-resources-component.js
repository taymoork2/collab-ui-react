require('./_resources.scss');

(function () {
  'use strict';

  var AdminAuthorizationStatus = require('modules/context/services/context-authorization-service').AdminAuthorizationStatus;

  angular.module('Context')
    .component('contextResourcesSubHeader', {
      controller: ContextResourcesSubHeaderCtrl,
      template: require('modules/context/resources/hybrid-context-resources-header.html'),
    });

  /* @ngInject */
  function ContextResourcesSubHeaderCtrl($state, ContextAdminAuthorizationService, $translate) {
    var vm = this;

    vm.disableAddResourceButton = true;
    vm.addResourceButtonTooltip = '';

    ContextAdminAuthorizationService.getAdminAuthorizationStatus()
      .then(function (value) {
        vm.disableAddResourceButton = (value !== AdminAuthorizationStatus.AUTHORIZED);

        if (vm.disableAddResourceButton) {
          switch (value) {
            case AdminAuthorizationStatus.UNAUTHORIZED:
              vm.addResourceButtonTooltip = $translate.instant('context.dictionary.resource.notAuthorized');
              break;
            case AdminAuthorizationStatus.UNKNOWN:
              vm.addResourceButtonTooltip = $translate.instant('context.dictionary.unknownAdminAuthorizationStatus');
              break;
            case AdminAuthorizationStatus.NEEDS_MIGRATION:
              vm.addResourceButtonTooltip = $translate.instant('context.dictionary.resource.needsMigration');
              break;
            default:
              break;
          }
        }
      });

    vm.addResourceModal = function () {
      $state.go('add-resource.context');
    };
  }
})();
