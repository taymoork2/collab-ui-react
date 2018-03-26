import moduleName from './index';
import { FirstTimeCallingController } from './first-time-calling.component';

type Test = atlas.test.IComponentTest<FirstTimeCallingController, {}, {}>;

describe('Component: firstTimeCalling:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<first-time-calling></first-time-calling>');
    // this.compileComponent('firstTimeCalling', {});
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
