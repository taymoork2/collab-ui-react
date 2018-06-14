(function () {
  'use strict';

  module.exports = WebexMetricsService;

  /* @ngInject */
  function WebexMetricsService($http, $q, Authinfo, Config, FeatureToggleService, UrlConfig, WebExApiGatewayService) {
    var metricsSites = [], hasClassic = null;

    var service = {
      getMetricsSites: getMetricsSites,
      getClassicSites: getClassicSites,
      hasMetricsSites: hasMetricsSites,
      hasClassicEnabled: hasClassicEnabled,
      isMEIFeatureToggleOn: isMEIFeatureToggleOn,
      isSystemFeatureToggleOn: isSystemFeatureToggleOn,
      isAnySupported: isAnySupported,
      checkWebexAccessiblity: checkWebexAccessiblity,
    };

    return service;

    function getMetricsSites() {
      if (_.isEmpty(metricsSites)) {
        metricsSites = getMetricsData();
      }
      return metricsSites;
    }

    function getMetricsData() {
      var deferred = $q.defer();
      if (Authinfo.isCustomerLaunchedFromPartner()) {
        var sites = getCustomerSites();
        sites = adjustMetricsSites(sites);
        deferred.resolve(sites);
      } else {
        getTainSites().then(function (sites) {
          sites = adjustMetricsSites(sites);
          deferred.resolve(sites);
        });
      }
      return deferred.promise;
    }

    function adjustMetricsSites(siteUrls) {
      var sites = siteUrls;
      if (sites.length > 0) {
        sites = filterTestSites(sites);
        if (Config.isIntegration()) {
          sites = fixWebexSites(sites);
        }
        sites = filterSiteList(sites);
      }
      sites.sort();
      return sites;
    }

    function getCustomerSites() {
      var sites = [];
      var conferenceServicesWithoutSiteUrl = Authinfo.getConferenceServicesWithoutSiteUrl() || [];
      var conferenceServicesLinkedSiteUrl = Authinfo.getConferenceServicesWithLinkedSiteUrl() || [];

      conferenceServicesWithoutSiteUrl.forEach(function (conferenceService) {
        sites.push(conferenceService.license.siteUrl);
      });

      conferenceServicesLinkedSiteUrl.forEach(function (conferenceService) {
        sites.push(conferenceService.license.linkedSiteUrl);
      });

      return sites;
    }

    function getTainSites() {
      return $http.get(UrlConfig.getScimUrl(Authinfo.getOrgId()) + '/me', {
        cache: true,
      }).then(function (response) {
        var linkedtrainsitenames = _.get(response.data, 'linkedTrainSiteNames', []);
        var admintrainsitenames = _.get(response.data, 'adminTrainSiteNames', []);
        var sites = [];
        sites = _.concat(linkedtrainsitenames, admintrainsitenames);
        sites = _.map(sites, filterInvalidStrFromSite);
        return sites;
      }).catch(function (response) {
        return response;
      });
    }

    function filterInvalidStrFromSite(site) {
      var siteUrl = site;
      var hasHashkey = _.indexOf(siteUrl, '#') == -1;
      if (!hasHashkey) {
        siteUrl = site.substring(0, _.indexOf(site, '#'));
      }
      return siteUrl;
    }

    function hasMetricsSites() {
      return getMetricsSites().then(function (sites) {
        return _.isArray(sites) && !_.isEmpty(sites);
      });
    }

    function checkWebexAccessiblity() {
      var promises = {
        hasMetricsSites: hasMetricsSites(),
        // hasClassicEnabled: hasClassicEnabled(),
        isMEIOn: isMEIFeatureToggleOn(),
        isSystemOn: isSystemFeatureToggleOn(),
      };
      return $q.all(promises);
    }

    function hasClassicEnabled() {
      if (_.isNull(hasClassic)) {
        var siteUrls = getConferenceServicesWithoutSiteUrls() || [];
        var webexSiteUrls = filterSiteList(siteUrls) || [];
        return $q.all(_.map(webexSiteUrls, isSiteSupported)).then(function (isSupported) {
          return _.some(isSupported);
        });
      }
      return hasClassic;
    }

    function isSiteSupported(siteUrls) {
      return WebExApiGatewayService.siteFunctions(siteUrls).then(function (result) {
        return result.isAdminReportEnabled && result.isIframeSupported;
      }).catch(_.noop);
    }

    function isAnySupported(values) {
      return _.some(values);
    }

    function getClassicSites() {
      var siteUrls = getConferenceServicesWithoutSiteUrls() || [];
      var webexSiteUrls = filterSiteList(siteUrls) || [];

      return webexSiteUrls;
    }

    function isMEIFeatureToggleOn() {
      return FeatureToggleService.webexMEIGetStatus();
    }

    function isSystemFeatureToggleOn() {
      return FeatureToggleService.webexSystemGetStatus() && Authinfo.isCisco();
    }

    function getConferenceServicesWithoutSiteUrls() {
      var conferenceServices = Authinfo.getConferenceServicesWithoutSiteUrl() || [];
      var siteUrls = [];

      conferenceServices.forEach(function (conferenceService) {
        siteUrls.push(conferenceService.license.siteUrl);
      });
      return siteUrls;
    }

    function filterSiteList(siteUrls) {
      var webexSiteUrls = [];

      siteUrls.forEach(function (siteUrls) {
        webexSiteUrls.push(siteUrls);
      });

      return webexSiteUrls.filter(function (value, index, self) {
        return self.indexOf(value) === index;
      });
    }

    function filterTestSites(siteUrls) {
      var webexTestSites = ['.my.webex.com', '.dmz.webex.com', '.qa.webex.com'];
      var sites = [];
      sites = _.filter(siteUrls, function (site) {
        return !_.find(webexTestSites, function (testSite) {
          return _.endsWith(site, testSite);
        });
      });
      return sites;
    }

    function fixWebexSites(siteUrls) {
      var ciscoSites = ['go.webex.com'];
      var sites = siteUrls || [];
      if (Authinfo.isCisco()) {
        sites = _.concat(siteUrls, ciscoSites);
      }
      return sites;
    }
  }
})();
