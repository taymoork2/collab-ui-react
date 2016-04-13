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
        element.prepend('<div class="read-only-banner">' + $translate.instant('readOnlyModal.banner') +
          '</div>');
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
