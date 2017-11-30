require('./_show-read-only.scss');

(function () {
  'use strict';

  /* @ngInject */
  function ShowReadOnly(Authinfo, $translate) {
    function link(scope, element) {
      if (Authinfo.isReadOnlyAdmin() || Authinfo.isPartnerReadOnlyAdmin()) {
        var IS_READ_ONLY_ADMIN = 'is-read-only-admin';
        var wrapper = angular.element('.wrapper');
        wrapper.css('padding-top', '6rem');
        element.prepend('<div class="read-only-banner">' + $translate.instant('readOnlyModal.banner') + '</div>');
        var body = angular.element('body');
        body.addClass(IS_READ_ONLY_ADMIN);

        element.on('$destroy', function () {
          body.removeClass(IS_READ_ONLY_ADMIN);
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
