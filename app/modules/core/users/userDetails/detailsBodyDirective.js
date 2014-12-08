(function () {
  'use strict';

  angular
    .module('Core')
    .directive('crDetailsBody', crDetailsBody);

  function crDetailsBody() {
    var directive = {
      restrict: 'EA',
      transclude: true,
      templateUrl: 'modules/core/users/userDetails/detailsBody.tpl.html',
      require: ['^?form'],
      scope: {
        save: '&onSave',
        close: '&close',
        title: '@title'
      },
      link: link,
      controller: DetailsBodyController,
      controllerAs: 'vm'
    };

    return directive;

    function link(scope, element, attrs, ctrls) {
      scope.detailsBodyForm = ctrls[0];
    }
  }

  DetailsBodyController.$inject = ['$state'];

  function DetailsBodyController($state) {
    var vm = this;
    vm.closeDetails = closeDetails;

    function closeDetails() {
      $state.go('users.list');
    }
  }
})();
