(function () {
  'use strict';

  angular
    .module('uc.didadd')
    .directive('ucDidAdd', ucDidAdd);

  function ucDidAdd() {
    var directive = {
      restrict: 'EA',
      templateUrl: 'modules/core/users/userAdd/add-users.html',
      controller: 'UsersCtrl',
      controllerAs: 'vm'
    };

    return directive;
  }

})();
