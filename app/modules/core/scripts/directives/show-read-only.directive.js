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
        var wrapperPaddingTop = parseInt(wrapper.css('padding-top'), 10);
        wrapper.css('padding-top', wrapperPaddingTop + 20 + 'px');
        element.prepend('<div class="read-only-banner">' + $translate.instant('readOnlyModal.banner') + '</div>');

        console.log('*** Creating MutationObserver ***');
        var observer = new MutationObserver(function () {
          var sidePanel = angular.element('div.side-panel');
          if (sidePanel.length == 1) {
            console.log('sidePanel', sidePanel);
            console.log('sidePanel.length', sidePanel.length);
            var sidePanelTop = parseInt(sidePanel.css('top'), 10);
            console.log('sidePanelTop: ', sidePanelTop);
            sidePanel.css('top', sidePanelTop + 20 + 'px');
          }
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
