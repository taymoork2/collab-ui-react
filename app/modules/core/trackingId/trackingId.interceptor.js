(function () {
  'use strict';

  angular
    .module('core.trackingId')
    .factory('TrackingIdInterceptor', TrackingIdInterceptor);

  /* @ngInject */
  function TrackingIdInterceptor($injector) {
    var interceptor = {
      request: request
    };

    var TRACKING_ID = 'TrackingID';
    var ACCESS_CONTROL_EXPOSE_HEADERS = 'Access-Control-Expose-Headers';

    var TrackingId;

    // These services don't allow TrackingID header
    var blacklist = [
      'statuspage.io'
    ];

    // These services don't allow Access-Control-Expose-Headers header
    var accessControlExposeHeadersRegexBlacklist = [
      // Disallow all webex.com domains except for identity.webex.com subdomain
      buildBlacklistedDomainWithWhitelistedSubdomainRegex('webex.com', ['identity']),
      buildBlacklistedDomainRegex('webexconnect.com')
    ];

    return interceptor;

    /**
     * Build a regex with a blacklisted domain with an optional set of whitelisted subdomains
     *
     * @param {string} blacklistDomain The domain to disallow
     * @param {array} whitelistSubdomain The set of subdomains to allow
     */
    function buildBlacklistedDomainWithWhitelistedSubdomainRegex(blacklistDomain, whitelistSubdomain) {
      var whitelistSubdomainArray;
      if (_.isArray(whitelistSubdomain)) {
        whitelistSubdomainArray = whitelistSubdomain;
      } else if (whitelistSubdomain) {
        whitelistSubdomainArray = [whitelistSubdomain];
      } else {
        whitelistSubdomainArray = [];
      }
      var regex = "^http?s://(?:";
      if (whitelistSubdomainArray.length) {
        regex += "(?!" + whitelistSubdomainArray.join('|') + ")";
      }
      regex += ".*)" + blacklistDomain;
      return new RegExp(regex);
    }

    function buildBlacklistedDomainRegex(blacklistDomain) {
      return buildBlacklistedDomainWithWhitelistedSubdomainRegex(blacklistDomain);
    }

    function urlAllowsAccessControlExposeHeaders(url) {
      return !_.some(accessControlExposeHeadersRegexBlacklist, function (regex) {
        return regex.test(url);
      });
    }

    function urlContainsBlacklistedValues(url) {
      return _.some(blacklist, _.partial(_.includes, url));
    }

    function isHttpRequest(url) {
      return _.startsWith(url, 'http');
    }

    function injectTrackingIdService() {
      if (!TrackingId) {
        TrackingId = $injector.get('TrackingId');
      }
    }

    function clearTrackingIdHeader(headers) {
      delete headers[TRACKING_ID];
    }

    function incrementTrackingIdHeader(headers) {
      headers[TRACKING_ID] = TrackingId.increment();
    }

    function addAccessControlExposeHeader(headers) {
      var exposeHeaders = headers[ACCESS_CONTROL_EXPOSE_HEADERS];
      if (!exposeHeaders) {
        exposeHeaders = TRACKING_ID;
      } else if (!_.includes(exposeHeaders, TRACKING_ID)) {
        exposeHeaders += ',' + TRACKING_ID;
      }
      headers[ACCESS_CONTROL_EXPOSE_HEADERS] = exposeHeaders;
    }

    function request(config) {
      if (urlContainsBlacklistedValues(config.url)) {
        clearTrackingIdHeader(config.headers);
        return config;
      }

      if (isHttpRequest(config.url)) {
        injectTrackingIdService();

        incrementTrackingIdHeader(config.headers);

        if (urlAllowsAccessControlExposeHeaders(config.url)) {
          addAccessControlExposeHeader(config.headers);
        }
      }

      return config;
    }
  }
})();
