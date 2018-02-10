import moduleName from './index';
import { Analytics } from 'modules/core/analytics';
import { AssignableServicesComponent } from 'modules/core/users/userAdd/assignable-services/assignable-services.component';
import { AutoAssignTemplateService } from 'modules/core/users/shared/auto-assign-template';
import { EditAutoAssignTemplateModalController } from './edit-auto-assign-template-modal.component';
import { HybridServicesEntitlementsPanelComponent } from 'modules/core/users/userAdd/hybrid-services-entitlements-panel/hybrid-services-entitlements-panel.component';

type Test = atlas.test.IComponentTest<EditAutoAssignTemplateModalController, {
  $httpBackend: ng.IHttpBackendService,
  $q: ng.IQService,
  $scope: ng.IScope,
  $state: ng.ui.IStateService,
  Analytics: Analytics,
  AutoAssignTemplateService: AutoAssignTemplateService,
}, {
  components: {
    assignableServices: atlas.test.IComponentSpy<AssignableServicesComponent>;
    hybridServicesEntitlementsPanel: atlas.test.IComponentSpy<HybridServicesEntitlementsPanelComponent>;
  };
}>;

describe('Component: editAutoAssignTemplateModal:', () => {
  beforeEach(function (this: Test) {
    this.components = {
      assignableServices: this.spyOnComponent('assignableServices'),
      hybridServicesEntitlementsPanel: this.spyOnComponent('hybridServicesEntitlementsPanel'),
    };
    this.initModules(
      moduleName,
      this.components.assignableServices,
      this.components.hybridServicesEntitlementsPanel,
    );
    this.injectDependencies(
      '$httpBackend',
      '$q',
      '$scope',
      '$state',
      'Analytics',
      'AutoAssignTemplateService',
    );
    this.autoAssignTemplateData = {};
    this.$scope.dismiss = _.noop;
  });

  afterEach(function (this: Test) {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('primary behaviors (view):', () => {
    beforeEach(function (this: Test) {
      spyOn(this.AutoAssignTemplateService, 'getSortedSubscriptions').and.returnValue(this.$q.resolve([]));
      this.compileComponent('editAutoAssignTemplateModal', {});
    });

    it('should always render a title, a header, a description, and a tooltip', function (this: Test) {
      expect(this.view.find('.modal-header > h3[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.title');
      expect(this.view.find('.modal-body > h4[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.header');
      expect(this.view.find('.modal-body > p[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.description');
      expect(this.view.find('.modal-body > p > span[translate]').get(0)).toHaveText('userManage.autoAssignTemplate.edit.note');
      expect(this.view.find('.modal-body > p > a > i.icon-info[tooltip="userManage.autoAssignTemplate.edit.tooltip"]').length).toBe(1);
    });

    it('should always render a back and a next button', function (this: Test) {
      expect(this.view.find('button.btn.back').length).toBe(1);
      expect(this.view.find('button.btn.next').length).toBe(1);
    });

    it('should render render an "assignable-services" element', function (this: Test) {
      expect(this.view.find('assignable-services[subscriptions]').length).toBe(1);
      expect(this.view.find('assignable-services[on-update]').length).toBe(1);
      expect(this.view.find('assignable-services[auto-assign-template-data]').length).toBe(1);
    });
  });

  describe('primary behaviors (controller):', () => {
    beforeEach(function (this: Test) {
      spyOn(this.$state, 'go');
      _.set(this.autoAssignTemplateData, 'subscriptions', []);
      spyOn(this.Analytics, 'trackAddUsers');
      spyOn(this.AutoAssignTemplateService, 'getSortedSubscriptions').and.returnValue(this.$q.resolve([]));
      this.compileComponent('editAutoAssignTemplateModal', {
        prevState: "'fake-previous-state'",
        isEditTemplateMode: true,
        autoAssignTemplateData: this.autoAssignTemplateData,
        dismiss: 'dismiss',
      });
    });

    it('should navigate to previous state when back button is clicked', function (this: Test) {
      this.view.find('button.btn.back').click();
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.picker');
    });

    it('should navigate to the next state when next button is clicked', function (this: Test) {
      this.view.find('button.btn.next').click();
      expect(this.$state.go).toHaveBeenCalledWith('users.manage.edit-summary-auto-assign-template-modal', {
        autoAssignTemplateData: this.autoAssignTemplateData,
        isEditTemplateMode: true,
      });
    });

    it('should track the event when the modal is dismissed', function (this: Test) {
      this.view.find('button.close[aria-label="common.close"]').click();
      expect(this.Analytics.trackAddUsers).toHaveBeenCalledWith(this.Analytics.eventNames.CANCEL_MODAL);
    });

    it('isHybridCallSelected should be true if squaredFusionUC.isSelected is true and call license should be disabled', function () {
      this.$scope.fakePrevState = 'fake-prev-state';
      _.set(this.autoAssignTemplateData, 'viewData.USER_ENTITLEMENT.squaredFusionUC.isSelected', true);
      _.set(this.autoAssignTemplateData, 'viewData.LICENSE', {
        isDisabled: this.controller.isHybridCallSelected,
        license: {
          offerName: 'CO',
        },
      });
      this.compileComponent('editAutoAssignTemplateModal', {
        prevState: 'fakePrevState',
        isEditTemplateMode: false,
        autoAssignTemplateData: this.autoAssignTemplateData,
        dismiss: 'dismiss',
      });
      expect(this.controller.isHybridCallSelected).toBe(true);
      expect(this.autoAssignTemplateData.viewData.LICENSE.isDisabled).toBe(true);
    });

    it('should disable huron call licenses if "recvHybridServicesEntitlementsUpdate()" is called with an active hybrid call entitlement', function () {
      this.$scope.fakePrevState = 'fake-prev-state';
      _.set(this.autoAssignTemplateData, 'viewData.LICENSE', {
        'fake-license-id-1': {
          isDisabled: false,
          license: {
            offerName: 'CO',
          },
        },
        'fake-license-id-2': {
          isDisabled: false,
          license: {
            offerName: 'CO',
          },
        },
        'fake-license-id-3': {
          isDisabled: false,
          license: {
            offerName: 'MS',
          },
        },
      });
      this.compileComponent('editAutoAssignTemplateModal', {
        autoAssignTemplateData: this.autoAssignTemplateData,
      });
      const fakeEntitlements = [{
        entitlementName: 'squaredFusionUC',
        entitlementState: 'ACTIVE',
      }];
      spyOn(this.controller, 'updateHuronCallLicenses').and.callThrough();
      this.controller.recvHybridServicesEntitlementsUpdate(fakeEntitlements);
      expect(this.controller.updateHuronCallLicenses).toHaveBeenCalled();
      expect(this.controller.autoAssignTemplateData.viewData.LICENSE['fake-license-id-1'].isDisabled).toBe(true);
      expect(this.controller.autoAssignTemplateData.viewData.LICENSE['fake-license-id-2'].isDisabled).toBe(true);
      expect(this.controller.autoAssignTemplateData.viewData.LICENSE['fake-license-id-3'].isDisabled).toBe(false);
    });
  });
});
