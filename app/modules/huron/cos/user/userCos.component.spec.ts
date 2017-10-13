import UserClassOfServiceComponent from './index';

describe('Component: UserClassOfService', () => {
  const restrictions = getJSONFixture('huron/json/cos/userCos.json');
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const USER_ID = '123456';

  beforeEach(function() {
    this.initModules(UserClassOfServiceComponent, 'Core');
    this.injectDependencies(
      '$scope',
      'UserCosService',
      '$q',
      '$resource',
      'Authinfo',
      'HuronConfig',
      'FeatureToggleService',
    );
    initDependencySpies.apply(this);
    initComponent.apply(this);

    installPromiseMatchers();
  });

  function initDependencySpies() {
    spyOn(this.UserCosService, 'getUserCos').and.returnValue(this.$q.resolve(restrictions));
    spyOn(this.UserCosService, 'updateUserCos').and.returnValue(this.$q.resolve(204));
    spyOn(this.UserCosService, 'getPremiumNumbers').and.returnValue(this.$q.resolve(['800', '900']));
    spyOn(this.Authinfo, 'getLicenseIsTrial').and.returnValue(true);
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve(true));
  }

  function initComponent() {
    this.compileComponent('ucUserCosForm', {
      memberType: 'places',
      memberId: USER_ID,
    });
  }

  describe('Class of Service for users', () => {
    beforeEach(function () {
      spyOn(this.controller, 'changeRestriction');
    });

    it('should display each cos restriction', function() {
      expect(this.view.find('.csSelect-container[name="' + restrictions.customer[0].restriction + '-restriction"]')).toExist();
      expect(this.view.find('.csSelect-container[name="' + restrictions.customer[1].restriction + '-restriction"]')).toExist();
      expect(this.view.find('.csSelect-container[name="' + restrictions.customer[2].restriction + '-restriction"]')).toExist();
      expect(this.view.find('.csSelect-container[name="' + restrictions.customer[3].restriction + '-restriction"]')).toExist();
    });

    it('should change COS, call change fn and save', function() {
      this.view.find('.csSelect-container[name="' + restrictions.customer[0].restriction + '-restriction"]').find(DROPDOWN_OPTIONS).get(2).click();
      expect(this.controller.changeRestriction).toHaveBeenCalled();
    });

    it('should have changes to save and save them', function() {
      this.controller.changedRestrictions = [{
        restriction: this.controller.PREMIUM_CALLS,
        blocked: true,
        uuid: 123456,
        selected: 'serviceSetupModal.cos.neverAllow',
      }];
      this.controller.save();
      expect(this.UserCosService.updateUserCos).toHaveBeenCalled();
    });
  });
});
