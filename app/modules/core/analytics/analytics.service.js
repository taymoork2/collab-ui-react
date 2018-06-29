/* global analytics, mixpanel */

(function () {
  'use strict';

  module.exports = Analytics;

  /* @ngInject */
  function Analytics($document, $location, $q, $state, Authinfo, Config, MetricsService, Orgservice, TrialService, UrlConfig, UserListService) {
    var DiagnosticKey = require('../metrics').DiagnosticKey;
    var NO_EVENT_NAME = 'eventName not passed';

    var token = {
      PROD_KEY: {
        mixpanel: 'a64cd4bbec043ed6bf9d5cd31e4b001c',
        segment: '9J8CjaGsE2QyAeoLYzuYqpE5AR2Eux2D',
      },
      TEST_KEY: {
        mixpanel: '536df13b2664a85b06b0b6cf32721c24',
        segment: 'OP45JvNoDl6ec6rZ40SJMy4isSQYJmyC',
      },
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
      EDISCOVERY: {
        name: 'eDiscovery',
        eventNames: {
          INITIAL_SEARCH: 'eDiscovery: Search Button Clicked',
          GENERATE_REPORT: 'eDiscovery: Generate Report Button Clicked',
          SEARCH_SECTION: 'eDiscovery: Search Section Viewed',
          REPORTS_SECTION: 'eDiscovery: Report Viewed',
          SEARCH_ERROR: 'eDiscovery: Request Failed',
        },
        persistentProperties: null,
      },
      TRIAL: {
        name: 'Trial Flow',
        eventNames: {
          START_SETUP: 'Trial flow: Start Trial Setup',
          START_TRIAL: 'Trial flow: Start Trial',
        },
        persistentProperties: null,
      },
      PREMIUM: {
        name: 'Premium IT Pro Pack',
        eventNames: {
          BMMP_DISMISSAL: 'BMMP Banner dismissal',
          LEARN_MORE: 'Learn More option selected',
          PREMIUM_FILTER: 'Customer Overview Filtering',
          RESET_ACCESS: 'Reset Access',
        },
        persistentProperties: null,
      },
      PARTNER: {
        name: 'Partner',
        eventNames: {
          ASSIGN: 'Partner Admin Assigning',
          REMOVE: 'Partner Admin Removal',
          PATCH: 'Patch User Call',
          LAUNCH_CUSTOMER_PATCH_USERS: 'Partner: Launch Customer Patch Users',
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
          0: 'emailOnly',
          1: 'nameAndEmail',
        },
        saveResults: {
          SUCCESS: 'success',
          USER_ERROR: 'user_error',
          APP_ERROR: 'app_exception',
        },
      },
      HS_NAVIGATION: {
        name: 'Navigation inside Hybrid Services pages',
        eventNames: {
          VISIT_CLUSTER_LIST: 'Visit Hybrid Cluster List Page',
          VISIT_SERVICES_OVERVIEW: 'Visit Services Overview Page',
          VISIT_CONTEXT_LIST: 'Visit Hybrid Context Service Cluster List',
          VISIT_HDS_LIST: 'Visit Hybrid Data Security Service Cluster List',
          VISIT_HDS_SETTINGS: 'Visit Hybrid Data Security Service Settings',
          VISIT_CAL_EXC_LIST: 'Visit Hybrid Calendar (Exchange) Service Cluster List',
          VISIT_CAL_EXC_SETTINGS: 'Visit Hybrid Calendar (Exchange) Service Settings',
          VISIT_CAL_EXC_USER_LIST: 'Visit Hybrid Calendar (Exchange) Service User List',
          VISIT_IMP_LIST: 'Visit Hybrid Messaging Service Cluster List',
          VISIT_IMP_SETTINGS: 'Visit Hybrid Messaging Service Settings',
          VISIT_IMP_USER_LIST: 'Visit Hybrid Messaging Service User List',
          VISIT_CAL_O365_SETTINGS: 'Visit Hybrid Calendar (Office 365) Service Settings',
          VISIT_CAL_GOOG_SETTINGS: 'Visit Hybrid Calendar (Google) Service Settings',
          VISIT_CALL_LIST: 'Visit Hybrid Call Service Cluster List',
          VISIT_CALL_SETTINGS: 'Visit Hybrid Call Service Settings',
          VISIT_CALL_USER_LIST: 'Visit Hybrid Call Service User List',
          VISIT_MEDIA_LIST: 'Visit Webex Video Mesh Cluster List',
          VISIT_MEDIA_SETTINGS: 'Visit Webex Video Mesh Settings',
          VISIT_NODE_LIST_SETTINGS: 'Visit Hybrid Nodes List',
          OPEN_CONNECTOR_UPGRADE_MODAL: 'Open Connector Upgrade Modal',
          START_CONNECTOR_UPGRADE: 'Start Connector Upgrade',
        },
        persistentProperties: null,
      },
      CONTEXT: {
        name: 'Context Service operations',
        eventNames: {
          CONTEXT_CREATE_FIELD_SUCCESS: 'Field created',
          CONTEXT_CREATE_FIELD_FAILURE: 'Field creation failed',
          CONTEXT_CREATE_FIELDSET_SUCCESS: 'Fieldset created',
          CONTEXT_CREATE_FIELDSET_FAILURE: 'Fieldset creation failed',
          CONTEXT_UPDATE_FIELD_SUCCESS: 'Field updated',
          CONTEXT_UPDATE_FIELD_FAILURE: 'Field update failed',
          CONTEXT_UPDATE_FIELDSET_SUCCESS: 'Fieldset updated',
          CONTEXT_UPDATE_FIELDSET_FAILURE: 'Fieldset update failed',
          CONTEXT_DELETE_FIELD_SUCCESS: 'Field deleted',
          CONTEXT_DELETE_FIELD_FAILURE: 'Field deletion failed',
          CONTEXT_DELETE_FIELDSET_SUCCESS: 'Fieldset deleted',
          CONTEXT_DELETE_FIELDSET_FAILURE: 'Fieldset deletion failed',
        },
      },
      REPORTS: {
        name: 'Visit reports',
        eventNames: {
          CUST_SPARK_REPORT: 'Reports: Customer Spark Qlik report',
          CUST_WEBEX_REPORT: 'Reports: Customer WebEx Qlik report',
          PARTNER_SPARK_REPORT: 'Reports: Partner Spark Qlik report',
          CUST_MEETING_SITE_SELECTED: 'Customer Portal Analytics: Meeting - site selected',
        },
        persistentProperties: null,
      },
      SERVICE_SETUP: {
        name: 'Service Setup',
        eventNames: {
          NEXT: 'Service Setup: User clicked \'Next\' button',
          BACK: 'Service Setup: User clicked \'Back\' button',
          SUBSCRIPTION_SELECT: 'Service Setup: Subscription selected from dropdown',
          FORWARDED_TO_OVERVIEW: 'Service Setup: Forwarded to overview for provisioned subscription',
          REDIRECTED_INTO_ATLAS_FROM_OPC: 'Service Setup: Redirected into atlas from Order Processing Client',
          PARTNER_LAUNCH: 'Service Setup: Partner launches customer/own org from customers tab',
          PARTNER_SETUP_OWNORG: 'Service Setup: Partner Setting up ownorg',
          PARTNER_SETUP_CUSTOMER: 'Service Setup: Partner Setting up customer',
          CUSTOMER_SETUP: 'Service Setup: Customer logs into portal directly and is setting up',
          GET_STARTED: 'Service Setup: Clicked on Get Started at the start for Service Setup Wizard',
          MEETING_SETTINGS: 'Service Setup: Attempt to setup Meeting Settings',
          SKIPPED_MEETING_SETTINGS: 'Service Setup: Clicked on skip for Meeting Settings',
          TRIAL_EXISTING_SITES: 'Service Setup: Use existing site checkbox clicked',
          SEND_CUSTOMER_EMAIL: 'Service Setup: Send customer email checkbox changed',
          DO_NOT_PROVISION: 'Service Setup: Do Not Provision button clicked',
          VALIDATE_SITE_URL: 'Service Setup: Validate Site Url button clicked', // 11/27 algendel - not used?
          VALIDATE_TRANSFER_CODE: 'Service Setup: Transfer code validated', // 11/27 algendel - not used?
          CCASP_VALIDATION_FAILURE: 'Service Setup: CCASP audio partner validation succeeded',
          CCASP_VALIDATION_SUCCESS: 'Service Setup: CCASP audio partner validation succeeded',
          AUDIO_PARTNER_SELECTED: 'Service Setup: Audio partner selection made',
          DO_NOT_PROVISION_BUTTON_CLICK: 'Service Setup: The \'Do Not Provision\' button was clicked',
          PROVISION_CALL_SUCCESS: 'Service Setup: Call to provision succeeded',
          PROVISION_CALL_FAILURE: 'Service Setup: Call to provision failed',
          PROVISION_WITHOUT_MEETING_SETTINGS_SUCCESS: 'Service Setup: Provisioned without Meeting Settings setup',
          PROVISION_WITHOUT_MEETING_SETTINGS_FAILURE: 'Service Setup: Provision without Meeting Settings call failed',
          FINISH_BUTTON_CLICK: 'Service Setup: Finish button clicked',
        },
      },
      WEBEX_SITE_MANAGEMENT: {
        name: 'Webex Site Management',
        eventNames: {
          TRANSFER_SITE_ADDED: 'Transfer site was added to sites list',
          INVALID_TRANSFER_CODE: 'Transfer code/siteUrl combination invalid',
          TRANSFER_CODE_CALL_FAILED: 'Transfer code call failed',
          NEW_SITE_ADDED: 'A new site was added',
          DUPLICATE_WEBEX_SITE: 'WebEx Shallow validation: duplicate site',
          INVALID_WEBEX_SITE: 'WebEx Shallow validation: invalid site',
          REMOVE_SITE: 'Removed validated site',
          CLIENT_VERSION_RADIO: 'Client version radio selection made',
        },
      },
      VIRTUAL_ASSISTANT: {
        name: 'Virtual Assistant operations',
        eventNames: {
          CVA_OVERVIEW_PAGE: 'Customer VA Overview',
          CVA_DIALOGUE_PAGE: 'Customer VA Dialogue Integration',
          CVA_ACCESS_TOKEN_PAGE: 'Customer VA Client Access Token',
          CVA_NAME_PAGE: 'Customer VA Name',
          CVA_AVATAR_PAGE: 'Customer VA Avatar',
          CVA_SUMMARY_PAGE: 'Customer VA Summary',
          CVA_START_FINISH: 'Customer VA the entire wizard',
          CVA_CREATE_SUCCESS: 'Customer VA created',
          CVA_CREATE_FAILURE: 'Customer VA creation failed',
          CVA_DELETE_SUCCESS: 'Customer VA deleted',
          CVA_DELETE_FAILURE: 'Customer VA deletion failed',
          EVA_OVERVIEW_PAGE: 'Expert VA Overview',
          EVA_NAME_PAGE: 'Expert VA Name',
          EVA_EMAIL_PAGE: 'Expert VA Email',
          EVA_AVATAR_PAGE: 'Expert VA Avatar',
          EVA_DEFAULT_SPACE: 'Expert VA Default Space',
          EVA_CONFIGURATION_STEPS_PAGE: 'Expert VA Configuration Steps',
          EVA_SUMMARY_PAGE: 'Expert VA Summary',
          EVA_START_FINISH: 'Expert VA the entire wizard',
          EVA_CREATE_SUCCESS: 'Expert VA created',
          EVA_CREATE_FAILURE: 'Expert VA creation failed',
          EVA_DELETE_SUCCESS: 'Expert VA deleted',
          EVA_DELETE_FAILURE: 'Expert VA deletion failed',
        },
      },
      APPLE_BUSINESS_CHAT: {
        name: 'Apple Business Chat operations',
        eventNames: {
          ABC_DELETE_SUCCESS: 'ABC deleted',
          ABC_DELETE_FAILURE: 'ABC deletion failed',
          ABC_BUSINESS_ID_PAGE: 'ABC Business Id',
          ABC_NAME_PAGE: 'ABC Name',
          ABC_CVA_SELECTION_PAGE: 'ABC Customer Virtual Assistant Selection',
          ABC_STATUS_MESSAGE: 'ABC Status Message',
          ABC_SUMMARY_PAGE: 'ABC Summary',
          ABC_START_FINISH: 'ABC the entire wizard',
          ABC_CREATE_SUCCESS: 'ABC created',
          ABC_CREATE_FAILURE: 'ABC creation failed',
        },
      },
      ONLINE_ORDER: {
        name: 'Online Orders',
        eventNames: {
          FREEMIUM: 'Online: Downgrade to Freemium',
          VIEW_INVOICE: 'Online: View Invoice',
        },
      },
      DEVICE: {
        name: 'Device',
        eventNames: {
          PROXIMITY: 'wifi proximity',
        },
      },
      DEVICE_BULK: {
        name: 'Bulk device',
        eventNames: {
          BULK: 'bulk',
          COMPLETE: 'bulk complete',
          DELETE: 'bulk delete',
          DELETE_ASK: 'bulk delete ask',
          DELETE_FAKE: 'bulk delete fake',
          EXPORT: 'bulk export',
          EXPORT_ASK: 'bulk export ask',
          SELECT: 'bulk select',
          SELECT_ALL: 'bulk select all',
        },
      },
      DEVICE_SEARCH: {
        name: 'Devices search',
        eventNames: {
          PERFORM_SEARCH: 'CSDM dev search',
          SELECT_SUGGESTION: 'CSDM Suggestion',
          EXPAND_DEVICE: 'CSDM expand device',
        },
      },
      ORGANIZATION: {
        name: 'Organization',
        eventNames: {
          DELETE: 'Organization Delete',
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
      trackPremiumEvent: trackPremiumEvent,
      trackEdiscoverySteps: trackEdiscoverySteps,
      trackServiceSetupSteps: trackServiceSetupSteps,
      trackWebExMgmntSteps: trackWebExMgmntSteps,
      trackPartnerActions: trackPartnerActions,
      trackTrialSteps: trackTrialSteps,
      trackUserOnboarding: trackUserOnboarding,
      trackAddUsers: trackAddUsers,
      trackCsv: trackCsv,
      trackHybridServiceEvent: trackHybridServiceEvent,
      trackReportsEvent: trackReportsEvent,
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
          mixpanel.init(result.mixpanel, {
            api_host: UrlConfig.getMixpanelUrl(),
            persistence: 'localStorage', // default to localStorage, fallback to cookie
            cross_subdomain_cookie: false, // when cookies are needed, only use specific subdomain
          });

          if (!Config.isE2E() && _.isFunction(analytics.load)) {
            analytics.load(result.segment);
          }
        }
      });
    }

    /**
     * Determines if it's a Test Org or not.
     */
    function checkIfTestOrg() {
      var params = {
        basicInfo: true,
      };
      if (!isTestOrgPromise) {
        isTestOrgPromise = $q(function (resolve) {
          Orgservice.getOrg(function (response) {
            resolve(_.get(response, 'isTestOrg'));
          }, null, params);
        });
      }
      return isTestOrgPromise;
    }

    function _track(eventName, properties) {
      if (_.isFunction(analytics.track)) {
        analytics.track(eventName, properties);
      }
      mixpanel.track(eventName, properties);
    }

    /**
     *  Tracks the Event
     */
    function trackEvent(eventName, properties) {
      var prefix = 'cisco_';
      properties = properties || {};
      // prepending properties with cisco
      _.forEach(properties, function (value, key) {
        if (!_.startsWith(key, prefix)) {
          delete properties[key];
          properties[prefix + key] = value;
        }
      });

      _.set(properties, '$current_url', cleanUrl($location.absUrl()));
      _.set(properties, '$referrer', cleanUrl((_.get($document, '[0].referrer'))));

      _init()
        .then(function () {
          service._track(eventName, properties);
        })
        .catch(_.noop); // don't log error, legit reasons to fail
    }

    function cleanUrl(url) {
      var REDACTED = '***';
      var urlSearchAndReplacePairs = [
        {
          search: /\/search\/.*/,
          replace: '/search/' + REDACTED,
        },
      ];
      _.forEach(urlSearchAndReplacePairs, function (pair) {
        url = _.replace(url, pair.search, pair.replace);
      });
      return url;
    }

    /**
     * Premium IT Pro Pack Events
     */
    function trackPremiumEvent(eventName, location) {
      if (_.isEmpty(eventName) || !_.isString(eventName)) {
        return _logError('trackPremiumEvent', NO_EVENT_NAME);
      }

      var properties = {
        date: moment().format(),
        from: _.get($state, '$current.name'),
        orgId: Authinfo.getOrgId(),
        userId: Authinfo.getUserId(),
        userRole: Authinfo.getRoles(),
      };

      if (!_.isUndefined(location)) {
        properties.location = location;
      }

      return trackEvent(eventName, properties);
    }

    /**
      * Ediscovery Events
      */
    function trackEdiscoverySteps(eventName, searchProperties) {
      if (!_.isString(eventName) || eventName.length === 0) {
        return _logError('trackEdiscoverSteps', NO_EVENT_NAME);
      }

      var properties = {
        from: _.get($state, '$current.name'),
        trackingId: _.get(searchProperties, 'trackingId', 'N/A'),
        emailSelected: _.get(searchProperties, 'emailSelected', 'false'),
        spaceSelected: _.get(searchProperties, 'spaceSelected', 'false'),
        searchedWithKeyword: _.get(searchProperties, 'searchedWithKeyword', 'false'),
      };

      _getOrgData('EDISCOVERY').then(function (data) {
        _.extend(properties, data);
        delete properties.realOrgId;
      });

      return trackEvent(eventName, properties);
    }

    /**
     * IT Decoupling: New order Service Setup flow
     */
    function trackServiceSetupSteps(eventName, adminProperties) {
      if (!_.isString(eventName)) {
        return _logError('trackServiceSetupSteps', NO_EVENT_NAME);
      }
      var adminType = _getAdminType();

      var properties = {
        subscriptionId: _.get(adminProperties, 'subscriptionId', 'N/A'),
        userOrgId: Authinfo.getUserOrgId(),
        userId: Authinfo.getUserId(),
        loggedInUser: getLoggedInUser(),
        adminSettingUp: adminType,
      };
      _.assignIn(properties, adminProperties);

      return trackEvent(eventName, properties);
    }

    /**
     * WebEx Site Management: add/delete/redistribute liacenses
     */
    function trackWebExMgmntSteps(eventName, adminProperties) {
      if (!_.isString(eventName)) {
        return _logError('trackWebExMgmntSteps', NO_EVENT_NAME);
      }
      eventName = sections.WEBEX_SITE_MANAGEMENT.name + ': ' + eventName;
      var adminType = _getAdminType();

      var properties = {
        subscriptionId: _.get(adminProperties, 'subscriptionId', 'N/A'),
        loggedInUser: getLoggedInUser(),
        userId: Authinfo.getUserId(),
        adminSettingUp: adminType,
        userOrgId: Authinfo.getUserOrgId(),
      };
      _.assignIn(properties, adminProperties);
      //TODO: algendel 11/27/17 - once we have actual requirements for tracking, revisit for correctness and return trackEvent(eventName, properties);
    }

    /**
     * Trial Events
     */
    function trackTrialSteps(eventName, trialData, additionalPayload) {
      if (!eventName) {
        return _logError('trackTrialSteps', NO_EVENT_NAME);
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
        return _logError('trackPartnerActions', 'eventName, uuid or orgId not passed');
      }
      var properties = {
        uuid: UUID,
        orgId: orgId,
        section: sections.PARTNER.name,
      };
      return trackEvent(eventName, properties);
    }

    /**
    * Onboarding. First Time Wizard Events
    */
    function trackUserOnboarding(eventName, name, orgId, additionalData) {
      if (!eventName || !name || !orgId) {
        return _logError('trackUserOnboarding', 'eventName, uuid or orgId not passed');
      }

      var properties = {
        from: name,
        orgId: orgId,
        section: sections.USER_ONBOARDING.name,
      };

      if (eventName === sections.USER_ONBOARDING.eventNames.CMR_CHECKBOX) {
        if (!additionalData.licenseId) {
          return _logError('trackUserOnboarding', 'license id not passed');
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
        return _logError('trackAddUsers', NO_EVENT_NAME);
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
     * Hybrid Services
     */
    // function trackHybridServiceEvent(eventName, payload) {
    function trackHybridServiceEvent(eventName, payload) {
      if (!eventName) {
        return _logError('trackHybridServiceEvent', NO_EVENT_NAME);
      }

      var properties = _.extend({
        userId: Authinfo.getUserId(),
        orgId: Authinfo.getOrgId(),
      }, payload);
      return trackEvent(eventName, properties);
    }

    /**
     * Reports Event
     */
    function trackReportsEvent(eventName, payload) {
      if (!eventName) {
        return _logError('trackReportsEvent', NO_EVENT_NAME);
      }

      var properties = _.extend({
        userId: Authinfo.getUserId(),
        orgId: Authinfo.getOrgId(),
        type: Authinfo.isPartner(),
      }, payload);
      return trackEvent(eventName, properties);
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
        userId: Authinfo.getUserId(),
        orgId: Authinfo.getOrgId(),
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
        orgId: Authinfo.getOrgId(),
        domain: _getDomainFromEmail(Authinfo.getPrimaryEmail()),
        uuid: Authinfo.getUserId(),
        role: Authinfo.getRoles(),
        section: sections[sectionName].name,
      };
      var params = {
        basicInfo: true,
      };
      var promises = {
        listUsers: UserListService.listUsers(0, 1, null, null, _.noop),
        getOrg: Orgservice.getAdminOrgAsPromise(null, params).catch(function (err) {
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
      if (daysLeft < 0 || _.get(licenseList, 'length', 0) === 0) {
        return 'expired';
      }
      var isTrial = _.some(licenseList, function (license) {
        return license && license.isTrial;
      });
      return isTrial ? 'trial' : 'active';
    }

    function _getDomainFromEmail(email) {
      return email ? email.split('@')[1] || '' : '';
    }

    // TODO: Refactor this into Authinfo
    function getLoggedInUser() {
      if (_.includes(Authinfo.getUserName(), '@')) {
        return Authinfo.getUserName();
      } else if (_.includes(Authinfo.getPrimaryEmail(), '@')) {
        return Authinfo.getPrimaryEmail();
      } else if (_.includes(Authinfo.getCustomerAdminEmail(), '@')) {
        return Authinfo.getCustomerAdminEmail();
      }
    }

    function _getAdminType() {
      if ((Authinfo.isPartner() && !Authinfo.isCustomerLaunchedFromPartner()) || Authinfo.isPartnerSalesAdmin()) {
        return 'Partner';
      } else {
        return 'Customer';
      }
    }

    function _logError(method, msg) {
      MetricsService.trackDiagnosticMetric(DiagnosticKey.ANALYTICS_FAILURE, {
        method: method,
        message: msg,
      });
      return msg;
    }
  }
})();
