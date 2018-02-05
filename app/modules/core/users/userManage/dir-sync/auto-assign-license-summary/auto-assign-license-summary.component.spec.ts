import moduleName from './index';
import { AutoAssignLicenseSummaryController } from './auto-assign-license-summary.component';

import { LicenseSummaryModalBodyComponent } from 'modules/core/users/userManage/shared/license-summary-modal-body/license-summary-modal-body.component';

type Test = atlas.test.IComponentTest<AutoAssignLicenseSummaryController, {
}, {
  components: {
    licenseSummaryModalBody: atlas.test.IComponentSpy<LicenseSummaryModalBodyComponent>,
  },
}>;

describe('Component: userManageDirSyncAutoAssignLicenseSummary:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      licenseSummaryModalBody: this.spyOnComponent('licenseSummaryModalBody'),
    };
    this.initModules(
      moduleName,
      this.components.licenseSummaryModalBody,
    );
    this.compileComponent('userManageDirSyncAutoAssignLicenseSummary', {});
  });

  describe('primary behaviors (view):', () => {
    it('should bind header and description keys to license-summary-modal-body', function (this: Test) {
      expect(this.components.licenseSummaryModalBody.bindings[0].titleKey).toBe('userManage.autoAssignLicenseSummaryForDirSync.header');
      expect(this.components.licenseSummaryModalBody.bindings[0].descriptionKey).toBe('userManage.autoAssignLicenseSummaryForDirSync.description');
      expect(this.components.licenseSummaryModalBody.bindings[0].autoAssignTemplateData).not.toBeDefined();
    });
  });
});
