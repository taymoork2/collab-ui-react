/* global mixpanel */

(function () {
  'use strict';

  angular
    .module('Core')
    .service('Mixpanel', Mixpanel);

  /* @ngInject */
  function Mixpanel($q, Config, Orgservice) {

    var service = {
      env: undefined,
      _init: _init,
      _track: _track,
      trackEvent: trackEvent
    };

    var internals = {
      prodKey: '536df13b2664a85b06b0b6cf32721c24',
      testKey: 'a64cd4bbec043ed6bf9d5cd31e4b001c',
      ENV_PROD: 'Prod',
      ENV_TEST: 'Test',
      ENV_DO_NOT_TRACK: 'do-not-track'
    };

    var isTestOrgPromise = null;

    return service;

    function _init() {
      return $q(function (resolve, reject) {
        if (service.env === internals.ENV_DO_NOT_TRACK) {
          return reject();
        } else if (service.env) {
          return resolve(service.env);
        }

        if (Config.isProd()) {
          service.env = internals.ENV_PROD;
          resolve({
            env: service.env,
            key: internals.prodKey
          });
        } else {
          getTestOrg().then(function (isTestOrg) {
            if (isTestOrg) {
              service.env = internals.ENV_TEST;
              resolve({
                env: service.env,
                key: internals.testKey
              });
            } else {
              service.env = internals.ENV_DO_NOT_TRACK;
              reject();
            }
          });
        }
      }).then(function (result) {
        if (result.key) {
          mixpanel.init(result.key);
        }

        return service.env;
      });
    }

    function _track(eventName, properties) {
      mixpanel.track(eventName, properties || {});
    }

    /**
     *  Saves mixpanel data in production
     */
    function trackEvent(eventName, properties) {
      _init().then(function () {
        service._track(eventName, properties);
      });
    }

    function getTestOrg() {
      if (!isTestOrgPromise) {
        isTestOrgPromise = $q(function (resolve, reject) {
          Orgservice.getOrg(function (response) {
            resolve(response.isTestOrg);
          });
        });
      }
      return isTestOrgPromise;
    }
  }

})();
