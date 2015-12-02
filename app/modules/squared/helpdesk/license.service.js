(function () {
  'use strict';

  /*ngInject*/
  function LicenseService(Config, $translate, $q, $http, $location, HelpdeskMockData) {
    var urlBase = Config.getAdminServiceUrl();

    function extractData(res) {
      return res.data;
    }

    function getLicensesInOrg(orgId) {
      if (useMock()) {
        var deferred = $q.defer();
        deferred.resolve(HelpdeskMockData.licenses);
        return deferred.promise;
      }
      return $http
        .get(urlBase + 'helpdesk/licenses/' + encodeURIComponent(orgId))
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
        this.volume = parts[2];
        this.webExSite = parts[3];
      }
      this.displayName = $translate.instant(Config.confMap[this.offerCode], {
        capacity: this.volume
      });
    }

    function filterLicensesAndSetDisplayName(licenses, type) {
      var matchingLicenses = _.filter(licenses, {type: type});
      _.each(matchingLicenses, function (l) {
        l.displayName = $translate.instant('helpdesk.licenseTypes.' + type, {
          volume: l.volume
        });
      });
      return matchingLicenses;
    }

    function useMock() {
      return $location.absUrl().match(/helpdesk-backend=mock/);
    }

    return {
      userIsEntitledTo: userIsEntitledTo,
      userIsLicensedFor: userIsLicensedFor,
      orgIsEntitledTo: orgIsEntitledTo,
      filterLicensesAndSetDisplayName: filterLicensesAndSetDisplayName,
      UserLicense: UserLicense,
      getLicensesInOrg: getLicensesInOrg
    };
  }

  angular.module('Squared')
    .service('LicenseService', LicenseService);
}());
