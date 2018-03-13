import moduleName from './index';
import { SipDestinationInputController } from './sip-destination-input.component';

type Test = atlas.test.IComponentTest<SipDestinationInputController, {}, {}>;

describe('Component: sipDestinationInput:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<sip-destination-input></sip-destination-input>');
    // this.compileComponent('sipDestinationInput', {});
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
