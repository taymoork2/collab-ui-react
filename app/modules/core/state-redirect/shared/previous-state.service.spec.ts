import moduleName from './index';

describe('Service: PreviousState', function () {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$state',
      'PreviousState',
    );

    spyOn(this.$state, 'go');
  });

  describe('without set data', function () {
    it('should not have a state', function () {
      expect(this.PreviousState.get()).not.toBeDefined();
    });

    it('should not have a state param', function () {
      expect(this.PreviousState.getParams()).not.toBeDefined();
    });

    it('should not be valid', function () {
      expect(this.PreviousState.isValid()).toBe(false);
    });

    it('should not go anywhere', function () {
      this.PreviousState.go();
      expect(this.$state.go).not.toHaveBeenCalled();
    });
  });

  describe('with valid previous state', function () {
    beforeEach(function () {
      this.state = 'myPreviousState';
      this.stateParams = {
        myParam: 'myValue',
      };
      this.PreviousState.set(this.state);
      this.PreviousState.setParams(this.stateParams);
    });

    it('should have a state', function () {
      expect(this.PreviousState.get()).toBe(this.state);
    });

    it('should have a state param', function () {
      expect(this.PreviousState.getParams()).toEqual(this.stateParams);
    });

    it('should be valid', function () {
      expect(this.PreviousState.isValid()).toBe(true);
    });

    it('should go to previous state', function () {
      this.PreviousState.go();
      expect(this.$state.go).toHaveBeenCalledWith(this.state, this.stateParams);
    });
  });

  describe('with login previous state', function () {
    beforeEach(function () {
      this.state = 'login';
      this.stateParams = {
        myParam: 'myValue',
      };
      this.PreviousState.set(this.state);
      this.PreviousState.setParams(this.stateParams);
    });

    it('should have a state', function () {
      expect(this.PreviousState.get()).toBe(this.state);
    });

    it('should have a state param', function () {
      expect(this.PreviousState.getParams()).toEqual(this.stateParams);
    });

    it('should not be valid', function () {
      expect(this.PreviousState.isValid()).toBe(false);
    });

    it('should not go to previous state', function () {
      this.PreviousState.go();
      expect(this.$state.go).not.toHaveBeenCalled();
    });
  });
});
