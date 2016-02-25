(function () {
  'use strict';

  angular.module('Core')
    .factory('HuronCustomerFeatureToggleService', HuronCustomerFeatureToggleService)
    .factory('HuronUserFeatureToggleService', HuronUserFeatureToggleService)
    .service('FeatureToggleService', FeatureToggleService);

  /* @ngInject */
  function FeatureToggleService($resource, $q, Config, Authinfo, Orgservice, Userservice, HuronCustomerFeatureToggleService, HuronUserFeatureToggleService) {
    var features = {
      pstnSetup: 'huron-pstn-setup',
      csvUpload: 'csvUpload',
      dirSync: 'dirSync',
      atlasCloudberryTrials: 'atlas-cloudberry-trials',
      atlasStormBranding: 'atlas-2015-storm-launch',
      atlasSipUriDomain: 'atlas-sip-uri-domain',
      atlasSipUriDomainEnterprise: 'atlas-sip-uri-domain-enterprise',
      atlasWebexTrials: 'atlas-webex-trials',
      atlasDeviceTrials: 'atlas-device-trials',
      atlasReportTrials: 'atlas-report-trials',
      atlasTrialConversion: 'atlas-trial-conversion',
      huronHuntGroup: 'huronHuntGroup',
      huronAutoAttendant: 'huronAutoAttendant',
      huronClassOfService: 'COS',
      huronInternationalDialingTrialOverride: 'huronInternationalDialingTrialOverride',
      csdmHuron: 'csdm-huron',
      androidAddGuestRelease: 'android-add-guest-release',
      androidCallsTab: 'android-calls-tab',
      androidDirectUpload: 'android-direct-upload',
      androidKmsMessagingApiV2: 'android-kms-messaging-api-v2',
      androidMentions: 'android-mentions',
      androidMessageSearch: 'android-message-search',
      androidModernTokenRefresh: 'android-modern-token-refresh',
      androidOutboundDialing: 'android-outbound-dialing',
      androidTeams: 'android-teams',
      androidUltrasoundProximity: 'android-ultrasound-proximity',
      androidUltrasoundProximityR1: 'android-ultrasound-proximity-r1',
      atMentions: 'at-mentions',
      audioPairing: 'audio-pairing',
      bridgeMaxConvParticipants: 'bridge-max-conv-participants',
      callMultiDevice: 'call-multi-device',
      calliopeDiscovery: 'calliope-discovery',
      callsTab: 'calls-tab',
      clientRingbackV2: 'client-ringback-v2',
      console: 'console',
      deleteContent: 'delete-content',
      dialOut: 'dial-out',
      disableCacheForFeatures: 'disableCacheForFeatures',
      domainManagement: 'atlas-domain-management',
      enforceSparkContentEncryption: 'enforce-spark-content-encryption',
      featureToggleRules: 'feature-toggle-rules',
      feedbackViaEmail: 'feedback-via-email',
      filterBadges: 'filter-badges',
      flagMsg: 'flag-msg',
      geoHintEnabled: 'geo-hint-enabled',
      iosActionBar: 'ios-action-bar',
      iosAecType: 'ios-aec-type',
      iosCallsTab: 'ios-calls-tab',
      iosCameraview: 'ios-cameraview',
      iosCoBranding: 'ios-co-branding',
      iosFilterBadges: 'ios-filter-badges',
      iosFiltering: 'ios-filtering',
      iosImportantFilter: 'ios-important-filter',
      iosKmsMessagingApi3: 'ios-kms-messaging-api3',
      iosKmsMessagingApi4: 'ios-kms-messaging-api4',
      iosLocalNotification2: 'ios-local-notification2',
      iosMentions: 'ios-mentions',
      iosMentionsFilter: 'ios-mentions-filter',
      iosOutboundDialing: 'ios-outbound-dialing',
      iosSearchService: 'ios-search-service',
      iosSearchService2: 'ios-search-service2',
      iosTeams: 'ios-teams',
      iosTeams2: 'ios-teams2',
      iosUltrasoundProximity: 'ios-ultrasound-proximity',
      iosUltrasoundProximityR1: 'ios-ultrasound-proximity-r1',
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
      webGuestCall: 'web-guest-call',
      webHuronCalls: 'web-huron-calls',
      webManualPairing: 'web-manual-pairing',
      webMentionsTab: 'web-mentions-tab',
      webOutboundDialing: 'web-outbound-dialing',
      webRoapCalls: 'web-roap-calls',
      webTeams: 'web-teams',
      winGuestCall: 'win-guest-call',
      winHuronCalls: 'win-huron-calls',
      winMentionsList: 'win-mentions-list',
      winMentionsTab: 'win-mentions-tab',
      winOutboundDialing: 'win-outbound-dialing',
      winProximityDeviceSelection: 'win-proximity-device-selection',
      winTeams: 'win-teams',
      zeroTouchMeeting: 'zero-touch-meeting',
      locationSharing: 'location-sharing',
      ceAllowNolockdown: 'ce-allow-nolockdown',
      webexCSV: 'webex-CSV',
      huronCallTrials: 'huron-call-trials'
    };

    var service = {
      getUrl: getUrl,
      getFeatureForUser: getFeatureForUser,
      getFeaturesForUser: getFeaturesForUser,
      getFeatureForOrg: getFeatureForOrg,
      getFeaturesForOrg: getFeaturesForOrg,
      setFeatureToggles: setFeatureToggles,
      generateFeatureToggleRule: generateFeatureToggleRule,
      supports: supports,
      supportsPstnSetup: supportsPstnSetup,
      supportsCsvUpload: supportsCsvUpload,
      supportsDirSync: supportsDirSync,
      features: features,
    };

    var toggles = {};

    var orgResource = $resource(Config.getWdmUrl() + '/features/rules/:id', {
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

    var userResource = $resource(Config.getFeatureToggleUrl() + '/locus/api/v1/features/users/:id', {
      id: '@id'
    }, {
      get: {
        method: 'GET',
        cache: true
      }
    });

    return service;

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
          }).catch(function (err) {
            return false;
          });
        } else {
          return HuronCustomerFeatureToggleService.get({
            customerId: id,
            featureName: feature
          }).$promise.then(function (data) {
            toggles[feature] = data.val;
            return data.val;
          }).catch(function (err) {
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
      }).catch(function (err) {
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

    function supports(feature) {
      return $q(function (resolve, reject) {
        if (feature === features.csvUpload) {
          // Block all orgs in prod with exception in the white list
          var whiteList = [
            '01e89ad5-72a3-4379-963a-4a35fa9e1917'
          ];
          var orgInWhiteList = _.find(whiteList, function (o) {
            return o === Authinfo.getOrgId();
          });
          if (Config.isProd() && !orgInWhiteList) {
            resolve(false);
          } else {
            resolve(true);
          }
        } else if (feature === features.dirSync) {
          supportsDirSync().then(function (enabled) {
            resolve(enabled);
          });
        } else if (angular.isDefined(toggles[feature])) {
          resolve(toggles[feature]);
        } else {
          Userservice.getUser('me', function (data, status) {
            getFeatureForUser(data.id, feature)
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
          });
        }
      });
    }

    //TODO temporary
    function supportsPstnSetup() {
      return supports(features.pstnSetup);
    }

    function supportsCsvUpload() {
      return supports(features.csvUpload);
    }

    function supportsDirSync() {
      var deferred = $q.defer();
      Orgservice.getOrgCacheOption(function (data, status) {
        if (data.success) {
          deferred.resolve(data.dirsyncEnabled);
        } else {
          deferred.reject(status);
        }
      }, null, {
        cache: true
      });
      return deferred.promise;
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
