import moduleName from './index';
import { AddUsersResultsModalController } from './add-users-results-modal.component';

type Test = atlas.test.IComponentTest<AddUsersResultsModalController, {}, {}>;

describe('Component: addUsersResultsModal:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<add-users-results-modal></add-users-results-modal>');
    // this.compileComponent('addUsersResultsModal', {});
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
