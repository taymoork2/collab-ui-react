(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('ServiceSetup', ServiceSetup);

  /* @ngInject */
  function ServiceSetup($filter, $q, $translate, Authinfo, AvrilSiteService, AvrilSiteUpdateService, CeSiteService, CustomerCommonService, CustomerCosRestrictionServiceV2, DateFormatService, ExternalNumberPool, FeatureToggleService, InternalNumberRangeService, SiteCountryService, SiteLanguageService, SiteService, TimeZoneService, VoicemailService, VoicemailTimezoneService) {
    return {
      internalNumberRanges: [],
      sites: [],
      externalNumberPool: [],

      createSite: function (site) {
        return SiteService.save({
          customerId: Authinfo.getOrgId()
        }, site).$promise;
      },

      listSites: function () {
        return SiteService.query({
          customerId: Authinfo.getOrgId()
        }, angular.bind(this, function (sites) {
          this.sites = sites;
        })).$promise;
      },

      getSite: function (siteUuid) {
        return SiteService.get({
          customerId: Authinfo.getOrgId(),
          siteId: siteUuid
        }).$promise;
      },

      getAvrilSite: function (siteUuid) {
        return AvrilSiteUpdateService.get({
          customerId: Authinfo.getOrgId(),
          siteId: siteUuid
        }).$promise;
      },

      updateSite: function (siteUuid, site) {
        return SiteService.update({
          customerId: Authinfo.getOrgId(),
          siteId: siteUuid
        }, site).$promise;
      },

      updateAvrilSite: function (siteUuid, features) {
        return AvrilSiteUpdateService.update({
          customerId: Authinfo.getOrgId(),
          siteId: siteUuid
        }, features).$promise;
      },

      createAvrilSite: function (siteUuid, siteStrDigit, code, lang, timezone, extLength, voicemailPilotNumber) {
        return AvrilSiteService.save({
          customerId: Authinfo.getOrgId(),
          guid: siteUuid,
          siteCode: code,
          siteSteeringDigit: siteStrDigit,
          language: lang,
          timeZone: timezone,
          extensionLength: extLength,
          pilotNumber: voicemailPilotNumber
        }).$promise;
      },

      saveAutoAttendantSite: function (site) {
        return CeSiteService.save({
          customerId: Authinfo.getOrgId()
        }, site).$promise;
      },

      loadExternalNumberPool: function (pattern) {
        var extNumPool = [];
        return ExternalNumberPool.getExternalNumbers(
          Authinfo.getOrgId(),
          pattern,
          ExternalNumberPool.UNASSIGNED_NUMBERS,
          ExternalNumberPool.FIXED_LINE_OR_MOBILE
        ).then(angular.bind(this, function (extPool) {
          _.forEach(extPool, function (extNum) {
            extNumPool.push({
              uuid: extNum.uuid,
              pattern: extNum.pattern
            });
          });
          this.externalNumberPool = extNumPool;
        }));
      },

      listVoicemailTimezone: function () {
        return VoicemailTimezoneService.query({
          query: '(alias startswith ' + Authinfo.getOrgId() + ')',
          customerId: Authinfo.getOrgId()
        }).$promise;
      },

      updateVoicemailTimezone: function (timeZone, objectId) {
        return VoicemailTimezoneService.update({
          customerId: Authinfo.getOrgId(),
          objectId: objectId
        }, {
          timeZoneName: timeZone
        }).$promise;
      },

      updateVoicemailPostalcode: function (postalCode, objectId) {
        return VoicemailTimezoneService.update({
          customerId: Authinfo.getOrgId(),
          objectId: objectId
        }, {
          postalCode: postalCode
        }).$promise;
      },

      updateVoicemailUserTemplate: function (payload, objectId) {
        return VoicemailTimezoneService.update({
          customerId: Authinfo.getOrgId(),
          objectId: objectId
        }, payload).$promise;
      },

      getVoicemailPilotNumber: function () {
        return VoicemailService.get({
          customerId: Authinfo.getOrgId()
        }).$promise;
      },

      updateCustomer: function (customer) {
        return CustomerCommonService.update({
          customerId: Authinfo.getOrgId()
        }, customer).$promise;
      },

      createInternalNumberRange: function (internalNumberRange) {
        if (_.isUndefined(internalNumberRange.uuid)) {
          internalNumberRange.name = internalNumberRange.description = internalNumberRange.beginNumber + ' - ' + internalNumberRange.endNumber;
          internalNumberRange.patternUsage = "Device";
          return InternalNumberRangeService.save({
            customerId: Authinfo.getOrgId()
          }, internalNumberRange, function (data, headers) {
            internalNumberRange.uuid = headers('location').split("/").pop();
          }).$promise;
        } else {
          return $q.resolve();
        }
      },

      updateInternalNumberRange: function (internalNumberRange) {
        if (!_.isUndefined(internalNumberRange.uuid)) {
          internalNumberRange.name = internalNumberRange.description = internalNumberRange.beginNumber + ' - ' + internalNumberRange.endNumber;
          internalNumberRange.patternUsage = "Device";
          return InternalNumberRangeService.save({
            customerId: Authinfo.getOrgId(),
            internalNumberRangeId: internalNumberRange.uuid
          }, internalNumberRange, function (data, headers) {
            internalNumberRange.uuid = headers('location').split("/").pop();
          }).$promise;
        } else {
          return $q.resolve();
        }
      },

      deleteInternalNumberRange: function (internalNumberRange) {
        return InternalNumberRangeService.delete({
          customerId: Authinfo.getOrgId(),
          internalNumberRangeId: internalNumberRange.uuid
        }).$promise;
      },

      listInternalNumberRanges: function () {
        return InternalNumberRangeService.query({
          customerId: Authinfo.getOrgId()
        }, angular.bind(this, function (internalNumberRanges) {
          this.internalNumberRanges = internalNumberRanges;
        })).$promise;
      },

      getDateFormats: function () {
        return DateFormatService.query().$promise;
      },

      getTimeZones: function () {
        return TimeZoneService.query().$promise;
      },

      getTranslatedTimeZones: function (timeZones) {
        var localizedTimeZones = _.map(timeZones, function (timeZone) {
          return _.extend(timeZone, {
            label: $translate.instant('timeZones.' + timeZone.id)
          });
        });
        return localizedTimeZones;
      },

      getSiteLanguages: function () {
        return SiteLanguageService.query().$promise.then(function (languages) {
          return FeatureToggleService.supports(
              FeatureToggleService.features.huronUserLocale2
            ).then(function (isHuronUserLocale2Enabled) {
              if (!isHuronUserLocale2Enabled) {
                languages = _.filter(languages, function (tLanguage) {
                  return (!tLanguage.featureToggle || tLanguage.featureToggle !== FeatureToggleService.features.huronUserLocale2);
                });
              }
              return languages;
            }).catch(function () {
              return languages;
            });
        });
      },

      getTranslatedSiteLanguages: function (languages) {
        var localizedLanguages = _.map(languages, function (language) {
          return _.assign(language, {
            label: $translate.instant(language.label)
          });
        });
        return localizedLanguages;
      },

      getSiteCountries: function () {
        return SiteCountryService.query().$promise.then(function (countries) {
          return filterFeatureToggleEnabledCountries(countries);
        });
      },

      getTranslatedSiteCountries: function (countries) {
        var localizedCountries = _.map(countries, function (country) {
          return _.assign(country, {
            label: $translate.instant(country.label)
          });
        });
        return localizedCountries;
      },

      isOverlapping: function (x1, x2, y1, y2) {
        return Math.max(x1, y1) <= Math.min(x2, y2);
      },

      listCosRestrictions: function () {
        return CustomerCosRestrictionServiceV2.get({
          customerId: Authinfo.getOrgId()
        }, angular.bind(this, function (cosRestrictions) {
          this.cosRestrictions = cosRestrictions;
        })).$promise;
      },

      updateCosRestriction: function (cosEnabled, cosUuid, cosType) {
        if ((cosUuid != null) && (cosEnabled)) {
          return CustomerCosRestrictionServiceV2.delete({
            customerId: Authinfo.getOrgId(),
            restrictionId: cosUuid
          }).$promise;
        } else if ((cosUuid == null) && (!cosEnabled)) {
          return CustomerCosRestrictionServiceV2.save({
            customerId: Authinfo.getOrgId(),
            restrictionId: cosUuid
          }, cosType).$promise;
        } else {
          return $q.resolve();
        }
      },

      generateVoiceMailNumber: function (customerId, countrycode) {
        var customerUuid = _.replace(customerId, /-/g, "");
        var str = '';
        for (var i = 0; i < customerUuid.length; i++) {
          var hextodec = parseInt(customerUuid[i], 16).toString(10);
          str += parseInt(hextodec, 10) >= 10 ? hextodec : "0" + hextodec;
        }
        str = countrycode + _.replace(str, /^0+/, "");
        var generatedVoicemailNumber = $filter('limitTo')(str, 40, 0);
        return generatedVoicemailNumber;
      }
    };

    function filterFeatureToggleEnabledCountries(countries) {
      var promises = {};
      var ftSupportedCountries = [];
      _.forEach(countries, function (country) {
        if (country.featureToggle) {
          promises[country.value] = checkFeatureToggleSupport(country.featureToggle);
        } else {
          ftSupportedCountries.push(country);
        }
      });
      if (_.isEmpty(promises)) { return ftSupportedCountries; }
      return $q.all(promises).then(function (data) {
        _.forEach(data, function (value, key) {
          if (value) {
            ftSupportedCountries.push(_.find(countries, { value: key }));
          }
        });
        return ftSupportedCountries;
      })
      .catch(function () {
        return ftSupportedCountries;
      });
    }

    function checkFeatureToggleSupport(feature) {
      return FeatureToggleService.supports(feature).then(function (isSupported) {
        return isSupported;
      });
    }
  }
})();
