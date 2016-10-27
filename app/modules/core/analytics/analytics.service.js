/* global mixpanel */

(function () {
  'use strict';

  module.exports = Analytics;

  /* @ngInject */
  function Analytics($q, $state, Config, Orgservice, Authinfo) {

    var token = {
      PROD_KEY: 'a64cd4bbec043ed6bf9d5cd31e4b001c',
      TEST_KEY: '536df13b2664a85b06b0b6cf32721c24'
    };

    var isTestOrgPromise = null;
    var hasInit = false;
    var throwError = false;

    var eventNames = {
      START: 'Start',
      NEXT: 'Next',
      BACK: 'Back',
      SKIP: 'Skip',
      CANCEL: 'Cancel',
      CANCEL_MODAL: 'Modal Closed by \'x\'',
      FINISH: 'Finish',
      YES: 'Yes Selected',
      NO: 'No Selected',
      ENTER_SCREEN: 'Entered Screen',
      VALIDATION_ERROR: 'Validation Error',
      RUNTIME_ERROR: 'Runtime Error'
    };

    var sections = {
      TRIAL: {
        name: 'Trial Flow',
        eventNames: {
          START_SETUP: 'Start Trial Setup',
          START_TRIAL: 'Start Trial'
        }
      },
      PARTNER: {
        name: 'Partner',
        eventNames: {
          ASSIGN: 'Partner Admin Assigning',
          REMOVE: 'Partner Admin Removal',
          PATCH: 'Patch User Call'
        }
      },
      USER_ONBOARDING: {
        name: 'User Onboarding',
        eventNames: {
          CMR_CHECKBOX: 'CMR Checkbox Unselected',
          CONVERT_USER: 'Convert User Search'
        }
      }
    };


    var service = {
      _init: _init,
      _track: _track,
      checkIfTestOrg: checkIfTestOrg,
      eventNames: eventNames,
      sections: sections,
      trackError: trackError,
      trackEvent: trackEvent,
      trackPartnerActions: trackPartnerActions,
      trackTrialSteps: trackTrialSteps,
      trackUserOnboarding: trackUserOnboarding
    };

    return service;

    function _init() {
      return $q(function (resolve, reject) {
        if (hasInit) {
          return resolve();
        } else if (throwError) {
          return reject();
        }

        if (Config.isProd() && !Config.forceProdForE2E()) {
          resolve(token.PROD_KEY);
        } else {
          checkIfTestOrg().then(function (isTestOrg) {
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
      if (!isTestOrgPromise) {
        isTestOrgPromise = $q(function (resolve) {
          Orgservice.getOrg(function (response) {
            resolve(_.get(response, 'isTestOrg'));
          });
        });
      }
      return isTestOrgPromise;
    }

    function _track(eventName, properties) {
      mixpanel.track(eventName, properties);
    }

    /**
     *  Tracks the Event
     */
    function trackEvent(sectionName, eventName, properties) {
      properties = properties || {};
      properties.section = sectionName;
      return _init().then(function () {
        return service._track(eventName, properties);
      });
    }

    /**
     * Trial Events
     */
    function trackTrialSteps(eventName, fromState, orgId, trialData, additionalPayload) {
      if (!eventName || !fromState || !orgId) {
        return $q.reject('eventName, fromState or id not passed');
      }

      var event = sections.TRIAL.name + ':  ' + eventName;
      var properties = {
        from: fromState,
        orgId: orgId,
      };

      if (trialData) {
        properties.servicesArray = _buildTrialDataArray(trialData.trials);
        properties.duration = _.get(trialData, 'details.licenseDuration');
        properties.licenseQty = _.get(trialData, 'details.licenseCount');
      }
      _.extend(properties, additionalPayload);
      return trackEvent(sections.TRIAL.name, event, properties);
    }


    /**
     * Partner Events
     */
    function trackPartnerActions(state, orgId, UUID) {
      if (!state || !UUID || !orgId) {
        return $q.reject('state, uuid or orgId not passed');
      }
      state = sections.PARTNER.name + ': ' + state;
      var properties = {
        uuid: UUID,
        orgId: orgId
      };
      return trackEvent(sections.PARTNER.name, state, properties);
    }

    /**
    * Onboarding. First Time Wizard Events
    */

    function trackUserOnboarding(state, name, orgId, additionalData) {
      if (!state || !name || !orgId) {
        return $q.reject('state, uuid or orgId not passed');
      }

      var properties = {
        from: name,
        orgId: orgId
      };

      if (state === sections.USER_ONBOARDING.eventNames.CMR_CHECKBOX) {
        if (!additionalData.licenseId) {
          $q.reject('license id not passed');
        } else {
          properties.licenseId = additionalData.licenseId;
        }
      }
      state = sections.USER_ONBOARDING.name + ': ' + state;
      return trackEvent(sections.USER_ONBOARDING.name, state, properties);
    }


    /* trial */

    function _buildTrialDataArray(trialServices) {
      return _.chain(trialServices).filter({ enabled: true }).map('type').value();
    }

    function trackError(errorObj, cause) {
      trackEvent(undefined, eventNames.RUNTIME_ERROR, {
        message: _.get(errorObj, 'message'),
        stack: _.get(errorObj, 'stack'),
        cause: cause,
        userId: Authinfo.getUserId(),
        orgId: Authinfo.getOrgId(),
        state: _.get($state, '$current.name')
      });
    }
  }

})();
