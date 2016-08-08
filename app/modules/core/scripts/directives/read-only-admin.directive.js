(function () {
  'use strict';

  /* @ngInject */
  function DisableIfReadOnlyAdmin(Authinfo) {

    function link(scope, element, attributes) {
      if (Authinfo.isReadOnlyAdmin()) {
        var eventHandler = attributes.disableIfReadOnlyAdmin;
        if (eventHandler) {
          scope[eventHandler] = angular.noop;
        }
        element.prop("disabled", true);
      }
    }

    return {
      restrict: 'A',
      link: link,
      priority: 100
    };

  }

  /* @ngInject */
  function HideIfReadOnlyAdmin(Authinfo) {

    function link(scope, element) {
      if (Authinfo.isReadOnlyAdmin()) {
        element.hide();
      }
    }

    return {
      restrict: 'A',
      link: link,
      priority: 100
    };

  }

  angular.module('Core').directive('disableIfReadOnlyAdmin', DisableIfReadOnlyAdmin);
  angular.module('Core').directive('hideIfReadOnlyAdmin', HideIfReadOnlyAdmin);
}());
