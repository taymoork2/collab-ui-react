(function () {
  'use strict';

  /*ngInject*/
  function LicenseService(Config, $translate, $q, $http, $location, HelpdeskMockData) {
    var urlBase = Config.getAdminServiceUrl();

    function extractData(res) {
      return res.data;
    }

    function getLicensesInOrg(orgId, includeUsage) {
      if (useMock()) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.licenses);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/licenses/' + encodeURIComponent(orgId) + "/?collapse=false" + (includeUsage ? '&includeUsage=true' : ''))
        .then(extractData);
    }

    function userIsEntitledTo(user, entitlement) {
      if (user && user.entitlements) {
        return _.includes(user.entitlements, entitlement);
      }
      return false;
    }

    function userIsLicensedFor(user, offerCode) {
      if (user && user.licenseID) {
        return _.any(user.licenseID, function (license) {
          return license.substring(0, 2) === offerCode;
        });
      }
      return false;
    }

    function orgIsEntitledTo(org, entitlement) {
      if (org && org.services) {
        return _.includes(org.services, entitlement);
      }
      return false;
    }

    // E.g. MC_f36c1a2c-20d6-460d-9f55-01fc85d52e04_100_t30citest.webex.com, "MS_62b343df-bdd5-463b-8895-d07fc3a94832"
    function UserLicense(licenseString) {
      var parts = licenseString.split('_');
      this.offerCode = parts[0]; // See Config.offerCodes
      this.id = parts[1];
      if (this.offerCode === Config.offerCodes.MC || this.offerCode === Config.offerCodes.SC || this.offerCode === Config.offerCodes.TC || this.offerCode === Config.offerCodes.EC || this.offerCode === Config.offerCodes.EE) {
        this.capacity = parts[2];
        this.webExSite = parts[3];
      }
      this.displayName = $translate.instant(Config.confMap[this.offerCode], {
        capacity: this.capacity
      });
    }

    function filterAndExtendLicenses(licenses, type) {
      var matchingLicenses = _.filter(licenses, {
        type: type
      });
      _.each(matchingLicenses, function (l) {
        l.displayName = $translate.instant('helpdesk.licenseDisplayNames.' + l.offerCode, {
          volume: l.volume,
          capacity: l.capacity
        });
        l.usagePrecentage = _.round(((l.usage * 100) / l.volume) || 0);
      });
      return matchingLicenses;
    }

    function aggregatedLicenses(licenses, type) {
      var matchingLicenses = _.clone(_.filter(licenses, {
        type: type
      }));
      var aggregatedLics = [];
      _.each(matchingLicenses, function (l) {
        var displayName = $translate.instant('helpdesk.licenseDisplayNames.' + l.offerCode, {
          capacity: l.capacity
        });
        var key = l.offerCode + '#' + l.capacity + "#" + l.siteUrl;
        var aggregate = _.find(aggregatedLics, {
          key: key
        });
        if (aggregate) {
          aggregate.totalVolume += l.volume;
          aggregate.totalUsage += l.usage;
          aggregate.licenses.push(l);
        } else {
          aggregate = {
            key: key,
            displayName: displayName,
            totalUsage: l.usage,
            totalVolume: l.volume,
            licenses: [l],
            siteUrl: l.siteUrl
          };
          aggregatedLics.push(aggregate);
        }
        aggregate.isTrial = _.all(aggregate.licenses, {
          isTrial: true
        });
        aggregate.trialExpiresInDays = _.max(aggregate.licenses, 'trialExpiresInDays').trialExpiresInDays;
        aggregate.usagePercentage = _.round((aggregate.totalUsage || 0) * 100 / aggregate.totalVolume);
      });
      return aggregatedLics;
    }

    function getUnlicensedUsersCount(orgId) {
      if (useMock()) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.unlicenseduserscount);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/unlicenseduserscount/' + encodeURIComponent(orgId))
        .then(extractData);
    }

    function useMock() {
      return $location.absUrl().match(/helpdesk-backend=mock/);
    }

    return {
      userIsEntitledTo: userIsEntitledTo,
      userIsLicensedFor: userIsLicensedFor,
      orgIsEntitledTo: orgIsEntitledTo,
      filterAndExtendLicenses: filterAndExtendLicenses,
      aggregatedLicenses: aggregatedLicenses,
      UserLicense: UserLicense,
      getLicensesInOrg: getLicensesInOrg,
      getUnlicensedUsersCount: getUnlicensedUsersCount
    };
  }

  angular.module('Squared')
    .service('LicenseService', LicenseService);
}());
