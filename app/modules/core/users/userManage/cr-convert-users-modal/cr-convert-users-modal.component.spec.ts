import moduleName from './index';
import { CrConvertUsersModalController } from './cr-convert-users-modal.component';

type Test = atlas.test.IComponentTest<CrConvertUsersModalController, {}, {}>;

describe('Component: crConvertUsersModal:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<cr-convert-users-modal></cr-convert-users-modal>');
    // this.compileComponent('crConvertUsersModal', {});
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
