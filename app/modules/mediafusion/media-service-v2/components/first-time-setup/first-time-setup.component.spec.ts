import moduleName from './index';
import { FirstTimeSetupController } from './first-time-setup.component';

type Test = atlas.test.IComponentTest<FirstTimeSetupController, {}, {}>;

describe('Component: firstTimeSetup:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<first-time-setup></first-time-setup>');
    // this.compileComponent('firstTimeSetup', {});
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
