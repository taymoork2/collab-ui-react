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
        title: '@title',
        additionalBtnClick: '&onAdditionalbtn',
        additionalBtn: '=additionalBtn'
      },
      link: link,
      controller: DetailsBodyController,
      controllerAs: 'crDetailsBody'
    };

    return directive;

    function link(scope, element, attrs, ctrls) {
      scope.detailsBodyForm = ctrls[0];
    }
  }

  DetailsBodyController.$inject = ['$state', '$rootScope'];

  function DetailsBodyController($state, $rootScope, $scope) {
    var vm = this;
    vm.closeDetails = closeDetails;

    function closeDetails() {
      $state.go('users.list');
      $rootScope.$broadcast('USER_LIST_UPDATED');
    }
  }
})();
