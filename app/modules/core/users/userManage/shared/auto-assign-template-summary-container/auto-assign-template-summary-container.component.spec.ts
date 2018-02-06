import moduleName from './index';
import { AutoAssignTemplateSummaryContainerController } from './auto-assign-template-summary-container.component';

import { AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template';
import { AutoAssignTemplateSummaryComponent } from 'modules/core/users/userManage/shared/auto-assign-template-summary/auto-assign-template-summary.component';

type Test = atlas.test.IComponentTest<AutoAssignTemplateSummaryContainerController, {
  AutoAssignTemplateService: AutoAssignTemplateService,
}, {
  components: {
    autoAssignTemplateSummary: atlas.test.IComponentSpy<AutoAssignTemplateSummaryComponent>,
  },
  getDefaultStateDataDeferred: ng.IDeferred<any>,
}>;

describe('Component: autoAssignTemplateSummaryContainer:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      autoAssignTemplateSummary: this.spyOnComponent('autoAssignTemplateSummary'),
    };
    this.initModules(
      moduleName,
      this.components.autoAssignTemplateSummary,
    );
    this.injectDependencies(
      'AutoAssignTemplateService',
    );
    this.getDefaultStateDataDeferred = this.$q.defer();
    spyOn(this.AutoAssignTemplateService, 'getDefaultStateData').and.returnValue(this.getDefaultStateDataDeferred.promise);
  });

  describe('primary behaviors (view):', () => {
    enum View {
      LOADING_SPINNER = '.text-center .icon.icon-5x.icon-spinner',
      LICENSE_SUMMARY = 'auto-assign-template-summary',
      TITLE = 'h4.auto-assign-template-summary-container__title',
      DESCRIPTION = 'p.auto-assign-template-summary-container__description',
    }

    describe('with initial autoAssignTemplateData', () => {
      it('should immediately show auto-assign-template-summary without needing to load data', function (this: Test) {
        this.$scope.myAutoAssignTemplateData = 'fake-auto-assign-template-data';
        this.compileComponent('autoAssignTemplateSummaryContainer', {
          titleKey: 'my-title-key',
          descriptionKey: 'my-description-key',
          autoAssignTemplateData: 'myAutoAssignTemplateData',
        });

        expect(this.view.find(View.TITLE)).toContainText('my-title-key');
        expect(this.view.find(View.DESCRIPTION)).toContainText('my-description-key');

        expect(this.view.find(View.LOADING_SPINNER)).not.toExist();
        expect(this.view.find(View.LICENSE_SUMMARY)).toExist();

        expect(this.AutoAssignTemplateService.getDefaultStateData).not.toHaveBeenCalled();
        expect(this.components.autoAssignTemplateSummary.bindings[0].autoAssignTemplateData).toBe('fake-auto-assign-template-data');
      });
    });

    describe('without initial autoAssignTemplateData', () => {
      it('should show loading before auto-assign-template-summary loads with autoAssignTemplateData', function (this: Test) {
        this.compileComponent('autoAssignTemplateSummaryContainer', {
          titleKey: 'my-title-key',
          descriptionKey: 'my-description-key',
          autoAssignTemplateData: 'myAutoAssignTemplateData',
        });

        expect(this.view.find(View.TITLE)).toContainText('my-title-key');
        expect(this.view.find(View.DESCRIPTION)).toContainText('my-description-key');

        expect(this.view.find(View.LOADING_SPINNER)).toExist();
        expect(this.view.find(View.LICENSE_SUMMARY)).not.toExist();

        expect(this.AutoAssignTemplateService.getDefaultStateData).toHaveBeenCalled();
        this.getDefaultStateDataDeferred.resolve('fake-auto-assign-template-data');
        this.$scope.$apply();

        expect(this.view.find(View.LOADING_SPINNER)).not.toExist();
        expect(this.view.find(View.LICENSE_SUMMARY)).toExist();
        expect(this.components.autoAssignTemplateSummary.bindings[0].autoAssignTemplateData).toBe('fake-auto-assign-template-data');
      });
    });
  });
});
