(function () {
  'use strict';

  angular
    .module('Core')
    .service('DeviceOverviewService', DeviceOverviewService);

  /* @ngInject */
  function DeviceOverviewService($q, $translate, Notification, ServiceSetup) {
    return {
      getCountryOptions: getCountryOptions,
      findCountryByCode: findCountryByCode,
    };

    function getCountryOptions() {
      var promises = [];
      promises.push(getSiteLevelCountry());
      promises.push(getSiteCountries());
      if (_.isEmpty(promises)) {
        return [];
      }
      return $q.all(promises)
        .then(function (data) {
          var siteCountryCode = data[0];
          var countries = data[1];
          var siteCountry = getSiteCountry(countries, siteCountryCode);
          return setSiteCountryInOptions(siteCountry, countries);
        }).catch(function (error) {
          Notification.errorResponse(error, 'deviceOverviewPage.failedToFetchCountries');
          return $q.reject();
        });
    }

    function getSiteLevelCountry() {
      return ServiceSetup.listSites().then(function () {
        if (ServiceSetup.sites.length !== 0) {
          return ServiceSetup.getSite(ServiceSetup.sites[0].uuid)
          .then(function (site) {
            return _.get(site, 'country');
          });
        }
      });
    }

    function getSiteCountries() {
      return ServiceSetup.getSiteCountries()
        .then(function (countries) {
          return _.sortBy(ServiceSetup.getTranslatedSiteCountries(countries), 'label');
        });
    }

    function getSiteCountry(countries, siteCountryCode) {
      var defaultPrefix = $translate.instant('preferredLanguage.organizationSettingLabel');
      var translatedLabel = $translate.instant('countries.unitedStates');
      if (siteCountryCode) {
        var siteCountry = findCountryByCode(countries, siteCountryCode);
        translatedLabel = _.isEmpty(siteCountry) ? siteCountryCode : _.get(siteCountry, 'label');
      }
      var defaultCountry = {
        label: defaultPrefix + translatedLabel,
        value: null,
      };
      return defaultCountry;
    }

    function setSiteCountryInOptions(siteCountry, countries) {
      if (siteCountry) {
        var countryOptions = [];
        countryOptions.push(siteCountry);
        countryOptions = countryOptions.concat(countries);
        return countryOptions;
      }
      return countries;
    }

    function findCountryByCode(countries, country) {
      return _.find(countries, function (o) {
        return o.value === country;
      });
    }
  }
}());
