(function () {
  'use strict';

  angular
    .module('Core')
    .factory('TrackingIdInterceptor', TrackingIdInterceptor);

  /* @ngInject */
  function TrackingIdInterceptor($injector) {
    var interceptor = {
      request: request
    };

    var TRACKING_ID = 'TrackingID';
    var ACCESS_CONTROL_EXPOSE_HEADERS = 'Access-Control-Expose-Headers';

    var TrackingId;

    // These services don't allow a TrackingID header
    var blacklist = [
      'statuspage.io'
    ];

    // These services don't allow Access-Control-Expose-Headers header
    var exposeHeadersBlacklist = [
      'msgr-admin-bts.webexconnect.com',
      'msgr-admin.webexconnect.com'
    ];

    // These services only allow Access-Control-Expose-Headers header on specific subdomains
    var exposeHeadersWhiteBlacklistRegex = [
      // Disallow all webex.com domains except for subdomain identity.webex.com
      buildWhiteBlacklistRegex(['identity'], 'webex.com')
    ];

    return interceptor;

    /**
     * Build a regex to return
     * true if matches blacklist domain
     * or
     * false if matches whitelist subdomain
     *
     * @param {array} whitelistSubdomain The set of subdomains to allow
     * @param {array} blacklistDomain The domain to disallow
     */
    function buildWhiteBlacklistRegex(whitelistSubdomain, blacklistDomain) {
      var whitelistSubdomains = _.isArray(whitelistSubdomain) ? whitelistSubdomain : [whitelistSubdomain];
      // Match anything with a blacklistDomain, with the exception of whitelistSubdomains
      var regex = "^http?s:\/\/(?:(?!" + whitelistSubdomains.join('|') + ").*)\." + blacklistDomain;
      return new RegExp(regex);
    }

    function isAllowedExposedHeaders(url) {
      // If url doesn't include blacklist values and doesn't match an exposeHeadersWhiteBlacklistRegex
      return !_.some(exposeHeadersBlacklist, _.partial(_.includes, url)) && !_.some(exposeHeadersWhiteBlacklistRegex, function (whiteBlacklistRegex) {
        return whiteBlacklistRegex.test(url);
      });
    }

    function request(config) {
      // Clear TrackingID and return config if config.url includes any blacklist values
      if (_.some(blacklist, _.partial(_.includes, config.url))) {
        delete config.headers[TRACKING_ID];
        return config;
      }

      // If making an http request, increment tracking id and add to headers
      if (_.startsWith(config.url, 'http')) {
        if (_.isUndefined(TrackingId)) {
          TrackingId = $injector.get('TrackingId');
        }

        // Add the incremented tracking id to the request headers
        config.headers[TRACKING_ID] = TrackingId.increment();

        // Add TrackingID to Access-Control-Expose-Headers if config.url doesn't include blacklist values
        if (isAllowedExposedHeaders(config.url)) {
          // Add or append tracking id header to expose headers
          var exposeHeaders = config.headers[ACCESS_CONTROL_EXPOSE_HEADERS];
          if (_.isUndefined(exposeHeaders)) {
            exposeHeaders = TRACKING_ID;
          } else if (!_.includes(exposeHeaders, TRACKING_ID)) {
            exposeHeaders += ',' + TRACKING_ID;
          }
          config.headers[ACCESS_CONTROL_EXPOSE_HEADERS] = exposeHeaders;
        }
      }

      return config;
    }
  }
})();
