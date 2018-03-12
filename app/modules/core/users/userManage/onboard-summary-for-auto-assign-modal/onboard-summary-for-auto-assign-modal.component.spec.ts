import moduleName from './index';
import { Analytics } from 'modules/core/analytics';
import { Notification } from 'modules/core/notifications';
import OnboardService from 'modules/core/users/shared/onboard/onboard.service';
import { OnboardSummaryForAutoAssignModalController } from './onboard-summary-for-auto-assign-modal.component';
import { MultiStepModalComponent } from 'modules/core/shared/multi-step-modal/multi-step-modal.component';
import { AutoAssignTemplateSummaryContainerComponent } from 'modules/core/users/userManage/shared/auto-assign-template-summary-container/auto-assign-template-summary-container.component';

type Test = atlas.test.IComponentTest<OnboardSummaryForAutoAssignModalController, {
  $q: ng.IQService;
  $scope: ng.IScope;
  $state: ng.ui.IStateService;
  Analytics: Analytics;
  Notification: Notification;
  OnboardService: OnboardService;
}, {
  components: {
    multiStepModal: atlas.test.IComponentSpy<MultiStepModalComponent>;
    autoAssignTemplateSummaryContainer: atlas.test.IComponentSpy<AutoAssignTemplateSummaryContainerComponent>;
  },
}>;

describe('Component: onboardSummaryForAutoAssignModal:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      multiStepModal: this.spyOnComponent('multiStepModal'),
      autoAssignTemplateSummaryContainer: this.spyOnComponent('autoAssignTemplateSummaryContainer'),
    };
    this.initModules(
      moduleName,
      this.components.multiStepModal,
      this.components.autoAssignTemplateSummaryContainer,
    );
    this.injectDependencies(
      '$q',
      '$scope',
      '$state',
      'Analytics',
      'Notification',
      'OnboardService',
    );
    this.$scope.fakeAutoAssignTemplateData = {};
    this.$scope.fakeUserList = [];
  });

  function initComponent(this: Test) {
    this.compileComponent('onboardSummaryForAutoAssignModal', {
      autoAssignTemplateData: 'fakeAutoAssignTemplateData',
      userList: 'fakeUserList',
    });
  }

  describe('initial state:', () => {
    it('should have a title', function (this: Test) {
      initComponent.call(this);
      expect(this.components.multiStepModal.bindings[0].l10nTitle).toBe('onboardSummaryForAutoAssignModal.title');
    });

    it('should provide back, save, and dismiss functionality', function (this: Test) {
      initComponent.call(this);
      spyOn(this.controller, 'dismissModal');
      this.components.multiStepModal.bindings[0].dismiss();
      expect(this.controller.dismissModal).toHaveBeenCalled();

      spyOn(this.controller, 'back');
      this.components.multiStepModal.bindings[0].back();
      expect(this.controller.back).toHaveBeenCalled();

      spyOn(this.controller, 'save');
      this.components.multiStepModal.bindings[0].save();
      expect(this.controller.save).toHaveBeenCalled();
    });

    it('should pass along its "autoAssignTemplateData" to its "auto-assign-template-summary-container"', function (this: Test) {
      this.$scope.fakeAutoAssignTemplateData = 'fake-autoAssignTemplateData';
      initComponent.call(this);
      expect(this.components.autoAssignTemplateSummaryContainer.bindings[0].autoAssignTemplateData).toBe('fake-autoAssignTemplateData');
    });
  });

  describe('primary behaviors (controller):', () => {
    describe('dismissModal():', () => {
      it('should track the event', function (this: Test) {
        spyOn(this.Analytics, 'trackAddUsers');
        initComponent.call(this);
        this.controller.dismissModal();
        expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
      });
    });

    describe('back():', () => {
      it('should go back to "users.add.manual" state passing along its "autoAssignTemplateData"', function (this: Test) {
        this.$scope.fakeAutoAssignTemplateData = 'fake-autoAssignTemplateData';
        spyOn(this.$state, 'go');
        initComponent.call(this);
        this.controller.back();
        expect(this.$state.go).toHaveBeenCalledWith('users.add.manual', {
          autoAssignTemplateData: 'fake-autoAssignTemplateData',
        });
      });
    });

    describe('save():', () => {
      it('should make an onboard API call passing its user list with empty lists for both entitlements and licenses', function (this: Test) {
        this.$scope.fakeUserList = ['fake-user-1'];
        spyOn(this.OnboardService, 'onboardUsersInChunks').and.returnValue(this.$q.resolve('fake-aggregateResult'));
        spyOn(this.$state, 'go');
        initComponent.call(this);
        this.controller.save();
        this.$scope.$apply();
        expect(this.OnboardService.onboardUsersInChunks).toHaveBeenCalledWith(['fake-user-1'], [], [], 'MANUAL');
        expect(this.$state.go).toHaveBeenCalledWith('users.add.results', 'fake-aggregateResult');
      });

      it('should notify and reject if onboard API call rejects', function (this: Test) {
        this.$scope.fakeUserList = ['fake-user-1'];
        spyOn(this.Notification, 'errorResponse');
        initComponent.call(this);
        spyOn(this.OnboardService, 'onboardUsersInChunks').and.returnValue(this.$q.reject('fake-reject-response'));
        this.controller.save().catch(_.noop);
        this.$scope.$apply();
        expect(this.Notification.errorResponse).toHaveBeenCalledWith('fake-reject-response');
      });
    });
  });
});
