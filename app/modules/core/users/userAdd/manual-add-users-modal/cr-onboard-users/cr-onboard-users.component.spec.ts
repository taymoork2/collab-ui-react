import moduleName from './index';
import { CrOnboardUsersController } from './cr-onboard-users.component';

type Test = atlas.test.IComponentTest<CrOnboardUsersController, {}, {}>;

describe('Component: crOnboardUsers:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<cr-onboard-users></cr-onboard-users>');
    // this.compileComponent('crOnboardUsers', {});
  });

  describe('primary behaviors (view):', () => {
    it('...', function (this: Test) {
      // TODO: implement
    });
  });

  describe('primary behaviors (controller):', () => {
    it('...', function (this: Test) {
      // TODO: implement
    });
  });
});
