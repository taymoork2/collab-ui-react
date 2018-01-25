import { OnboardCtrlBoundUIStates } from 'modules/core/users/userAdd/shared/onboard.store';

import testModule from './index';

describe('Controller: UserManageEmailSuppressController', function () {

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$rootScope', '$scope', '$state', '$stateParams', '$controller', '$q', 'Analytics', 'Orgservice');

    spyOn(this.Orgservice, 'getAdminOrgAsPromise').and.returnValue(this.$q.resolve({ data: { success: true, isOnBoardingEmailSuppressed: true, licenses: [{ licenseId: 'CO_1234' }] } }));
    spyOn(this.Analytics, 'trackAddUsers');
    spyOn(this.$state, 'go');
  });

  function initController(injectors) {
    this.controller = this.$controller('UserManageEmailSuppressController', _.merge({
      $scope: this.$scope,
    }, injectors));
    this.$scope.$apply();
    this.controller.$onInit();
    this.$scope.$apply();
  }

  ////////////////////////////

  describe ('when initialized', function () {
    beforeEach(function () {
      initController.apply(this);
    });
    it('should init with expected responses and default values', function () {
      expect(this.controller.isEmailSuppressed).toBeTruthy();
      expect(this.controller.isSparkCallEnabled).toBeTruthy();
      expect(this.controller.dataLoaded).toBeTruthy();
    });
  });

  describe ('when calling onNext()', function () {
    it('should go to users.add on next', function () {
      initController.apply(this, [{
        $stateParams: {
          manageType: 'manual',
          prevState: 'users.manage.org',
        },
      }]);
      this.controller.onNext();
      expect(this.$state.go).toHaveBeenCalledWith('users.add.manual', {
        resetOnboardStoreStates: OnboardCtrlBoundUIStates.ALL,
      });
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.NEXT, this.Analytics.sections.ADD_USERS.uploadMethods.MANUAL);
    });
  });

  describe ('when calling onBack()', function () {
    it('should go to users.manage.org on back', function () {
      initController.apply(this, [{
        $stateParams: {
          manageType: 'manual',
          prevState: 'users.manage.org',
        },
      }]);
      this.controller.onBack();
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.org');
    });
  });
});
