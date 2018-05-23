import moduleName from './index';
import { CrOnboardUsersController } from './cr-onboard-users.component';

type Test = atlas.test.IComponentTest<CrOnboardUsersController, {
  AutoAssignTemplateModel;
  OnboardService;
  UserListService;
}, {}>;

describe('Component: crOnboardUsers:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$q',
      '$scope',
      'AutoAssignTemplateModel',
      'OnboardService',
      'UserListService',
    );
  });

  beforeEach(function (this: Test) {
    this.compileComponent('crOnboardUsers', {});
  });

  describe('primary behaviors (view):', () => {
    it('should render a form', function (this: Test) {
      expect(this.view.find('form.onboard-users').length).toBe(1);
    });

    it('should render a radio button list', function (this: Test) {
      expect(this.view.find('cs-radiolist[options="$ctrl.userInputOptions"]').length).toBe(1);
    });

    it('should render a token field widget regardless of which radio button is selected', function (this: Test) {
      const CS_RADIO_LIST = 'cs-radiolist[options="$ctrl.userInputOptions"]';
      const OPTION_0 = `${CS_RADIO_LIST} input[type="radio"][value="0"]`;
      const OPTION_1 = `${CS_RADIO_LIST} input[type="radio"][value="1"]`;
      this.view.find(`${OPTION_0}`).click();
      expect(this.view.find('input.token-input[tokens="$ctrl.model.userList"]').length).toBe(1);
      this.view.find(`${OPTION_1}`).click();
      expect(this.view.find('input.token-input[tokens="$ctrl.model.userList"]').length).toBe(1);
    });
  });

  // TODO (mipark2): add unit-tests for controller methods
  describe('primary behaviors (controller):', () => {
    describe('validateProposedUser():', () => {
      beforeEach(function () {
        this.fakeProposedUser = {};
        _.set(this.fakeProposedUser, 'attrs.value', 'fake-new-user@example.com');

        this.compileComponent('crOnboardUsers', {});
      });

      it('should do nothing if not in dir sync mode and default auto-assign template is not activated', function() {
        spyOn(this.UserListService, 'queryUser');

        // neither dir sync mode, or default auto-assign template is activated
        this.controller.isDirSyncEnabled = false;
        this.controller.isDefaultAutoAssignTemplateActivated = false;
        this.controller.validateProposedUser(this.fakeProposedUser);
        this.$scope.$apply();

        expect(this.UserListService.queryUser).not.toHaveBeenCalled();
      });

      it('should increment count of invalid dir sync users, and call "updateForInvalidUser()" if proposed user does not exist', function() {
        spyOn(this.UserListService, 'queryUser').and.returnValue(this.$q.reject());
        spyOn(this.controller, 'updateForInvalidUser');
        expect(this.controller.scopeData.invalidDirSyncUsersCount).toBe(0);

        // dir sync mode
        this.controller.isDirSyncEnabled = true;
        this.controller.isDefaultAutoAssignTemplateActivated = false;
        this.controller.validateProposedUser(this.fakeProposedUser);
        this.$scope.$apply();

        expect(this.UserListService.queryUser).toHaveBeenCalledWith('fake-new-user@example.com');
        expect(this.controller.updateForInvalidUser).toHaveBeenCalledWith(this.fakeProposedUser);
        expect(this.controller.scopeData.invalidDirSyncUsersCount).toBe(1);
      });

      it('should increment count of invalid new users, and call "updateForInvalidUser()" if proposed user exists', function() {
        spyOn(this.UserListService, 'queryUser').and.returnValue(this.$q.resolve({ userName: 'fake-new-user@example.com' }));
        spyOn(this.controller, 'updateForInvalidUser');
        expect(this.controller.scopeData.invalidNewUserCount).toBe(0);

        // default auto-assign template is activated
        this.controller.isDirSyncEnabled = false;
        this.controller.isDefaultAutoAssignTemplateActivated = true;
        this.controller.validateProposedUser(this.fakeProposedUser);
        this.$scope.$apply();

        expect(this.UserListService.queryUser).toHaveBeenCalledWith('fake-new-user@example.com');
        expect(this.controller.updateForInvalidUser).toHaveBeenCalledWith(this.fakeProposedUser);
        expect(this.controller.scopeData.invalidNewUserCount).toBe(1);
      });
    });
  });
});
