(function () {
  'use strict';

  var modalShown = false;

  /* @ngInject */
  function ReadOnlyModalController($modalInstance, Authinfo) {
    var vm = this;

    vm.orgName = Authinfo.getOrgName();

    vm.ok = function () {
      $modalInstance.close();
    };

    vm.learnMore = function () {
      $modalInstance.close();
    };
  }

  /* @ngInject */
  function ShowReadOnly($modal, Authinfo, $translate) {

    function link(scope, element, attributes) {
      if (Authinfo.isReadOnlyAdmin()) {
        var wrapper = angular.element('.wrapper');
        wrapper.css('padding-top', '6rem');
        element.prepend('<div class="read-only-banner">' + $translate.instant('readOnlyModal.banner') + '</div>');
        var observer = new MutationObserver(function () {
          var sidePanel = angular.element('div.side-panel');
          sidePanel.addClass('side-panel-correction');
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true
        });

      }
    }

    function Ctrl() {
      if (Authinfo.isReadOnlyAdmin()) {
        var vm = this;
        if (!modalShown) {
          modalShown = true;
          vm.modal = $modal.open({
            size: 'sm',
            controller: ReadOnlyModalController,
            controllerAs: 'readOnlyCtrl',
            templateUrl: 'modules/core/scripts/directives/views/read-only-modal.html'
          });
        }
      }
    }

    return {
      restrict: 'A',
      link: link,
      controller: Ctrl
    };

  }

  angular.module('Core').directive('showReadOnly', ShowReadOnly);
}());
