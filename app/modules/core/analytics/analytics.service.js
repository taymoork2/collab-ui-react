/* global mixpanel */

(function () {
  'use strict';

  angular
    .module('Core')
    .service('Analytics', Analytics);

  /* @ngInject */
  function Analytics($q, Config, Orgservice) {

    var eventNames = {
      START: 'start',
      NEXT: 'next',
      BACK: 'back',
      SKIP: 'skip',
      FINISH: 'finish',
      ASSIGN: 'assign',
      REMOVE: 'remove'
    };

    var service = {
      _init: _init,
      _track: _track,
      trackEvent: trackEvent,
      checkIfTestOrg: checkIfTestOrg,
      trackTrialSteps: trackTrialSteps,
      trackPartnerActions: trackPartnerActions,
      trackUserPatch: trackUserPatch,
      trackSelectedCheckbox: trackSelectedCheckbox,
      trackConvertUser: trackConvertUser,
      eventNames: eventNames
    };

    var token = {
      PROD_KEY: 'a64cd4bbec043ed6bf9d5cd31e4b001c',
      TEST_KEY: '536df13b2664a85b06b0b6cf32721c24'
    };

    var isTestOrg = null;
    var hasInit = false;
    var throwError = false;

    /* Trial Event Names */
    var START_TRIAL = 'Start Trial Button Click';
    var NEXT_BUTTON = 'Next Button Clicked';
    var BACK_BUTTON = 'Back Button Clicked';
    var SKIP_BUTTON = 'Skip Button Clicked';
    var FINISH_TRIAL = 'Finish Trial Setup';


    /* Partner Event Names */
    var ASSIGN_PARTNER = 'Partner Admin Assigning';
    var REMOVE_PARTNER = 'Partner Admin Removal';
    var PATCH_USER = 'patch user call';

    /* First Time Wizard Event Names */
    var CMR_CHECKBOX = 'CMR checkbox unselected';
    var CONVERT_USER = 'Convert User Search';

    return service;

    function _init() {
      return $q(function (resolve, reject) {
        if (hasInit) {
          return resolve();
        } else if (throwError) {
          return reject();
        }

        if (Config.isProd()) {
          resolve(token.PROD_KEY);
        } else {
          checkIfTestOrg().then(function () {
            if (isTestOrg) {
              resolve(token.TEST_KEY);
            } else {
              throwError = true;
              reject();
            }
          });
        }
      }).then(function (result) {
        hasInit = true;
        if (result) {
          mixpanel.init(result);
        }
      });
    }

    /**
     * Determines if it's a Test Org or not.
     */
    function checkIfTestOrg() {
      if (!isTestOrg) {
        isTestOrg = $q(function (resolve) {
          Orgservice.getOrg(function (response) {
            resolve(response.isTestOrg);
          });
        });
      }
      return isTestOrg;
    }

    function _track(eventName, properties) {
      mixpanel.track(eventName, properties || {});
    }

    /**
     *  Tracks the Event
     */
    function trackEvent(eventName, properties) {
      _init().then(function () {
        service._track(eventName, properties);
      });
    }

    /**
     * Trial Events
     */

    function trackTrialSteps(state, name, id) {
      if (!state || !name || !id) {
        $q.reject('state, name or id not passed');
      }

      var step = '';

      switch (state) {
        case eventNames.START:
          step = START_TRIAL;
          break;
        case eventNames.NEXT:
          step = NEXT_BUTTON;
          break;
        case eventNames.BACK:
          step = BACK_BUTTON;
          break;
        case eventNames.SKIP:
          step = SKIP_BUTTON;
          break;
        case eventNames.FINISH:
          step = FINISH_TRIAL;
          break;
      }

      trackEvent(step, {
        from: name,
        orgId: id
      });
    }

    /**
     * Partner Events
     */
    function trackPartnerActions(state, UUID, id) {
      if (!state || !UUID || !id) {
        $q.reject('state, uuid or id not passed');
      }

      switch (state) {
        case eventNames.ASSIGN:
          trackEvent(ASSIGN_PARTNER, {
            uuid: UUID,
            orgId: id
          });
          break;
        case eventNames.REMOVE:
          trackEvent(REMOVE_PARTNER, {
            uuid: UUID,
            orgId: id
          });
          break;
      }
    }

    function trackUserPatch(orgId, UUID) {
      if (!orgId || !UUID) {
        $q.reject('orgId or uuid not passed');
      }

      trackEvent(PATCH_USER, {
        by: orgId,
        uuid: UUID
      });
    }

    /**
     * First Time Wizard Events
     */
    function trackSelectedCheckbox(id) {
      if (!id) {
        $q.reject('id not passed');
      }

      trackEvent(CMR_CHECKBOX, {
        licenseId: id
      });
    }

    function trackConvertUser(name, id) {
      if (!name || !id) {
        $q.reject('name or id not passed');
      }

      trackEvent(CONVERT_USER, {
        from: name,
        orgId: id
      });
    }
  }

})();
