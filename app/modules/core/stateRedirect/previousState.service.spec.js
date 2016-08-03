(function () {
  'use strict';

  describe('Service: PreviousState', function () {
    var PreviousState, $state;
    var state, stateParams;

    beforeEach(angular.mock.module('Core'));

    beforeEach(inject(function (_PreviousState_, _$state_) {
      PreviousState = _PreviousState_;
      $state = _$state_;

      spyOn($state, 'go');
    }));

    describe('without set data', function () {
      it('should not have a state', function () {
        expect(PreviousState.get()).toBeUndefined();
      });

      it('should not have a state param', function () {
        expect(PreviousState.getParams()).toBeUndefined();
      });

      it('should not be valid', function () {
        expect(PreviousState.isValid()).toEqual(false);
      });

      it('should not go anywhere', function () {
        PreviousState.go();
        expect($state.go).not.toHaveBeenCalled();
      });
    });

    describe('with valid previous state', function () {
      beforeEach(function () {
        state = 'myPreviousState';
        stateParams = {
          myParam: 'myValue'
        };
        PreviousState.set(state);
        PreviousState.setParams(stateParams);
      });

      it('should have a state', function () {
        expect(PreviousState.get()).toEqual(state);
      });

      it('should have a state param', function () {
        expect(PreviousState.getParams()).toEqual(stateParams);
      });

      it('should be valid', function () {
        expect(PreviousState.isValid()).toEqual(true);
      });

      it('should go to previous state', function () {
        PreviousState.go();
        expect($state.go).toHaveBeenCalledWith(state, stateParams);
      });
    });

    describe('with login previous state', function () {
      beforeEach(function () {
        state = 'login';
        stateParams = {
          myParam: 'myValue'
        };
        PreviousState.set(state);
        PreviousState.setParams(stateParams);
      });

      it('should have a state', function () {
        expect(PreviousState.get()).toEqual(state);
      });

      it('should have a state param', function () {
        expect(PreviousState.getParams()).toEqual(stateParams);
      });

      it('should not be valid', function () {
        expect(PreviousState.isValid()).toEqual(false);
      });

      it('should not go to previous state', function () {
        PreviousState.go();
        expect($state.go).not.toHaveBeenCalled();
      });
    });
  });
})();
