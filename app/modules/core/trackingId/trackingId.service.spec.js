(function () {
  'use strict';

  describe('TrackingId', function () {
    beforeEach(angular.mock.module('Core'));

    var SEPARATOR = "_";
    var TrackingId, $http;

    beforeEach(inject(function (_TrackingId_, _$http_) {
      TrackingId = _TrackingId_;
      $http = _$http_;
    }));

    it('should not initialize with an $http tracking id', function () {
      expect($http.defaults.headers.common.TrackingID).toBeUndefined();
    });

    describe('increment function', function () {
      var trackingId;

      beforeEach(function () {
        trackingId = TrackingId.increment();
      });

      it('should generate a new tracking id', function () {
        expect(trackingId).toBeDefined();
        expect($http.defaults.headers.common.TrackingID).toEqual(trackingId);
      });

      it('should contain three components (sender, uuid, sequence)', function () {
        expect(trackingId.split(SEPARATOR).length).toEqual(3);
      });

      it('should initialize sequence to 0', function () {
        expect(trackingId.split(SEPARATOR).pop()).toEqual('0');
      });

      it('should increment the existing tracking id', function () {
        var trackingId2 = TrackingId.increment();
        expect(trackingId2).not.toEqual(trackingId);

        var trackingIdComponents = trackingId.split(SEPARATOR);
        var trackingId2Components = trackingId2.split(SEPARATOR);

        // Same sender
        expect(trackingIdComponents[0]).toEqual(trackingId2Components[0]);
        // Same uuid
        expect(trackingIdComponents[1]).toEqual(trackingId2Components[1]);
        // Different sequence = old + 1
        expect(parseInt(trackingIdComponents[2], 10) + 1).toEqual(parseInt(trackingId2Components[2], 10));
      });
    });

    describe('clear function', function () {
      beforeEach(function () {
        TrackingId.increment();
      });

      it('should clear the existing tracking id', function () {
        expect(TrackingId.get()).toBeDefined();
        expect($http.defaults.headers.common.TrackingID).toBeDefined();

        TrackingId.clear();

        expect(TrackingId.get()).toBeUndefined();
        expect($http.defaults.headers.common.TrackingID).toBeUndefined();
      });
    });

    describe('getWithoutSequence function', function () {
      var trackingId;

      beforeEach(function () {
        TrackingId.increment();
        trackingId = TrackingId.getWithoutSequence();
      });

      it('should return a tracking id without a sequence', function () {
        expect(trackingId.split(SEPARATOR).length).toEqual(2);
      });
    });

  });
})();
