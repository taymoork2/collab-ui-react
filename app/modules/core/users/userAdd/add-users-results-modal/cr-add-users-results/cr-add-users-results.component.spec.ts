import moduleName from './index';
import { CrAddUsersResultsController } from './cr-add-users-results.component';

type Test = atlas.test.IComponentTest<CrAddUsersResultsController, {}, {}>;

describe('Component: crAddUsersResults:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<cr-add-users-results></cr-add-users-results>');
    // this.compileComponent('crAddUsersResults', {});
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
