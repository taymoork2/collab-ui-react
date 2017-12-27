import moduleName from './index';
import { OnboardSummaryForAutoAssignModalController } from './onboard-summary-for-auto-assign-modal.component';

type Test = atlas.test.IComponentTest<OnboardSummaryForAutoAssignModalController, {}, {}>;

describe('Component: onboardSummaryForAutoAssignModal:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<onboard-summary-for-auto-assign-modal></onboard-summary-for-auto-assign-modal>');
    // this.compileComponent('onboardSummaryForAutoAssignModal', {});
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
