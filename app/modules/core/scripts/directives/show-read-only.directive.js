require('./_show-read-only.scss');

(function () {
  'use strict';

  /* @ngInject */
  function ShowReadOnly(Authinfo, $translate, $window) {

    function link(scope, element) {
      if (Authinfo.isReadOnlyAdmin()) {
        var wrapper = angular.element('.wrapper');
        wrapper.css('padding-top', '6rem');
        element.prepend('<div class="read-only-banner">' + $translate.instant('readOnlyModal.banner') + '</div>');
        var observer = new $window.MutationObserver(function () {
          var sidePanel = angular.element('div.side-panel');
          sidePanel.addClass('side-panel-correction');
        });

        observer.observe($window.document.body, {
          childList: true,
          subtree: true,
        });

      }
    }

    return {
      restrict: 'A',
      link: link,
    };

  }

  angular.module('Core').directive('showReadOnly', ShowReadOnly);
}());
