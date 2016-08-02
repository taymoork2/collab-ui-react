(function () {
  'use strict';

  describe('TrackingIdInterceptor', function () {
    beforeEach(angular.mock.module('core.trackingId'));

    var TrackingIdInterceptor;
    var EXPOSE_HEADERS = 'Access-Control-Expose-Headers';
    var TRACKING_ID = 'TrackingID';
    var SEPARATOR = '_';

    function buildRequest(url) {
      return {
        url: url,
        headers: {}
      };
    }

    function buildRequestWithExistingHeaders(url) {
      var request = buildRequest(url);
      request.headers[EXPOSE_HEADERS] = 'Location';
      return request;
    }

    beforeEach(inject(function (_TrackingIdInterceptor_) {
      TrackingIdInterceptor = _TrackingIdInterceptor_;
    }));

    it('should add a TrackingID header', function () {
      var response = TrackingIdInterceptor.request(buildRequest('http://cmi.huron-dev.com/some/url'));

      expect(_.has(response.headers, TRACKING_ID)).toBeTruthy();
    });

    it('should add an Access-Control-Expose-Header header if doesn\'t exist', function () {
      var response = TrackingIdInterceptor.request(buildRequest('http://cmi.huron-dev.com/some/url'));

      expect(response.headers[EXPOSE_HEADERS]).toContain(TRACKING_ID);
    });

    it('should add an Access-Control-Expose-Header header if another header already exists', function () {
      var response = TrackingIdInterceptor.request(buildRequestWithExistingHeaders('http://cmi.huron-dev.com/some/url'));

      expect(response.headers[EXPOSE_HEADERS]).toContain(TRACKING_ID);
      expect(response.headers[EXPOSE_HEADERS]).toContain('Location');
    });

    it('should not add TrackingID header if is a blacklisted domain', function () {
      var response = TrackingIdInterceptor.request(buildRequestWithExistingHeaders('https://ciscospark.statuspage.io/index.json'));

      expect(_.has(response.headers, TRACKING_ID)).toBeFalsy();
      expect(response.headers[EXPOSE_HEADERS]).toContain('Location');
    });

    it('should not add an Access-Control-Expose-Header header if is a blacklisted domain', function () {
      var response = TrackingIdInterceptor.request(buildRequestWithExistingHeaders('https://idbroker.webex.com/idb/oauth2/v1/access_token'));

      expect(response.headers[EXPOSE_HEADERS]).not.toContain(TRACKING_ID);
      expect(response.headers[EXPOSE_HEADERS]).toContain('Location');

      response = TrackingIdInterceptor.request(buildRequestWithExistingHeaders('https://msgr-admin.webexconnect.com:443/admin-service/messenger/admin/api/v1'));

      expect(response.headers[EXPOSE_HEADERS]).not.toContain(TRACKING_ID);
      expect(response.headers[EXPOSE_HEADERS]).toContain('Location');
    });

    it('should add an Access-Control-Expose-Header header if on a whitelisted subdomain', function () {
      var response = TrackingIdInterceptor.request(buildRequestWithExistingHeaders('https://identity.webex.com/identity/scim/<uuid>/v1/Users/me'));

      expect(response.headers[EXPOSE_HEADERS]).toContain(TRACKING_ID);
      expect(response.headers[EXPOSE_HEADERS]).toContain('Location');
    });

    it('should increment tracking id when making multiple http requests', function () {
      var response = TrackingIdInterceptor.request(buildRequest('http://cmi.huron-dev.com/some/url'));
      var trackingIdComponents = response.headers[TRACKING_ID].split(SEPARATOR);

      // Non-http request shouldn't affect increment
      TrackingIdInterceptor.request(buildRequest('some:fake/url'));

      response = TrackingIdInterceptor.request(buildRequest('http://cmi.huron-dev.com/some/url'));
      var trackingId2Components = response.headers[TRACKING_ID].split(SEPARATOR);

      // Same sender
      expect(trackingIdComponents[0]).toEqual(trackingId2Components[0]);
      // Same uuid
      expect(trackingIdComponents[1]).toEqual(trackingId2Components[1]);
      // Different sequence = old + 1
      expect(parseInt(trackingIdComponents[2]) + 1).toEqual(parseInt(trackingId2Components[2]));
    });

  });
})();
