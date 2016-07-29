/* global mixpanel */

(function () {
  'use strict';

  angular
    .module('Core')
    .service('Analytics', Analytics);

  /* @ngInject */
  function Analytics($q, Config, Orgservice) {

    var service = {
      _init: _init,
      _track: _track,
      trackEvent: trackEvent,
      checkIfTestOrg: checkIfTestOrg,
      trackTrialSteps: trackTrialSteps,
      trackAssignPartner: trackAssignPartner,
      trackRemovePartner: trackRemovePartner,
      trackUserPatch: trackUserPatch,
      trackSelectedCheckbox: trackSelectedCheckbox,
      trackConvertUser: trackConvertUser
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
        isTestOrg = $q(function (resolve, reject) {
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

    function trackTrialSteps(state, name) {
      if (!state || !name) {
        return;
      }

      var step = '';

      switch (state) {
      case 'start':
        step = START_TRIAL;
        break;
      case 'next':
        step = NEXT_BUTTON;
        break;
      case 'back':
        step = BACK_BUTTON;
        break;
      }

      trackEvent(step, {
        from: name
      });
    }

    /**
     * Partner Events
     */
    function trackAssignPartner(UUID) {
      if (!UUID) {
        return;
      }

      trackEvent(ASSIGN_PARTNER, {
        uuid: UUID
      });
    }

    function trackRemovePartner(UUID) {
      if (!UUID) {
        return;
      }

      trackEvent(REMOVE_PARTNER, {
        uuid: UUID
      });
    }

    function trackUserPatch(orgId) {
      if (!orgId) {
        return;
      }

      trackEvent(PATCH_USER, {
        by: orgId
      });
    }

    /**
     * First Time Wizard Events
     */
    function trackSelectedCheckbox(id) {
      if (!id) {
        return;
      }

      trackEvent(CMR_CHECKBOX, {
        licenseId: id
      });
    }

    function trackConvertUser(name) {
      if (!name) {
        return;
      }

      trackEvent(CONVERT_USER, {
        from: name
      });
    }
  }

})();
