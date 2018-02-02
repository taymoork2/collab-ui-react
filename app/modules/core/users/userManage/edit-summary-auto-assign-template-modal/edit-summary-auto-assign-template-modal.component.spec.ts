import moduleName from './index';
import { Analytics } from 'modules/core/analytics';
import { AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.service';
import { EditSummaryAutoAssignTemplateModalComponent } from './edit-summary-auto-assign-template-modal.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';
import { LicenseSummaryModalBodyComponent } from 'modules/core/users/userManage/shared/license-summary-modal-body/license-summary-modal-body.component';

type Test = atlas.test.IComponentTest<EditSummaryAutoAssignTemplateModalComponent, {
  $q: ng.IQService;
  $scope: ng.IScope;
  Analytics: Analytics;
  AutoAssignTemplateService: AutoAssignTemplateService;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
    licenseSummaryModalBody: atlas.test.IComponentSpy<LicenseSummaryModalBodyComponent>;
  },
}>;

describe('Component: editSummaryAutoAssignTemplateModal:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
      licenseSummaryModalBody: this.spyOnComponent('licenseSummaryModalBody'),
    };
    this.initModules(
      moduleName,
      this.components.multiStepModal,
      this.components.licenseSummaryModalBody,
    );
    this.injectDependencies(
      '$scope',
      'Analytics',
      'AutoAssignTemplateService',
    );
    this.$scope.dismissSpy = jasmine.createSpy('dismissSpy');
    spyOn(this.AutoAssignTemplateService, 'getDefaultTemplate').and.returnValue(this.$q.resolve({
      templateId: 'fake-template-id',
    }));
  });

  describe('primary behaviors (view):', () => {
    beforeEach(function (this: Test) {
      this.$scope.fakeAutoAssignTemplateData = 'fake-autoAssignTemplateData';
      this.compileComponent('editSummaryAutoAssignTemplateModal', {
        dismiss: 'dismissSpy()',
        autoAssignTemplateData: 'fakeAutoAssignTemplateData',
      });
    });

    it('should track the event when the modal is dismissed', function (this: Test) {
      spyOn(this.Analytics, 'trackAddUsers');
      this.components.multiStepModal.bindings[0].dismiss();
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
      expect(this.$scope.dismissSpy).toHaveBeenCalled();
    });

    it('should pass along its "autoAssignTemplateData" to its "license-summary-modal-body"', function (this: Test) {
      expect(this.components.licenseSummaryModalBody.bindings[0].autoAssignTemplateData).toBe('fake-autoAssignTemplateData');
    });
  });

  describe('save():', () => {
    beforeEach(function (this: Test) {
      this.autoAssignTemplateData = {};
      spyOn(this.AutoAssignTemplateService, 'autoAssignTemplateDataToPayload').and.returnValue('fake-autoAssignTemplateDataToPayload-result');
      spyOn(this.AutoAssignTemplateService, 'createTemplate').and.returnValue(this.$q.resolve({}));
      spyOn(this.AutoAssignTemplateService, 'updateTemplate').and.returnValue(this.$q.resolve({}));
    });

    it('should call saveTemplate if isEditTemplateMode is false', function (this: Test) {
      this.compileComponent('editSummaryAutoAssignTemplateModal', {
        dismiss: 'dismissSpy()',
        autoAssignTemplateData: this.autoAssignTemplateData,
        isEditTemplateMode: false,
      });
      this.components.multiStepModal.bindings[0].save();
      expect(this.AutoAssignTemplateService.createTemplate).toHaveBeenCalledWith('fake-autoAssignTemplateDataToPayload-result');
    });

    it('should call updateTemplate if isEditTemplateMode is true', function (this: Test) {
      this.compileComponent('editSummaryAutoAssignTemplateModal', {
        dismiss: 'dismissSpy()',
        autoAssignTemplateData: this.autoAssignTemplateData,
        isEditTemplateMode: true,
      });
      this.components.multiStepModal.bindings[0].save();
      expect(this.AutoAssignTemplateService.updateTemplate).toHaveBeenCalledWith('fake-template-id', 'fake-autoAssignTemplateDataToPayload-result');
    });
  });
});
