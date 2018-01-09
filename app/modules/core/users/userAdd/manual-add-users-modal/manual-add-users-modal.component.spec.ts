import moduleName from './index';
import { ManualAddUsersModalController } from './manual-add-users-modal.component';

type Test = atlas.test.IComponentTest<ManualAddUsersModalController, {}, {}>;

describe('Component: manualAddUsersModal:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<manual-add-users-modal></manual-add-users-modal>');
    // this.compileComponent('manualAddUsersModal', {});
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
