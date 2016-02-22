(function () {
  'use strict';

  describe('TrackingId', function () {
    beforeEach(module('Core'));

    var SEPARATOR = "_";
    var TrackingId, $http;

    beforeEach(inject(function (_TrackingId_, _$http_) {
      TrackingId = _TrackingId_;
      $http = _$http_;
    }));

    it('should not initialize with an $http tracking id', function () {
      expect($http.defaults.headers.common.TrackingID).toBeUndefined();
    });

    describe('generate function', function () {
      var trackingId;

      beforeEach(function () {
        trackingId = TrackingId.generate();
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

      it('should replace the current tracking id', function () {
        var trackingId2 = TrackingId.generate();
        expect(trackingId2).not.toEqual(trackingId);

        var trackingIdComponents = trackingId.split(SEPARATOR);
        var trackingId2Components = trackingId2.split(SEPARATOR);

        // Same sender
        expect(trackingIdComponents[0]).toEqual(trackingId2Components[0]);
        // Different uuid
        expect(trackingIdComponents[1]).not.toEqual(trackingId2Components[1]);
        // Same sequence
        expect(trackingIdComponents[2]).toEqual(trackingId2Components[2]);
      });
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

      it('should increment the existing tracking id', function () {
        var trackingId2 = TrackingId.increment();
        expect(trackingId2).not.toEqual(trackingId);

        var trackingIdComponents = trackingId.split(SEPARATOR);
        var trackingId2Components = trackingId2.split(SEPARATOR);

        // Same sender
        expect(trackingIdComponents[0]).toEqual(trackingId2Components[0]);
        // Same uuid
        expect(trackingIdComponents[1]).toEqual(trackingId2Components[1]);
        // Different sequence - old + 1
        expect(parseInt(trackingIdComponents[2]) + 1).toEqual(parseInt(trackingId2Components[2]));
      });

      it('should add a sequence to a tracking id without a sequence', function () {
        var trackingId = 'SENDER_UUID';
        TrackingId.set(trackingId);

        TrackingId.increment();

        expect(TrackingId.get()).toEqual(trackingId + '_0');
      });

      it('should add a sequence to a tracking id with an nvpair', function () {
        var trackingId = 'SENDER_UUID_locus:1234';
        TrackingId.set(trackingId);

        TrackingId.increment();

        expect(TrackingId.get()).toEqual(trackingId + '_0');
      });
    });

    describe('clear function', function () {
      beforeEach(function () {
        TrackingId.generate();
      });

      it('should clear the existing tracking id', function () {
        expect(TrackingId.get()).toBeDefined();
        expect($http.defaults.headers.common.TrackingID).toBeDefined();

        TrackingId.clear();

        expect(TrackingId.get()).toBeUndefined();
        expect($http.defaults.headers.common.TrackingID).toBeUndefined();
      });
    });

  });
})();
