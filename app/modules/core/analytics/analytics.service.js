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
      _buildTrialServicesArray: _buildTrialServicesArray,
      _buildTrialDevicesArray: _buildTrialDevicesArray,
      _getSelectedTrialDevices: _getSelectedTrialDevices,
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
    function trackEvent(eventName, properties) {
      var prefix = 'cisco_';
      properties = properties || {};
      //prepending properties with cisco
      _.each(properties, function (value, key) {
        if (key.indexOf(prefix) !== 0) {
          delete properties[key];
          properties[prefix + key] = value;
        }
      });
      return _init().then(function () {
        return service._track(eventName, properties);
      });
    }

    /**
     * Trial Events
     */
    function trackTrialSteps(eventName, trialData, additionalPayload) {
      if (!eventName) {
        return $q.reject('eventName not passed');
      }

      var properties = {
        from: _.get($state, '$current.name'),
        orgId: Authinfo.getOrgId(),
        section: sections.TRIAL.name,
      };
      if (trialData) {
        properties.servicesArray = _buildTrialServicesArray(trialData.trials);
        properties.duration = _.get(trialData, 'details.licenseDuration');
        properties.licenseQty = _.get(trialData, 'details.licenseCount');
        /* TODO: add this once we have a clear strategy
        if (properties.from === 'trialAdd.call' || properties.from === 'trialEdit.call') {
          properties.devicesArray = _buildTrialDevicesArray(trialData.trials);
        }*/
      }
      _.extend(properties, additionalPayload);
      return trackEvent(eventName, properties);
    }


    /**
     * Partner Events
     */
    function trackPartnerActions(eventName, orgId, UUID) {
      if (!eventName || !UUID || !orgId) {
        return $q.reject('eventName, uuid or orgId not passed');
      }
      var properties = {
        uuid: UUID,
        orgId: orgId,
        section: sections.PARTNER.name
      };
      return trackEvent(eventName, properties);
    }

    /**
    * Onboarding. First Time Wizard Events
    */

    function trackUserOnboarding(eventName, name, orgId, additionalData) {
      if (!eventName || !name || !orgId) {
        return $q.reject('eventName, uuid or orgId not passed');
      }

      var properties = {
        from: name,
        orgId: orgId,
        section: sections.USER_ONBOARDING.name,
      };

      if (eventName === sections.USER_ONBOARDING.eventNames.CMR_CHECKBOX) {
        if (!additionalData.licenseId) {
          $q.reject('license id not passed');
        } else {
          properties.licenseId = additionalData.licenseId;
        }
      }
      return trackEvent(eventName, properties);
    }


    function trackError(errorObj, cause) {
      trackEvent(eventNames.RUNTIME_ERROR, {
        message: _.get(errorObj, 'message'),
        stack: _.get(errorObj, 'stack'),
        cause: cause,
        userId: Authinfo.getUserId(),
        orgId: Authinfo.getOrgId(),
        state: _.get($state, '$current.name')
      });
    }

    /* Trial Helpers */

    function _buildTrialServicesArray(trialServices) {
      return _.chain(trialServices).filter({ enabled: true }).map('type').value();
    }

    function _buildTrialDevicesArray(trialServices) {
      var selectedPhones = _getSelectedTrialDevices(trialServices, 'callTrial', 'phones');
      var selectedRoomSystems = _getSelectedTrialDevices(trialServices, 'roomSystemTrial', 'roomSystems');
      return _.concat(selectedPhones, selectedRoomSystems);
    }

    function _getSelectedTrialDevices(trialServices, trialType, deviceType) {
      var enabledProp = trialType + '.enabled';
      var devicesPath = 'details.' + deviceType;

      if (_.get(trialServices, enabledProp)) {
        return _.chain(trialServices[trialType])
        .get(devicesPath, [])
        .filter(function (device) { return device.quantity > 0; })
        .map(function (device) { return { model: device.model, qty: device.quantity }; })
        .value();
      } else {
        return [];
      }
    }


  }

})();
