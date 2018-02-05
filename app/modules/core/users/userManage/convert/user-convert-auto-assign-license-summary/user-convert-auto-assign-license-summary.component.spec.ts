import moduleName from './index';
import { UserConvertAutoAssignLicenseSummaryController } from './user-convert-auto-assign-license-summary.component';

import { LicenseSummaryModalBodyComponent } from 'modules/core/users/userManage/shared/license-summary-modal-body/license-summary-modal-body.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';

type Test = atlas.test.IComponentTest<UserConvertAutoAssignLicenseSummaryController, {
  $state: ng.ui.IStateService,
}, {
  components: {
    licenseSummaryModalBody: atlas.test.IComponentSpy<LicenseSummaryModalBodyComponent>,
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>,
  },
}>;

describe('Component: userManageDirSyncAutoAssignLicenseSummary:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      licenseSummaryModalBody: this.spyOnComponent('licenseSummaryModalBody'),
      multiStepModal: this.spyOnComponent('multiStepModal'),
    };
    this.initModules(
      moduleName,
      this.components.licenseSummaryModalBody,
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
    it('should bind title, header, and description keys to multi-step-modal and license-summary-modal-body', function (this: Test) {
      expect(this.components.multiStepModal.bindings[0].l10nTitle).toEqual('homePage.convertUsers');
      expect(this.components.licenseSummaryModalBody.bindings[0].titleKey).toEqual('userManage.autoAssignLicenseSummaryForConvert.header');
      expect(this.components.licenseSummaryModalBody.bindings[0].descriptionKey).toEqual('userManage.autoAssignLicenseSummaryForConvert.description');
      expect(this.components.licenseSummaryModalBody.bindings[0].autoAssignTemplateData).toBeUndefined();
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
