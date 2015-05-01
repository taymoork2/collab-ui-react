(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('ServiceSetup', ServiceSetup);

  /* @ngInject */
  function ServiceSetup($q, Log, Authinfo, Notification, SiteService, InternalNumberRangeService) {
    return {
      internalNumberRanges: [],
      sites: [],

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
      }
    };
  }
})();
