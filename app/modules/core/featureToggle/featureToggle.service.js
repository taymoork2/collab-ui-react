(function () {
  'use strict';

  module.exports = angular.module('core.featuretoggle', [
    require('modules/core/config/config'),
    require('modules/core/scripts/services/authinfo'),
    require('modules/core/scripts/services/org.service'),
    require('modules/huron/telephony/telephonyConfig'),
  ])
    .factory('HuronCustomerFeatureToggleService', HuronCustomerFeatureToggleService)
    .factory('HuronUserFeatureToggleService', HuronUserFeatureToggleService)
    .service('FeatureToggleService', FeatureToggleService)
    .name;

  /* @ngInject */
  function FeatureToggleService($http, $q, $resource, $state, Authinfo, HuronCustomerFeatureToggleService, HuronUserFeatureToggleService, UrlConfig, Orgservice) {
    var features = {
      dirSync: 'atlas-dir-sync',
      atlasBrandingWordingChange: 'atlas-branding-wording-change',
      atlasCareTrials: 'atlas-care-trials',
      atlasContextServiceTrials: 'atlas-context-service-trials',
      atlasCsvEnhancement: 'atlas-csv-enhancement',
      atlasCustomerListUpdate: 'atlas-customer-list-update',
      atlasDarling: 'atlas-darling',
      atlasDataRetentionSettings: 'atlas-data-retention-settings',
      atlasEmailStatus: 'atlas-email-status',
      atlasHelpDeskExt: 'atlas-helpdesk-extended-information',
      atlasHybridServicesResourceList: 'atlas-hybrid-services-resource-list',
      atlasMediaServiceMetrics: 'atlas-media-service-metrics',
      atlasMediaServiceOnboarding: 'atlas-media-service-onboarding',
      atlasNewRoomSystems: 'atlas-new-roomSystems',
      atlasNurturingEmails: 'atlas-nurturing-emails',
      atlasPinSettings: 'atlas-pin-settings',
      atlasPstnTfn: 'atlas-pstn-tfn',
      atlasReadOnlyAdmin: 'atlas-read-only-admin',
      atlasSettingsPage: 'atlas-settings-page',
      atlasSipUriDomain: 'atlas-sip-uri-domain',
      atlasSipUriDomainEnterprise: 'atlas-sip-uri-domain-enterprise',
      atlasWebexTrials: 'atlas-webex-trials',
      androidAddGuestRelease: 'android-add-guest-release',
      androidDirectUpload: 'android-direct-upload',
      androidImportantFilter: 'android-important-filter',
      androidKmsMessagingApiV2: 'android-kms-messaging-api-v2',
      androidMentions: 'android-mentions',
      androidMessageSearch: 'android-message-search',
      androidModernTokenRefresh: 'android-modern-token-refresh',
      androidTeams: 'android-teams',
      atMentions: 'at-mentions',
      audioPairing: 'audio-pairing',
      bridgeMaxConvParticipants: 'bridge-max-conv-participants',
      callMultiDevice: 'call-multi-device',
      calliopeDiscovery: 'calliope-discovery',
      callParkService: 'call-park-service',
      clientRingbackV2: 'client-ringback-v2',
      console: 'console',
      deleteContent: 'delete-content',
      disableCacheForFeatures: 'disableCacheForFeatures',
      enforceSparkContentEncryption: 'enforce-spark-content-encryption',
      extensionLength: 'huron-extension-length',
      featureToggleRules: 'feature-toggle-rules',
      feedbackViaEmail: 'feedback-via-email',
      filterBadges: 'filter-badges',
      flagMsg: 'flag-msg',
      geoHintEnabled: 'geo-hint-enabled',
      huronAACallQueue: 'huronAACallQueue',
      huronAASubmenu: 'huron-aa-submenu',
      huronAATimeZone: 'huron-aa-timezone',
      huronMultipleCalls: 'huron-multiple-calls',
      huronClassOfService: 'COS',
      huronInternationalDialingTrialOverride: 'huronInternationalDialingTrialOverride',
      huronKEM: 'huronKEM',
      iosActionBar: 'ios-action-bar',
      iosAecType: 'ios-aec-type',
      iosCameraview: 'ios-cameraview',
      iosCoBranding: 'ios-co-branding',
      iosFilterBadges: 'ios-filter-badges',
      iosFiltering: 'ios-filtering',
      iosImportantFilter: 'ios-important-filter',
      iosImportantFilter2: 'ios-important-filter2',
      iosKmsMessagingApi3: 'ios-kms-messaging-api3',
      iosKmsMessagingApi4: 'ios-kms-messaging-api4',
      iosLocalNotification2: 'ios-local-notification2',
      iosLocusUsingResource: 'ios-locus-using-resource',
      iosMentions: 'ios-mentions',
      iosMentionsFilter: 'ios-mentions-filter',
      iosSearchService: 'ios-search-service',
      iosSearchService2: 'ios-search-service2',
      iosTeams: 'ios-teams',
      iosTeams2: 'ios-teams2',
      joinhubCreateARoom: 'joinhub-create-a-room',
      l2sipAllowSipForward: 'l2sip-allow-sip-forward',
      l2sipAllowSipTransfer: 'l2sip-allow-sip-transfer',
      locusMaxRosterParticipants: 'locus-max-roster-participants',
      manyCalls: 'many-calls',
      mediaEnableFilmstripOsx: 'media-enable-filmstrip-osx',
      mediaEnableFilmstripWin: 'media-enable-filmstrip-win',
      mediaEnableMultistreamCrown: 'media-enable-multistream-crown',
      mediaEnableSimulcast: 'media-enable-simulcast',
      mediaMariFecAudioEnabled: 'media-mari-fec-audio-enabled',
      mediaMariFecEnabled: 'media-mari-fec-enabled',
      mediaMariFecVideoEnabled: 'media-mari-fec-video-enabled',
      mediaMariRateAdaptation: 'media-mari-rate-adaptation',
      mentionsNotif: 'mentions-notif',
      mentionsTab: 'mentions-tab',
      mercurySingletonConnection: 'mercury-singleton-connection',
      mercury51: 'mercury5.1',
      modifyConvoActivityLimits: 'modify-convo-activity-limits',
      multigetCi: 'multiget-ci',
      muteByDefault: 'mute-by-default',
      newMessageBanner: 'new-message-banner',
      newMessageBannerAndroid: 'new-message-banner-android',
      newMessagesIndicator: 'new-messages-indicator',
      osxImportantFilter: 'osx-important-filter',
      persistenceForFeatures: 'persistenceForFeatures',
      relevantRooms: 'relevant-rooms',
      sanitizeactivityOptimization: 'sanitizeactivity-optimization',
      searchRemote: 'search-remote',
      searchTab: 'search-tab',
      sendStickies: 'send-stickies',
      sendStickies2: 'send-stickies2',
      sparkJsSdkEcdh3: 'spark-js-sdk-ecdh-3',
      squrls: 'squrls',
      stickiesSend: 'stickies.send',
      titleEncryption: 'title-encryption',
      uploadCallLogs: 'upload-call-logs',
      userPresence: 'user-presence',
      uwpImportantFilter: 'uwp-important-filter',
      webGuestCall: 'web-guest-call',
      webHuronCalls: 'web-huron-calls',
      webManualPairing: 'web-manual-pairing',
      webMentionsTab: 'web-mentions-tab',
      webRoapCalls: 'web-roap-calls',
      webTeams: 'web-teams',
      winGuestCall: 'win-guest-call',
      winHuronCalls: 'win-huron-calls',
      winImporantFilter: 'win-important-filter',
      winMentionsList: 'win-mentions-list',
      winMentionsTab: 'win-mentions-tab',
      winProximityDeviceSelection: 'win-proximity-device-selection',
      winTeams: 'win-teams',
      zeroTouchMeeting: 'zero-touch-meeting',
      locationSharing: 'location-sharing',
      ceAllowNolockdown: 'ce-allow-nolockdown',
      webexCSV: 'webex-CSV',
      enableCrashLogs: 'csdm-enable-crash-logs',
      csdmPlaces: 'csdm-places',
      optionalvmdid: 'optional-vm-did'
    };

    var toggles = {};

    var orgResource = $resource(UrlConfig.getWdmUrl() + '/features/rules/:id', {
      id: '@id'
    }, {
      get: {
        method: 'GET',
        cache: true
      },
      refresh: {
        method: 'GET',
        cache: false
      }
    });

    var userResource = $resource(UrlConfig.getFeatureToggleUrl() + '/locus/api/v1/features/users/:id', {
      id: '@id'
    }, {
      get: {
        method: 'GET',
        cache: true
      }
    });

    var dirSyncConfigurationResource = $resource(UrlConfig.getAdminServiceUrl() + 'organization/:customerId/dirsync', {
      customerId: '@customerId'
    });

    var service = {
      getUrl: getUrl,
      getFeatureForUser: getFeatureForUser,
      getFeaturesForUser: getFeaturesForUser,
      getFeatureForOrg: getFeatureForOrg,
      getFeaturesForOrg: getFeaturesForOrg,
      setFeatureToggles: setFeatureToggles,
      generateFeatureToggleRule: generateFeatureToggleRule,
      stateSupportsFeature: stateSupportsFeature,
      supports: supports,
      supportsDirSync: supportsDirSync,
      features: features
    };

    init();

    return service;

    function init() {
      return _.reduce(features, function (status, feature, key) {
        status[key + 'GetStatus'] = function () {
          return supports(features[key]);
        };
        return status;
      }, service);
    }

    function getFeatureForUser(id, feature) {
      return getFeature(true, id, feature);
    }

    function getFeaturesForUser(id) {
      return getFeatures(true, id);
    }

    function getFeatureForOrg(id, feature) {
      return getFeature(false, id, feature);
    }

    function getFeaturesForOrg(id, clearCache) {
      return getFeatures(false, id, clearCache);
    }

    function getUrl(isUser) {
      return isUser ? userResource : orgResource;
    }

    function getFeatures(isUser, id, clearCache) {
      if (!id) {
        return $q.reject('id is undefined');
      }
      clearCache = clearCache || false;
      var info = {
        id: id
      };
      var url = getUrl(isUser);

      var response;
      if (!isUser && clearCache) {
        response = url.refresh(info);
      } else {
        response = url.get(info);
      }

      return response.$promise.then(function (response) {
        if (isUser) {
          _.forEach(response.developer, fixVal);
          _.forEach(response.entitlement, fixVal);
          _.forEach(response.user, fixVal);
        } else {
          _.forEach(response.featureToggles, fixVal);
        }
        return response;
      });
    }

    function getHuronToggle(isUser, id, feature) {
      if (Authinfo.isSquaredUC()) {
        if (isUser) {
          return HuronUserFeatureToggleService.get({
            userId: id,
            featureName: feature
          }).$promise.then(function (data) {
            toggles[feature] = data.val;
            return data.val;
          }).catch(function () {
            return false;
          });
        } else {
          return HuronCustomerFeatureToggleService.get({
            customerId: id,
            featureName: feature
          }).$promise.then(function (data) {
            toggles[feature] = data.val;
            return data.val;
          }).catch(function () {
            return false;
          });
        }
      } else {
        return $q.when(false);
      }
    }

    function getFeature(isUser, id, feature) {
      if (!feature) {
        return $q.reject('feature is undefined');
      }

      var atlasToggle = getFeatures(isUser, id).then(function (features) {
        // find the toggle, then get the val, default to false
        return _.get(_.find(features.developer, {
          key: feature
        }), 'val', false);
      }).catch(function () {
        return false;
      });

      return atlasToggle.then(function (toggle) {
        if (!toggle) {
          return getHuronToggle(isUser, id, feature);
        } else {
          return toggle;
        }
      });
    }

    function stateSupportsFeature(feature) {
      return supports(feature).then(shouldFeatureAllowState);
    }

    function shouldFeatureAllowState(isSupported) {
      if (!isSupported) {
        if (currentlyInState()) {
          return $q.reject('Requested feature is not supported by requested state');
        } else {
          $state.go('login');
        }
      }
      return isSupported;
    }

    function currentlyInState() {
      return !!$state.$current.name;
    }

    function supports(feature) {
      return $q(function (resolve) {
        if (feature === features.dirSync) {
          supportsDirSync().then(function (enabled) {
            resolve(enabled);
          });
        } else if (angular.isDefined(toggles[feature])) {
          resolve(toggles[feature]);
        } else {
          $http.get(UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/me', {
            cache: true,
          }).then(function (response) {
            return getFeatureForUser(_.get(response, 'data.id'), feature)
              .then(function (result) {
                if (!result) {
                  return getHuronToggle(false, Authinfo.getOrgId(), feature);
                } else {
                  return result;
                }
              }).then(function (toggleValue) {
                toggles[feature] = toggleValue;
                resolve(toggleValue);
              });
          }).catch(function () {
            return false;
          });
        }
      });
    }

    function supportsDirSync() {
      return dirSyncConfigurationResource.get({
        customerId: Authinfo.getOrgId()
      }).$promise.then(function (response) {
        return response.serviceMode === 'ENABLED';
      }).catch(function (response) {
        Orgservice.getOrgCacheOption(function (data) {
          if (data.success) {
            return data.dirsyncEnabled;
          } else {
            return $q.reject(response);
          }
        }, null, {
          cache: false
        });
      });
    }

    function setFeatureToggles(isUser, listOfFeatureToggleRules) {
      if (isUser) {
        return $q.reject('User level toggles are not changeable in the web app');
      }

      var usingId = isUser ? undefined : '';

      return getUrl(isUser).save({
        id: usingId
      }, listOfFeatureToggleRules).$promise;
    }

    /**
     * Feature toggle rules will set feature toggles for organizations
     * @param  {uuid} orgId
     * @param  {string} key   one of the FeatureToggleService.features
     * @param  {any} val      false to turn off, otherwise any value
     * @return {object}       the object that the backend expects
     */
    function generateFeatureToggleRule(orgId, key, val) {
      return {
        val: val,
        key: key,
        orgId: orgId,
        group: 'ORG',
        mutable: true,
      };
    }

    /**
     * convenience fn to change val:['true'|'false'] to val:[true|false]
     * @param  {object} feature feature from service
     * @return {object}         feature with swap
     */
    function fixVal(feature) {
      var val = feature.val;
      if (val === 'true') {
        feature.val = true;
      } else if (val === 'false') {
        feature.val = false;
      }
    }
  }

  /* @ngInject */
  function HuronUserFeatureToggleService($resource, HuronConfig) {
    return $resource(HuronConfig.getMinervaUrl() + '/features/users/:userId/developer/:featureName', {
      userId: '@userId',
      featureName: '@featureName'
    }, {
      get: {
        method: 'GET',
        cache: true
      }
    });
  }

  /* @ngInject */
  function HuronCustomerFeatureToggleService($resource, HuronConfig) {
    return $resource(HuronConfig.getMinervaUrl() + '/features/customers/:customerId/developer/:featureName', {
      customerId: '@customerId',
      featureName: '@featureName'
    }, {
      get: {
        method: 'GET',
        cache: true
      }
    });
  }
})();
