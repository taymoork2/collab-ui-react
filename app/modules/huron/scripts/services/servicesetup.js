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
        }, site, function (response) {
          Notification.notify([response.siteIndex + ' added successfully'], 'success');
        }, function (response) {
          Notification.notify([response.config.data.siteIndex + ' not added'], 'error');
        }).$promise;
      },

      listSites: function () {
        return SiteService.query({
          customerId: Authinfo.getOrgId()
        }, angular.bind(this, function (sites) {
          this.sites = sites;
        })).$promise;
      },

      createInternalNumberRanges: function (internalNumberRanges) {
        var success = [];
        var error = [];
        var deferreds = [];
        var saveSuccess = function (response) {
          success.push(response.beginNumber + ' - ' + response.endNumber + ' added successfully');
        };
        var saveError = function (response) {
          error.push(response.config.data.beginNumber + ' - ' + response.config.data.endNumber + ' not added');
        };
        for (var index = 0; index < internalNumberRanges.length; index++) {
          var data = angular.copy(internalNumberRanges[index]);
          data.name = data.description = data.beginNumber + '-' + data.endNumber;
          // if there's uuid, then update
          if (data.uuid) { // update
            Log.debug("Update is not supported in GAXL yet. Skip for now." + data.name);
          } else { // insert
            Log.debug("Inserting " + data.name);
            data.patternUsage = "Device";
            deferreds.push(InternalNumberRangeService.save({
              customerId: Authinfo.getOrgId()
            }, data, saveSuccess, saveError).$promise);
          }
        }
        return $q.all(deferreds).finally(function () {
          Notification.notify(success, 'success');
          Notification.notify(error, 'error');
        });
      },

      deleteInternalNumberRange: function (internalNumberRange) {
        return InternalNumberRangeService.delete({
          customerId: Authinfo.getOrgId(),
          internalNumberRangeId: internalNumberRange.uuid
        }, function () {
          Notification.notify([internalNumberRange.beginNumber + ' - ' + internalNumberRange.endNumber + ' deleted successfully'], 'success');
        }, function () {
          Notification.notify([internalNumberRange.beginNumber + ' - ' + internalNumberRange.endNumber + ' not deleted. Some numbers might have been assigned.'], 'error');
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
