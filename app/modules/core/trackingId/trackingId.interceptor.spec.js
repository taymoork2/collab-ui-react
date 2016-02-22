(function () {
  'use strict';

  describe('TrackingIdInterceptor', function () {
    beforeEach(module('Core'));

    var TrackingIdInterceptor;
    var EXPOSE_HEADERS = 'Access-Control-Expose-Headers';
    var TRACKING_ID = 'TrackingID';
    var SEPARATOR = '_';

    beforeEach(inject(function (_TrackingIdInterceptor_) {
      TrackingIdInterceptor = _TrackingIdInterceptor_;
    }));

    it('should add a TrackingID header', function () {
      var response = TrackingIdInterceptor.request({
        url: 'http://cmi.huron-dev.com/some/url',
        headers: {}
      });

      expect(_.has(response.headers, TRACKING_ID)).toBeTruthy();
    });

    it('should add an Access-Control-Expose-Header header if doesn\'t exist', function () {
      var response = TrackingIdInterceptor.request({
        url: 'http://cmi.huron-dev.com/some/url',
        headers: {}
      });

      expect(response.headers[EXPOSE_HEADERS]).toContain(TRACKING_ID);
    });

    it('should add an Access-Control-Expose-Header header if another header already exists', function () {
      var response = TrackingIdInterceptor.request({
        url: 'http://cmi.huron-dev.com/some/url',
        headers: {
          'Access-Control-Expose-Headers': 'Location'
        }
      });

      expect(response.headers[EXPOSE_HEADERS]).toContain(TRACKING_ID);
      expect(response.headers[EXPOSE_HEADERS]).toContain('Location');
    });

    it('should not add TrackingID header if is a blacklisted domain', function () {
      var response = TrackingIdInterceptor.request({
        url: 'https://ciscospark.statuspage.io/index.json',
        headers: {
          'Access-Control-Expose-Headers': 'Location'
        }
      });

      expect(_.has(response.headers, TRACKING_ID)).toBeFalsy();
      expect(response.headers[EXPOSE_HEADERS]).toContain('Location');
    });

    it('should not add an Access-Control-Expose-Header header if is a blacklisted domain', function () {
      var response = TrackingIdInterceptor.request({
        url: 'https://idbroker.webex.com/idb/oauth2/v1/access_token',
        headers: {
          'Access-Control-Expose-Headers': 'Location'
        }
      });

      expect(response.headers[EXPOSE_HEADERS]).not.toContain(TRACKING_ID);
      expect(response.headers[EXPOSE_HEADERS]).toContain('Location');
    });

    it('should increment tracking id when making multiple http requests', function () {
      var response = TrackingIdInterceptor.request({
        url: 'http://cmi.huron-dev.com/some/url',
        headers: {}
      });

      var trackingId = response.headers.TrackingID;

      // Non-http request shouldn't affect increment
      response = TrackingIdInterceptor.request({
        url: 'some:fake/url',
        headers: {}
      });

      response = TrackingIdInterceptor.request({
        url: 'http://cmi.huron-dev.com/some/url',
        headers: {}
      });

      var trackingId2 = response.headers.TrackingID;

      var trackingIdComponents = trackingId.split(SEPARATOR);
      var trackingId2Components = trackingId2.split(SEPARATOR);

      // Same sender
      expect(trackingIdComponents[0]).toEqual(trackingId2Components[0]);
      // Same uuid
      expect(trackingIdComponents[1]).toEqual(trackingId2Components[1]);
      // Different sequence - old + 1
      expect(parseInt(trackingIdComponents[2]) + 1).toEqual(parseInt(trackingId2Components[2]));

    });

  });
})();
