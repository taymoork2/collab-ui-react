import moduleName from './index';
import { CrOnboardUsersController } from './cr-onboard-users.component';

type Test = atlas.test.IComponentTest<CrOnboardUsersController, {}, {}>;

describe('Component: crOnboardUsers:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
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
  // describe('primary behaviors (controller):', () => {
  //   ...
  // });
});
