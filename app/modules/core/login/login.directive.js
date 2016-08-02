(function () {
  'use strict';

  function LoginDirective() {
    var directive = {
      restrict: 'E',
      controller: require('./loginCtrl'),
      controllerAs: 'login',
      templateUrl: 'modules/core/login/login.tpl.html',
    };
    return directive;
  }

  module.exports = LoginDirective;

}());
