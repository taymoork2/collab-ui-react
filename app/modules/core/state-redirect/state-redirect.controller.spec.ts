import moduleName from './index';

describe('Controller: StateRedirectCtrl', function () {
  beforeEach(function () {
    this.initModules(moduleName);
    this.injectDependencies(
      '$controller',
      'Auth',
      'PreviousState',
    );
    this.initSpies = (spies: {
      isValid?,
    } = {}) => {
      const {
        isValid = false,
      } = spies;
      spyOn(this.Auth, 'logout');
      spyOn(this.PreviousState, 'isValid').and.returnValue(isValid);
      spyOn(this.PreviousState, 'go');
    };
    this.initController = () => {
      this.controller = this.$controller('StateRedirectCtrl', {
        $scope: this.$scope,
      });
    };
  });

  describe('Has a valid previous state', function () {
    beforeEach(function () {
      this.initSpies({
        isValid: true,
      });
      this.initController();
    });

    it('should have a previous state', function () {
      expect(this.controller.hasPreviousState).toBe(true);
    });

    it('should not be loading on init', function () {
      expect(this.controller.loading).toBe(false);
    });

    it('should go to previous state on performRedirect()', function () {
      this.controller.performRedirect();
      this.$scope.$apply();

      expect(this.PreviousState.go).toHaveBeenCalled();
    });

    it('should logout on logout()', function () {
      this.controller.logout();
      this.$scope.$apply();

      expect(this.Auth.logout).toHaveBeenCalled();
      expect(this.controller.loading).toBe(true);
    });
  });

  describe('Has an invalid previous state', function () {
    beforeEach(function () {
      this.initSpies();
      this.initController();
    });

    it('should not have a previous state', function () {
      expect(this.controller.hasPreviousState).toBe(false);
    });

    it('should not be loading on init', function () {
      expect(this.controller.loading).toBe(false);
    });

    it('should logout on performRedirect()', function () {
      this.controller.performRedirect();
      this.$scope.$apply();

      expect(this.Auth.logout).toHaveBeenCalled();
      expect(this.controller.loading).toBe(true);
    });

    it('should logout on logout()', function () {
      this.controller.logout();
      this.$scope.$apply();

      expect(this.Auth.logout).toHaveBeenCalled();
      expect(this.controller.loading).toBe(true);
    });
  });
});
