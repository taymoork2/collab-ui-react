import moduleName from './index';
import { AutoAssignLicenseSummaryController } from './auto-assign-license-summary.component';

import { AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template';
import { LicenseSummaryComponent } from 'modules/core/users/userManage/shared/license-summary/license-summary.component';

type Test = atlas.test.IComponentTest<AutoAssignLicenseSummaryController, {
  AutoAssignTemplateService: AutoAssignTemplateService,
}, {
  components: {
    licenseSummary: atlas.test.IComponentSpy<LicenseSummaryComponent>,
  },
  stateDataDeferred: ng.IDeferred<any>,
}>;

describe('Component: userManageDirSyncAutoAssignLicenseSummary:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      licenseSummary: this.spyOnComponent('licenseSummary'),
    };
    this.initModules(
      moduleName,
      this.components.licenseSummary,
    );
    this.injectDependencies(
      'AutoAssignTemplateService',
    );
    this.stateDataDeferred = this.$q.defer();
    spyOn(this.AutoAssignTemplateService, 'getDefaultStateData').and.returnValue(this.stateDataDeferred.promise);
  });

  beforeEach(function (this: Test) {
    this.compileComponent('userManageDirSyncAutoAssignLicenseSummary', {});
  });

  describe('primary behaviors (view):', () => {
    enum View {
      LOADING_SPINNER = '.icon-spinner.user-manage-dir-sync-auto-assign-license-summary__icon-spinner--large',
      LICENSE_SUMMARY = 'license-summary.user-manage-dir-sync-auto-assign-license-summary__license-summary',
    }

    it('should show loading before license-summary loads with autoAssignTemplateData', function (this: Test) {
      expect(this.view.find(View.LOADING_SPINNER)).toExist();
      expect(this.view.find(View.LICENSE_SUMMARY)).not.toExist();

      const autoAssignTemplateData = {
        some: 'data',
      };
      this.stateDataDeferred.resolve(autoAssignTemplateData);
      this.$scope.$apply();

      expect(this.view.find(View.LOADING_SPINNER)).not.toExist();
      expect(this.view.find(View.LICENSE_SUMMARY)).toExist();
      expect(this.components.licenseSummary.bindings[0].autoAssignTemplateData).toEqual(autoAssignTemplateData);
    });
  });
});
