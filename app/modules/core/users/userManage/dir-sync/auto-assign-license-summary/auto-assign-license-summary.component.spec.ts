import moduleName from './index';
import { AutoAssignLicenseSummaryController } from './auto-assign-license-summary.component';

import { AutoAssignTemplateSummaryContainerComponent } from 'modules/core/users/userManage/shared/auto-assign-template-summary-container/auto-assign-template-summary-container.component';

type Test = atlas.test.IComponentTest<AutoAssignLicenseSummaryController, {
}, {
  components: {
    autoAssignTemplateSummaryContainer: atlas.test.IComponentSpy<AutoAssignTemplateSummaryContainerComponent>,
  },
}>;

describe('Component: userManageDirSyncAutoAssignLicenseSummary:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      autoAssignTemplateSummaryContainer: this.spyOnComponent('autoAssignTemplateSummaryContainer'),
    };
    this.initModules(
      moduleName,
      this.components.autoAssignTemplateSummaryContainer,
    );
    this.compileComponent('userManageDirSyncAutoAssignLicenseSummary', {});
  });

  describe('primary behaviors (view):', () => {
    it('should bind header and description keys to auto-assign-template-summary-container', function (this: Test) {
      expect(this.components.autoAssignTemplateSummaryContainer.bindings[0].titleKey).toBe('userManage.autoAssignLicenseSummaryForDirSync.header');
      expect(this.components.autoAssignTemplateSummaryContainer.bindings[0].descriptionKey).toBe('userManage.autoAssignLicenseSummaryForDirSync.description');
      expect(this.components.autoAssignTemplateSummaryContainer.bindings[0].autoAssignTemplateData).not.toBeDefined();
    });
  });
});
