(function () {
  'use strict';
  describe('App Run', function () {
    var $rootScope, $httpBackend, TrackingId;
    var STATE_CHANGE_SUCCESS = '$stateChangeSuccess';

    beforeEach(angular.mock.module('wx2AdminWebClientApp'));

    beforeEach(inject(function (_$rootScope_, _$httpBackend_, _TrackingId_) {
      $rootScope = _$rootScope_;
      $httpBackend = _$httpBackend_;
      TrackingId = _TrackingId_;
      //hack the l10n json because entire module is loaded
      $httpBackend.whenGET('l10n/en_US.json').respond(200);
      spyOn(TrackingId, 'clear').and.callThrough();
    }));

    function emitStateChange() {
      $rootScope.$emit(STATE_CHANGE_SUCCESS, {
        name: 'fake-state'
      }, {}, {
        name: 'previous-state'
      }, {});
      $rootScope.$apply();
    }

    describe('TrackingId', function () {
      beforeEach(function () {
        TrackingId.increment();
      });

      it('should clear the trackingId on every successful state change', function () {
        expect(TrackingId.get()).toBeDefined();

        emitStateChange();

        expect(TrackingId.clear).toHaveBeenCalled();
        expect(TrackingId.get()).toBeUndefined();
      });

    });

  });

})();
