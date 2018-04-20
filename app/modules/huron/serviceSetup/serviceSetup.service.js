(function () {
  'use strict';

  module.exports = ServiceSetup;

  /* @ngInject */
  function ServiceSetup($filter, $q, $translate, Authinfo, AvrilSiteService, AvrilSiteUpdateService, CeSiteService, CustomerCommonService, CustomerCosRestrictionServiceV2, ExternalNumberPool, FeatureToggleService, MediaManagerService, SiteService, VoicemailService, VoicemailTimezoneService) {
    return {
      internalNumberRanges: [],
      sites: [],
      externalNumberPool: [],

      createSite: function (site) {
        return SiteService.save({
          customerId: Authinfo.getOrgId(),
        }, site).$promise;
      },

      listSites: function () {
        return SiteService.query({
          customerId: Authinfo.getOrgId(),
        }, _.bind(function (sites) {
          this.sites = sites;
        }, this)).$promise;
      },

      getSite: function (siteUuid) {
        return SiteService.get({
          customerId: Authinfo.getOrgId(),
          siteId: siteUuid,
        }).$promise;
      },

      saveAutoAttendantSite: function (site) {
        return CeSiteService.save({
          customerId: Authinfo.getOrgId(),
        }, site).$promise;
      },

      loadExternalNumberPool: function (pattern) {
        var extNumPool = [];
        return ExternalNumberPool.getExternalNumbers(
          Authinfo.getOrgId(),
          pattern,
          ExternalNumberPool.UNASSIGNED_NUMBERS,
          ExternalNumberPool.FIXED_LINE_OR_MOBILE
        ).then(_.bind(function (extPool) {
          _.forEach(extPool, function (extNum) {
            extNumPool.push({
              uuid: extNum.uuid,
              pattern: extNum.pattern,
            });
          });
          this.externalNumberPool = extNumPool;
        }, this));
      },

      listVoicemailTimezone: function () {
        return VoicemailTimezoneService.query({
          query: '(alias startswith ' + Authinfo.getOrgId() + ')',
          customerId: Authinfo.getOrgId(),
        }).$promise;
      },

      updateVoicemailTimezone: function (timeZone, objectId) {
        return VoicemailTimezoneService.update({
          customerId: Authinfo.getOrgId(),
          objectId: objectId,
        }, {
          timeZoneName: timeZone,
        }).$promise;
      },

      updateVoicemailPostalcode: function (postalCode, objectId) {
        return VoicemailTimezoneService.update({
          customerId: Authinfo.getOrgId(),
          objectId: objectId,
        }, {
          postalCode: postalCode,
        }).$promise;
      },

      updateVoicemailUserTemplate: function (payload, objectId) {
        return VoicemailTimezoneService.update({
          customerId: Authinfo.getOrgId(),
          objectId: objectId,
        }, payload).$promise;
      },

      getVoicemailPilotNumber: function () {
        return VoicemailService.get({
          customerId: Authinfo.getOrgId(),
        }).$promise;
      },

      updateCustomer: function (customer) {
        return CustomerCommonService.update({
          customerId: Authinfo.getOrgId(),
        }, customer).$promise;
      },

      getDateFormats: function () {
        return $q.resolve(require('./dateFormats.json'));
      },

      getTimeFormats: function () {
        return $q.resolve(require('./timeFormat.json'));
      },

      getTimeZones: function () {
        return $q.resolve(require('./jodaTimeZones.json'));
      },

      getTranslatedTimeZones: function (timeZones) {
        var localizedTimeZones = _.map(timeZones, function (timeZone) {
          return {
            id: timeZone.id,
            label: $translate.instant('timeZones.' + timeZone.id),
          };
        });
        return localizedTimeZones;
      },

      getAllLanguages: getAllLanguages,

      getSiteLanguages: function () {
        return getAllLanguages().then(function (languages) {
          return filterFeatureToggleEnabledObjects(languages);
        });
      },

      getTranslatedSiteLanguages: function (languages) {
        var localizedLanguages = _.map(languages, function (language) {
          return _.assign({}, language, {
            label: $translate.instant(language.label),
          });
        });
        return localizedLanguages;
      },

      getSiteCountries: function () {
        return $q.resolve(require('./siteCountries.json')).then(function (countries) {
          return filterFeatureToggleEnabledObjects(countries);
        });
      },

      getTranslatedSiteCountries: function (countries) {
        var localizedCountries = _.map(countries, function (country) {
          return _.assign({}, country, {
            label: $translate.instant(country.label),
          });
        });
        return localizedCountries;
      },

      listCosRestrictions: function () {
        return CustomerCosRestrictionServiceV2.get({
          customerId: Authinfo.getOrgId(),
        }, _.bind(function (cosRestrictions) {
          this.cosRestrictions = cosRestrictions;
        }, this)).$promise;
      },

      updateCosRestriction: function (cosEnabled, cosUuid, cosType) {
        if ((cosUuid != null) && (cosEnabled)) {
          return CustomerCosRestrictionServiceV2.delete({
            customerId: Authinfo.getOrgId(),
            restrictionId: cosUuid,
          }).$promise;
        } else if ((cosUuid == null) && (!cosEnabled)) {
          return CustomerCosRestrictionServiceV2.save({
            customerId: Authinfo.getOrgId(),
            restrictionId: cosUuid,
          }, cosType).$promise;
        } else {
          return $q.resolve();
        }
      },

      generateVoiceMailNumber: function (customerId, countrycode) {
        var customerUuid = _.replace(customerId, /-/g, '');
        var str = '';
        for (var i = 0; i < customerUuid.length; i++) {
          var hextodec = parseInt(customerUuid[i], 16).toString(10);
          str += parseInt(hextodec, 10) >= 10 ? hextodec : '0' + hextodec;
        }
        str = countrycode + _.replace(str, /^0+/, '');
        var generatedVoicemailNumber = $filter('limitTo')(str, 40, 0);
        return generatedVoicemailNumber;
      },
    };

    function filterFeatureToggleEnabledObjects(objects) {
      var promises = {};
      var ftSupportedObjects = [];
      _.forEach(objects, function (object) {
        if (object.featureToggle) {
          promises[object.value] = checkFeatureToggleSupport(object.featureToggle);
        } else {
          ftSupportedObjects.push(object);
        }
      });
      if (_.isEmpty(promises)) { return ftSupportedObjects; }
      return $q.all(promises).then(function (data) {
        _.forEach(data, function (value, key) {
          if (value) {
            ftSupportedObjects.push(_.find(objects, { value: key }));
          }
        });
        return ftSupportedObjects;
      })
        .catch(function () {
          return ftSupportedObjects;
        });
    }

    function checkFeatureToggleSupport(feature) {
      return FeatureToggleService.supports(feature).then(function (isSupported) {
        return isSupported;
      });
    }

    function getAllLanguages() {
      return $q.resolve(require('./siteLanguages.json'));
    }
  }
})();
