import moduleName from './index';
import { UserConvertAutoAssignLicenseSummaryController } from './user-convert-auto-assign-license-summary.component';

import { AutoAssignTemplateSummaryContainerComponent } from 'modules/core/users/userManage/shared/auto-assign-template-summary-container/auto-assign-template-summary-container.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';

type Test = atlas.test.IComponentTest<UserConvertAutoAssignLicenseSummaryController, {
  $state: ng.ui.IStateService,
}, {
  components: {
    autoAssignTemplateSummaryContainer: atlas.test.IComponentSpy<AutoAssignTemplateSummaryContainerComponent>,
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>,
  },
}>;

describe('Component: userManageDirSyncAutoAssignLicenseSummary:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      autoAssignTemplateSummaryContainer: this.spyOnComponent('autoAssignTemplateSummaryContainer'),
      multiStepModal: this.spyOnComponent('multiStepModal'),
    };
    this.initModules(
      moduleName,
      this.components.autoAssignTemplateSummaryContainer,
      this.components.multiStepModal,
    );
    this.injectDependencies(
      '$state',
    );
    this.$scope.dismissSpy = jasmine.createSpy('dismissSpy');
    this.compileComponent('userConvertAutoAssignLicenseSummary', {
      dismiss: 'dismissSpy()',
    });

    spyOn(this.$state, 'go');
  });

  describe('primary behaviors (view):', () => {
    it('should bind title, header, and description keys to multi-step-modal and auto-assign-template-summary-container', function (this: Test) {
      expect(this.components.multiStepModal.bindings[0].l10nTitle).toBe('homePage.convertUsers');
      expect(this.components.autoAssignTemplateSummaryContainer.bindings[0].titleKey).toBe('userManage.autoAssignLicenseSummaryForConvert.header');
      expect(this.components.autoAssignTemplateSummaryContainer.bindings[0].descriptionKey).toBe('userManage.autoAssignLicenseSummaryForConvert.description');
      expect(this.components.autoAssignTemplateSummaryContainer.bindings[0].autoAssignTemplateData).not.toBeDefined();
    });

    it('should navigate back to users.convert', function (this: Test) {
      this.components.multiStepModal.bindings[0].back();
      expect(this.$state.go).toHaveBeenCalledWith('users.convert');
    });

    it('should navigate forward and convert users', function (this: Test) {
      spyOn(this.controller, 'save');
      this.components.multiStepModal.bindings[0].save();
      expect(this.controller.save).toHaveBeenCalled(); // TODO replace with functionality
    });

    it('should dismiss and invoke the output binding', function (this: Test) {
      this.components.multiStepModal.bindings[0].dismiss();
      expect(this.$scope.dismissSpy).toHaveBeenCalled();
    });
  });
});
