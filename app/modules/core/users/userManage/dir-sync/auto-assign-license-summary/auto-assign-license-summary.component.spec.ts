import moduleName from './index';
import { AutoAssignLicenseSummaryController } from './auto-assign-license-summary.component';

type Test = atlas.test.IComponentTest<AutoAssignLicenseSummaryController, {}, {}>;

describe('Component: userManageDirSyncAutoAssignLicenseSummary:', () => {
  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      // TODO: add dependencies here
    );
  });

  // TODO: use as-appropriate
  beforeEach(function (this: Test) {
    // this.compileTemplate('<user-manage-dir-sync-auto-assign-license-summary></user-manage-dir-sync-auto-assign-license-summary>');
    // this.compileComponent('autoAssignLicenseSummary', {});
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
