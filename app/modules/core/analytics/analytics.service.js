/* global mixpanel */

(function () {
  'use strict';

  module.exports = Analytics;

  /* @ngInject */
  function Analytics($q, $state, Authinfo, Config, CryptoJS, Orgservice, TrialService, UserListService) {

    var token = {
      PROD_KEY: 'a64cd4bbec043ed6bf9d5cd31e4b001c',
      TEST_KEY: '536df13b2664a85b06b0b6cf32721c24',
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
      DONE: 'Done',
      SAVE: 'Save',
      ENTER_SCREEN: 'Entered Screen',
      VALIDATION_ERROR: 'Validation Error',
      RUNTIME_ERROR: 'Runtime Error',
    };

    var sections = {
      TRIAL: {
        name: 'Trial Flow',
        eventNames: {
          START_SETUP: 'Trial flow: Start Trial Setup',
          START_TRIAL: 'Trial flow: Start Trial',
        },
        persistentProperties: null,
      },
      PARTNER: {
        name: 'Partner',
        eventNames: {
          ASSIGN: 'Partner Admin Assigning',
          REMOVE: 'Partner Admin Removal',
          PATCH: 'Patch User Call',
        },
        persistentProperties: null,
      },
      USER_ONBOARDING: {
        name: 'User Onboarding',
        eventNames: {
          CMR_CHECKBOX: 'CMR Checkbox Unselected',
          CONVERT_USER: 'Convert User Search',
        },
        persistentProperties: null,
      },
      ADD_USERS: {
        name: 'Add Users',
        eventNames: {
          FINISH: 'Add Users: Finish',
          MANUAL_EMAIL: 'Add Users: Manual Email Entry',
          CSV_UPLOAD: 'Add Users: CSV Upload',
          CSV_ERROR_EXPORT: 'Add Users: CSV Error Export',
          EXPORT_USER_LIST: 'Add Users: Export User List',
          INSTALL_CONNECTOR: 'Add Users: Install Connector',
          DIRECTORY_SYNC: 'Add Users: Directory Sync',
          SYNC_REFRESH: 'Add Users: Sync Refresh',
          SYNC_ERROR: 'Add Users: Sync Error',
          GO_BACK_FIX: 'Add Users: Go Back Fix Errors',
        },
        persistentProperties: null,
        uploadMethods: {
          MANUAL: 'manual',
          CSV: 'csv',
          SYNC: 'sync',
        },
        manualMethods: {
          '0': 'emailOnly',
          '1': 'nameAndEmail',
        },
        saveResults: {
          SUCCESS: 'success',
          USER_ERROR: 'user_error',
          APP_ERROR: 'app_exeption',
        },
      },
    };

    var service = {
      _init: _init,
      _track: _track,
      _buildTrialServicesArray: _buildTrialServicesArray,
      _buildTrialDevicesArray: _buildTrialDevicesArray,
      _getSelectedTrialDevices: _getSelectedTrialDevices,
      _getOrgData: _getOrgData,
      _getOrgStatus: _getOrgStatus,
      _getDomainFromEmail: _getDomainFromEmail,
      checkIfTestOrg: checkIfTestOrg,
      eventNames: eventNames,
      sections: sections,
      trackError: trackError,
      trackEvent: trackEvent,
      trackPartnerActions: trackPartnerActions,
      trackTrialSteps: trackTrialSteps,
      trackUserOnboarding: trackUserOnboarding,
      trackAddUsers: trackAddUsers,
      trackCsv: trackCsv,
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
      };
      // populate static properties
      _getOrgData('TRIAL').then(function (data) {
        _.extend(properties, data);
        delete properties.realOrgId;
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
      });
    }


    /**
     * Partner Events
     */
    function trackPartnerActions(eventName, orgId, UUID) {
      if (!eventName || !UUID || !orgId) {
        return $q.reject('eventName, uuid or orgId not passed');
      }
      var properties = {
        uuid: _hashSha256(UUID),
        orgId: _hashSha256(orgId),
        section: sections.PARTNER.name,
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
        orgId: _hashSha256(orgId),
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


    /**
    * Add User Events
    */
    function trackAddUsers(eventName, uploadMethod, additionalPayload) {
      if (!eventName) {
        return $q.reject('eventName not passed');
      }
      var properties = {
        from: _.get($state, '$current.name'),
      };

      // populate static properties
      _getOrgData('ADD_USERS').then(function (data) {
        _.extend(properties, data);
        delete properties.realOrgId;
        //if changing upload method -- set.
        if (uploadMethod) {
          properties.uploadMethod = uploadMethod;
          sections.ADD_USERS.persistentProperties.uploadMethod = uploadMethod;
        }
        _.extend(properties, additionalPayload);
        return trackEvent(eventName, properties);
      });
    }

    function trackCsv(eventName) {
      if (eventName === sections.ADD_USERS.eventNames.CSV_ERROR_EXPORT) {
        return trackAddUsers(sections.ADD_USERS.eventNames.CSV_ERROR_EXPORT);
      }
    }


    /**
    * General Error Tracking
    */

    function trackError(errorObj, cause) {
      var message = _.get(errorObj, 'message');
      var stack = _.get(errorObj, 'stack');
      var error;
      if (!message && !stack) {
        error = _.isPlainObject(errorObj) ? JSON.stringify(errorObj) : String(errorObj);
      }
      trackEvent(eventNames.RUNTIME_ERROR, {
        message: message,
        stack: stack,
        error: error,
        cause: cause,
        userId: _hashSha256(Authinfo.getUserId()),
        orgId: _hashSha256(Authinfo.getOrgId()),
        domain: _getDomainFromEmail(Authinfo.getPrimaryEmail()),
        state: _.get($state, '$current.name'),
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

    /* General Helpers */
    function _getOrgData(sectionName) {
      if (sections[sectionName].persistentProperties && sections[sectionName].persistentProperties.realOrgId === Authinfo.getOrgId()) {
        return $q.resolve(sections[sectionName].persistentProperties);
      }
      var licenses = Authinfo.getLicenses();
      sections[sectionName].persistentProperties = {
        licenses: _.map(licenses, 'licenseType'),
        realOrgId: Authinfo.getOrgId(),
        orgId: _hashSha256(Authinfo.getOrgId()),
        domain: _getDomainFromEmail(Authinfo.getPrimaryEmail()),
        uuid: _hashSha256(Authinfo.getUserId()),
        role: Authinfo.getRoles(),
        section: sections[sectionName].name,
      };
      var promises = {
        listUsers: UserListService.listUsers(0, 1, null, null, _.noop),
        getOrg: Orgservice.getAdminOrgAsPromise().catch(function (err) {
          return err;
        }),
        trialDaysLeft: TrialService.getDaysLeftForCurrentUser(),
      };
      return $q.all(promises).then(function (data) {
        sections[sectionName].persistentProperties.userCountPrior = _.get(data.listUsers, 'data.totalResults');
        sections[sectionName].persistentProperties.isPartner = _.get(data.getOrg, 'data.isPartner');
        sections[sectionName].persistentProperties.isTestOrg = _.get(data.getOrg, 'data.isTestOrg');
        sections[sectionName].persistentProperties.orgStatus = _getOrgStatus(data.trialDaysLeft, licenses);
        return sections[sectionName].persistentProperties;
      });
    }

    function _getOrgStatus(daysLeft, licenseList) {
      if (daysLeft <= 0 || _.get(licenseList, 'length', 0) === 0) {
        return 'expired';
      }
      var isTrial = _.some(licenseList, function (license) {
        return license && license.isTrial;

      });
      return isTrial ? 'trial' : 'active';
    }

    function _hashSha256(id) {
      if (!id) {
        return null;
      }
      return CryptoJS.SHA256(id).toString(CryptoJS.enc.Base64);
    }

    function _getDomainFromEmail(email) {
      return email ? email.split('@')[1] || '' : '';
    }
  }

})();
