(function () {
  'use strict';

  angular.module('DigitalRiver')
    .controller('drLoginForwardController', drLoginForwardController);

  /* @ngInject */
  function drLoginForwardController($window, $cookies, $translate, $state, $stateParams, $location, $log, DigitalRiverService, Userservice, Storage, SessionStorage, Auth) {

    var email = $location.search().email;
    var redirect = $location.search().redirect;
    var referrer = $location.search().referrer;
    var incomingParam = $location.search().params;
    var param = {};
    if (angular.isDefined(incomingParam)) {
      // convert from Base64 to ascii
      var decParam = atob(incomingParam);
      var paramArray = decParam.split('|');
      if (paramArray.length > 0) {
        for (var i = 0; i < paramArray.length; i++) {
          var token = paramArray[i].split(':');
          if (token[0] === 'uuid') {
            param.uuid = token[1];
          } else if (token[0] === 'orderId') {
            param.orderId = token[1];
          }
        }
      }
    } else {
      param = $state.params.params;
    }

    if (!angular.isDefined(redirect)) {
      redirect = $state.params.redirect;
    }
    if (!angular.isDefined(email)) {
      email = $state.params.email;
    }
    if (!angular.isDefined(referrer)) {
      referrer = $state.params.referrer;
    }

    // user exists so forward to the login page.
    // specify where we want to be directed after logging in
    var params = {};
    params.email = email;
    params.referrer = referrer;
    params.redirect = redirect;
    params.params = param;
    SessionStorage.put('storedState', 'drLoginReturn');
    SessionStorage.putObject('storedParams', params);

    if (angular.isDefined(param.uuid)) {
      // if we're given a UUID we need to set the user's CI to active
      DigitalRiverService.activateUser(param.uuid)
        .then(function (result) {
          $cookies.atlasDrCookie = _.get(result, 'data.data.token');
          // remove our client token since we'll get a user token after logging in.
          Storage.remove('accessToken');
          Auth.redirectToLogin(email);
        })
        .catch(function (error) {
          $log.error(_.get(error, 'data.message', $translate.instant('digitalRiver.validation.unexpectedError')));
        });
    } else {
      // remove our client token since we'll get a user token after logging in.
      Storage.remove('accessToken');
      Auth.redirectToLogin(email);
    }
  }
})();
