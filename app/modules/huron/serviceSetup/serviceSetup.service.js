(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('ServiceSetup', ServiceSetup);

  /* @ngInject */
  function ServiceSetup($q, $translate, Authinfo, SiteService, InternalNumberRangeService, TimeZoneService, ExternalNumberPoolService, VoicemailTimezoneService, VoicemailService, CustomerCommonService, CustomerCosRestrictionServiceV2) {

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

      updateSite: function (siteUuid, site) {
        return SiteService.update({
          customerId: Authinfo.getOrgId(),
          siteId: siteUuid
        }, site).$promise;
      },

      loadExternalNumberPool: function (pattern) {
        var extNumPool = [];
        var patternQuery = pattern ? '%' + pattern + '%' : undefined;
        return ExternalNumberPoolService.query({
          customerId: Authinfo.getOrgId(),
          directorynumber: '',
          order: 'pattern',
          pattern: patternQuery
        }, angular.bind(this, function (extPool) {
          angular.forEach(extPool, function (extNum) {
            extNumPool.push({
              uuid: extNum.uuid,
              pattern: extNum.pattern
            });
          });
          this.externalNumberPool = extNumPool;
        })).$promise;
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
          timeZone: timeZone
        }).$promise;
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
        if (angular.isUndefined(internalNumberRange.uuid)) {
          internalNumberRange.name = internalNumberRange.description = internalNumberRange.beginNumber + ' - ' + internalNumberRange.endNumber;
          internalNumberRange.patternUsage = "Device";
          return InternalNumberRangeService.save({
            customerId: Authinfo.getOrgId()
          }, internalNumberRange, function (data, headers) {
            internalNumberRange.uuid = headers('location').split("/").pop();
          }).$promise;
        } else {
          return $q.when();
        }
      },

      updateInternalNumberRange: function (internalNumberRange) {
        if (angular.isDefined(internalNumberRange.uuid)) {
          internalNumberRange.name = internalNumberRange.description = internalNumberRange.beginNumber + ' - ' + internalNumberRange.endNumber;
          internalNumberRange.patternUsage = "Device";
          return InternalNumberRangeService.save({
            customerId: Authinfo.getOrgId(),
            internalNumberRangeId: internalNumberRange.uuid
          }, internalNumberRange, function (data, headers) {
            internalNumberRange.uuid = headers('location').split("/").pop();
          }).$promise;
        } else {
          return $q.when();
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

      getTimeZones: function () {
        return TimeZoneService.query().$promise;
      },

      getTranslatedTimeZones: function (timeZones) {
        var localizedTimeZones = _.map(timeZones, function (timeZone) {
          if (_.has(timeZone, 'id')) {
            // for compatibility with new jodaTimeZones.json called by cmiServices.js.
            return _.extend(timeZone, {
              label: $translate.instant('timeZones.' + timeZone.id),
              value: timeZone.id
            });
          } else {
            // for compatibility with old timeZones.json called by cmiServices.js.
            return _.extend(timeZone, {
              label: $translate.instant('timeZones.' + timeZone.value),
            });
          }
        });
        return localizedTimeZones;
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
          return $q.when();
        }
      }
    };
  }
})();
