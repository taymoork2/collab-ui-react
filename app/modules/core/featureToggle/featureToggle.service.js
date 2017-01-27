(function () {
  'use strict';

  module.exports = FeatureToggleService;

  /* @ngInject */
  function FeatureToggleService($http, $q, $resource, $rootScope, $state, Authinfo, HuronConfig, UrlConfig, Orgservice) {
    var features = {
      requireAcceptTos: 'atlas-tos-required',
      dirSync: 'atlas-dir-sync',
      atlasCareTrials: 'atlas-care-trials',
      atlasCareCallbackTrials: 'atlas-care-callback-trials',
      atlasCareInboundTrials: 'atlas-care-inbound-trials',
      atlasContextServiceTrials: 'atlas-context-service-trials',
      atlasDarling: 'atlas-darling',
      atlasDataRetentionSettings: 'atlas-data-retention-settings',
      atlasDevicesAdvancedSettings: 'atlas-devices-advanced-settings',
      atlasDeviceExport: 'atlas-device-export',
      atlasEdiscovery: 'atlas-ediscovery',
      atlasEmailStatus: 'atlas-email-status',
      atlasHelpDeskExt: 'atlas-helpdesk-extended-information',
      atlasHelpDeskOrderSearch: 'atlas-helpdesk-order-search',
      atlasHybridServicesResourceList: 'atlas-hybrid-services-resource-list',
      atlasMediaServiceMetrics: 'atlas-media-service-metrics',
      atlasMediaServiceMetricsMilestoneOne: 'atlas-media-service-metrics-milestone-one',
      atlasMediaServicePhaseTwo: 'atlas-media-service-phase-two',
      atlasNewCiDataModel: 'atlas-new-ci-data-model',
      atlasNewRoomSystems: 'atlas-new-roomSystems',
      atlasNewUserExport: 'atlas-new-user-export',
      atlasNurturingEmails: 'atlas-nurturing-emails',
      atlasPinSettings: 'atlas-pin-settings',
      atlasPMRonM2: 'atlas-pmr-on-m2',
      atlasReadOnlyAdmin: 'atlas-read-only-admin',
      atlasReportsUpdate: 'atlas-reports-update',
      atlasComplianceRole: 'atlas-compliance-role',
      atlasSipUriDomain: 'atlas-sip-uri-domain',
      atlasSipUriDomainEnterprise: 'atlas-sip-uri-domain-enterprise',
      atlasSharedMeetings: 'atlas-shared-meetings',
      atlasSharedMeetingsReports: 'atlas-shared-meetings-reports',
      atlasTrialsShipDevices: 'atlasTrialsShipDevices',
      atlasDeviceUsageReportV2: 'atlas-device-usage-report-v2',
      atlasStartTrialForPaid: 'atlas-start-trial-for-paid',
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
      huronCallPickup: 'huronCallPickup',
      calsvcDetectCmrLoc: 'calsvc_detect_cmr_loc',
      calsvcWebexMeetingRegistries: 'calsvc_webex_meeting_registries',
      calsvcShowPreferredSiteName: 'calsvc-show-preferred-sitename',
      calsvcOneButtonToPushInterval: 'calsvc-OneButtonToPush-interval',
      clientRingbackV2: 'client-ringback-v2',
      console: 'console',
      deleteContent: 'delete-content',
      disableCacheForFeatures: 'disableCacheForFeatures',
      enforceSparkContentEncryption: 'enforce-spark-content-encryption',
      featureToggleRules: 'feature-toggle-rules',
      feedbackViaEmail: 'feedback-via-email',
      filterBadges: 'filter-badges',
      flagMsg: 'flag-msg',
      fmcCommandDispatch: 'fmc-command-dispatch',
      geoHintEnabled: 'geo-hint-enabled',
      huronAACallQueue: 'huronAACallQueue',
      huronAAMediaUpload: 'huron-aa-mediaupload',
      huronAACallerInput: 'huron-aa-callerinput',
      huronAAClioMedia: 'huron-aa-cliomedia',
      huronClassOfService: 'COS',
      huronInternationalDialingTrialOverride: 'huronInternationalDialingTrialOverride',
      huronPagingGroup: 'huronPagingGroup',
      huronNetworkLocale: 'huron-l10n-network-locale',
      huronUserLocale: 'huron-l10n-user-locale',
      huronUserLocale2: 'huron-l10n-user-locale-2',
      huronDateTimeEnable: 'huronDateTimeEnable',
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
      multiGeoEnable: 'multi-geo-enable',
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
      csdmATA: 'csdm-ata',
      csdmHybridCall: 'csdm-hybrid-call',
      atlasF237ResourceGroups: 'atlas-f237-resource-group',
      atlasHybridVoicemail: 'atlas-hybrid-voicemail',
      gemServicesTab: 'gem-services-tab',
      gemCCA: 'gem-cloud-connected-audio',
      atlasHybridDataSecurity: 'atlas-data-security',
      atlasHerculesGoogleCalendar: 'atlas-hercules-google-calendar',
      avrilVmEnable: 'avril-vm-enable',
      avrilVoicemaill1249: 'avril-voicemail-l1249',
      cloudberryPersonalMode: 'ce-enable-personal-mode'
    };

    var toggles = {};

    // returns huron feature toggle value for the given user or user's org
    var huronUserResource;

    // returns huron feature toggle value for the given customer; must be full admin or partner admin for the customer
    var huronCustomerResource;

    var orgResource = $resource(UrlConfig.getFeatureUrl() + '/features/rules/:id', {
      id: '@id'
    },
      {
        get: {
          method: 'GET',
          cache: true
        },
        refresh: {
          method: 'GET',
          cache: false
        }
      });

    var userResource = $resource(UrlConfig.getFeatureUrl() + '/features/users/:id', {
      id: '@id'
    },
      {
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
      setHuronUserResource(HuronConfig.getMinervaUrl());
      setHuronCustomerResource(HuronConfig.getMinervaUrl());
      // setup listener
      $rootScope.$on('COMPASS_BASE_DOMAIN_CHANGED', function () {
        setHuronUserResource(HuronConfig.getMinervaUrl());
        setHuronCustomerResource(HuronConfig.getMinervaUrl());
      });
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

    function getHuronToggle(feature) {
      if (Authinfo.isSquaredUC()) {
        if (Authinfo.isCustomerLaunchedFromPartner()) {
          return getHuronToggleForCustomer(Authinfo.getOrgId(), feature);
        }

        return getHuronToggleForUser(Authinfo.getUserId(), feature);
      }

      return $q.resolve(false);
    }

    function getHuronToggleForUser(userId, feature) {
      return huronUserResource.get({
        userId: userId,
        featureName: feature
      }).$promise.then(function (data) {
        toggles[feature] = data.val;
        return data.val;
      }).catch(function () {
        return false;
      });
    }


    function getHuronToggleForCustomer(customerId, feature) {
      return huronCustomerResource.get({
        customerId: customerId,
        featureName: feature
      }).$promise.then(function (data) {
        toggles[feature] = data.val;
        return data.val;
      }).catch(function () {
        return false;
      });
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
          return getHuronToggle(feature);
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
        } else if (!_.isUndefined(toggles[feature])) {
          resolve(toggles[feature]);
        } else {
          $http.get(UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/me', {
            cache: true,
          }).then(function (response) {
            return getFeatureForUser(_.get(response, 'data.id'), feature)
              .then(function (result) {
                if (!result) {
                  return getHuronToggle(feature);
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
        }, null,
          {
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

    function setHuronUserResource() {
      huronUserResource = $resource(HuronConfig.getMinervaUrl() + '/features/users/:userId/developer/:featureName', {
        userId: '@userId',
        featureName: '@featureName'
      },
        {
          get: {
            method: 'GET',
            cache: true
          }
        });
    }

    function setHuronCustomerResource() {
      huronCustomerResource = $resource(HuronConfig.getMinervaUrl() + '/features/customers/:customerId/developer/:featureName', {
        customerId: '@customerId',
        featureName: '@featureName'
      },
        {
          get: {
            method: 'GET',
            cache: true
          }
        });
    }

  }

})();
