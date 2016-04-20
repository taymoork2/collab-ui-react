(function () {
  'use strict';

  angular.module('DigitalRiver')
    .controller('drLoginReturnController', drLoginReturnController);

  /* @ngInject */
  function drLoginReturnController($state, Storage) {

    var params = $state.params;
    // store the user token so we can use it later
    var token = Storage.get('accessToken');
    Storage.put('userToken', token);

    if (angular.isDefined(params)) {
      if (angular.isDefined(params.redirect)) {
        $state.go(params.redirect, params);
      }
    }

  }
})();
