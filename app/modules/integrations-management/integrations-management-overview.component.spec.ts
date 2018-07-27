import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
import moduleName from './index';
import { IntegrationsManagementOverview } from './integrations-management-overview.component';
import { IntegrationsManagementFakeService } from './integrations-management.fake-service';
import { IApplicationUsage, ICustomPolicy, PolicyAction, PolicyType } from './integrations-management.types';

type Test = atlas.test.IComponentTest<IntegrationsManagementOverview, {
  IntegrationsManagementFakeService: IntegrationsManagementFakeService,
  ModalService: IToolkitModalService,
  Notification: Notification,
}>;

const View = {
  heading: {
    title: '.header-title',
    subTitle: '.header-sub-info .user-info-1',
  },
  buttons: {
    save: 'cs-sp-buttons .btn-primary',
    cancel: 'cs-sp-buttons .btn-default',
  },
  features: {
    detailLink: '.feature-list .feature:nth-child(1)',
    userAdoption: '.feature-list .feature:nth-child(2)',
    userAccess: '.feature-list .feature:nth-child(3)',
  },
  controls: {
    userAccess: 'input#custom-policy',
    radioAll: 'input#custom-policy-all',
    radioSpecific: 'input#custom-policy-specific',
    specificUsers: 'integrations-management-tokens',
  },
};

describe('Component: integrationsManagementOverview', () => {
  beforeEach(function (this: Test) {
    this.initModules(
      moduleName,
      this.spyOnComponent('csSpHeader', {
        require: '',
      }),
      this.spyOnComponent('csSpButtons'),
      this.spyOnComponent('csSpContainer'),
      this.spyOnComponent('sectionTitle'),
    );
    this.injectDependencies(
      'IntegrationsManagementFakeService',
      'ModalService',
      'Notification',
    );
    this.initSpies = (spies: {
      getIntegration?,
      getCustomPolicy?,
      createCustomPolicy?,
      updateCustomPolicy?,
      deleteCustomPolicy?,
      revokeTokensForIntegration?,
      modalResult?,
    } = {}) => {
      const {
        getIntegration = this.$q.resolve(applicationUsage),
        getCustomPolicy = this.$q.resolve(customPolicy),
        createCustomPolicy = this.$q.resolve(),
        updateCustomPolicy = this.$q.resolve(),
        deleteCustomPolicy = this.$q.resolve(),
        revokeTokensForIntegration = this.$q.resolve(),
        modalResult = this.$q.resolve(),
      } = spies;
      spyOn(this.IntegrationsManagementFakeService, 'getIntegration').and.returnValue(getIntegration);
      spyOn(this.IntegrationsManagementFakeService, 'getCustomPolicy').and.returnValue(getCustomPolicy);
      spyOn(this.IntegrationsManagementFakeService, 'createCustomPolicy').and.returnValue(createCustomPolicy);
      spyOn(this.IntegrationsManagementFakeService, 'updateCustomPolicy').and.returnValue(updateCustomPolicy);
      spyOn(this.IntegrationsManagementFakeService, 'deleteCustomPolicy').and.returnValue(deleteCustomPolicy);
      spyOn(this.IntegrationsManagementFakeService, 'revokeTokensForIntegration').and.returnValue(revokeTokensForIntegration);
      spyOn(this.Notification, 'success');
      spyOn(this.Notification, 'errorResponse');
      spyOn(this.ModalService, 'open').and.returnValue({ result: modalResult });
    };
    this.initComponent = (options: {
      integration?: IApplicationUsage,
      globalPolicyAction?: PolicyAction,
    } = {}) => {
      const {
        integration = {},
        globalPolicyAction = PolicyAction.DENY,
      } = options;
      this.$scope.fakeGlobalPolicyAction = globalPolicyAction;
      this.compileComponent('integrationsManagementOverview', {
        globalPolicyAction: 'fakeGlobalPolicyAction',
        integration: _.assignIn({}, applicationUsage, integration),
      });
    };
  });

  it('should have proper header values', function (this: Test) {
    this.initSpies();
    this.initComponent();
    expect(this.view.find(View.heading.title)).toHaveText('app-name');
    expect(this.view.find(View.heading.subTitle)).toHaveText('app-contact-name');
  });

  it('should have a link to integration details', function (this: Test) {
    this.initSpies();
    this.initComponent();
    expect(this.view.find(View.features.detailLink).find('a')).toHaveAttr('ui-sref', '.detail');
    expect(this.view.find(View.features.detailLink).find('a .feature-name')).toHaveText('integrations.overview.details');
  });

  it('should show user adoption count', function (this: Test) {
    this.initSpies();
    this.initComponent();
    expect(this.view.find(View.features.userAdoption).find('.feature-name')).toHaveText('integrations.overview.userAdoption');
    expect(this.view.find(View.features.userAdoption).find('.feature-details')).toHaveText('100');
  });

  it('should have initialized user access controls which can match global policy', function (this: Test) {
    this.initSpies({
      getIntegration: this.$q.resolve(_.assignIn({}, applicationUsage, { policyAction: PolicyAction.ALLOW })),
      getCustomPolicy: this.$q.resolve(_.assignIn({}, customPolicy, { action: PolicyAction.ALLOW })),
    });
    this.initComponent({
      globalPolicyAction: PolicyAction.ALLOW,
      integration: {
        policyAction: PolicyAction.ALLOW,
      },
    });
    // user access is allowed (matches global)
    expect(this.view.find(View.features.userAccess).find(View.controls.userAccess)).toBeChecked();
    expect(this.view.find(View.controls.radioAll)).not.toExist();
    expect(this.view.find(View.controls.radioSpecific)).not.toExist();
    expect(this.view.find(View.controls.specificUsers)).not.toExist();

    // user access is denied (set custom)
    this.view.find(View.controls.userAccess).click();
    expect(this.view.find(View.controls.userAccess)).not.toBeChecked();
    expect(this.view.find(View.controls.radioAll)).toExist();
    expect(this.view.find(View.controls.radioAll)).toBeChecked();
    expect(this.view.find(View.controls.radioSpecific)).toExist();
    expect(this.view.find(View.controls.radioSpecific)).not.toBeChecked();
    expect(this.view.find(View.controls.specificUsers)).not.toExist();

    // custom policy changed from All to Specific
    this.view.find(View.controls.radioSpecific).click().click(); // radio needs two click events in unit test
    expect(this.view.find(View.controls.radioAll)).not.toBeChecked();
    expect(this.view.find(View.controls.radioSpecific)).toBeChecked();
    expect(this.view.find(View.controls.specificUsers)).toExist();

    // user access is allowed (matches global)
    this.view.find(View.controls.userAccess).click();
    expect(this.view.find(View.controls.radioAll)).not.toExist();
    expect(this.view.find(View.controls.radioSpecific)).not.toExist();
    expect(this.view.find(View.controls.specificUsers)).not.toExist();
  });

  it('should have initialized user access controls which can differ from global policy', function (this: Test) {
    this.initSpies({
      getIntegration: this.$q.resolve(_.assignIn({}, applicationUsage, { policyAction: PolicyAction.ALLOW })),
      getCustomPolicy: this.$q.resolve(_.assignIn({}, customPolicy, { action: PolicyAction.ALLOW })),
    });
    this.initComponent({
      globalPolicyAction: PolicyAction.DENY,
      integration: {
        policyAction: PolicyAction.ALLOW,
      },
    });
    // user access is allowed (custom)
    expect(this.view.find(View.features.userAccess).find(View.controls.userAccess)).toBeChecked();
    expect(this.view.find(View.controls.radioAll)).toExist();
    expect(this.view.find(View.controls.radioAll)).toBeChecked();
    expect(this.view.find(View.controls.radioSpecific)).toExist();
    expect(this.view.find(View.controls.radioSpecific)).not.toBeChecked();
    expect(this.view.find(View.controls.specificUsers)).not.toExist();

    // custom policy changed from All to Specific
    this.view.find(View.controls.radioSpecific).click().click(); // radio needs two click events in unit test
    expect(this.view.find(View.controls.radioAll)).not.toBeChecked();
    expect(this.view.find(View.controls.radioSpecific)).toBeChecked();
    expect(this.view.find(View.controls.specificUsers)).toExist();

    // user access is denied (matches global)
    this.view.find(View.controls.userAccess).click();
    expect(this.view.find(View.controls.radioAll)).not.toExist();
    expect(this.view.find(View.controls.radioSpecific)).not.toExist();
    expect(this.view.find(View.controls.specificUsers)).not.toExist();
  });

  it('should have form buttons when form is changed', function (this: Test) {
    this.initSpies();
    this.initComponent();
    expect(this.view.find(View.controls.userAccess)).not.toBeChecked();
    expect(this.view.find(View.buttons.save)).not.toExist();
    expect(this.view.find(View.buttons.cancel)).not.toExist();

    // change form state
    this.view.find(View.controls.userAccess).click();
    expect(this.view.find(View.controls.userAccess)).toBeChecked();
    expect(this.view.find(View.buttons.save)).toExist();
    expect(this.view.find(View.buttons.cancel)).toExist();

    // change form back to original
    this.view.find(View.controls.userAccess).click();
    expect(this.view.find(View.controls.userAccess)).not.toBeChecked();
    expect(this.view.find(View.buttons.save)).not.toExist();
    expect(this.view.find(View.buttons.cancel)).not.toExist();
  });

  it('cancel button should reset form', function (this: Test) {
    this.initSpies();
    this.initComponent();
    expect(this.view.find(View.controls.userAccess)).not.toBeChecked();
    expect(this.view.find(View.buttons.save)).not.toExist();
    expect(this.view.find(View.buttons.cancel)).not.toExist();

    // change form state
    this.view.find(View.controls.userAccess).click();
    expect(this.view.find(View.controls.userAccess)).toBeChecked();
    expect(this.view.find(View.buttons.save)).toExist();
    expect(this.view.find(View.buttons.cancel)).toExist();

    // click cancel button
    this.view.find(View.buttons.cancel).click();
    expect(this.view.find(View.controls.userAccess)).not.toBeChecked();
    expect(this.view.find(View.buttons.save)).not.toExist();
    expect(this.view.find(View.buttons.cancel)).not.toExist();
  });

  describe('Revoke Access', () => {
    it('should invoke service to revoke tokens if dialog is confirmed', function (this: Test) {
      this.initSpies();
      this.initComponent();
      // invoke action list function
      this.controller.actionList.filter(action => action.actionKey === 'integrations.overview.revokeAccess')[0].actionFunction();
      expect(this.ModalService.open).toHaveBeenCalled();
      this.$scope.$apply();
      expect(this.IntegrationsManagementFakeService.revokeTokensForIntegration).toHaveBeenCalled();
    });

    it('should not invoke service to revoke tokens if dialog is dismissed', function (this: Test) {
      this.initSpies({
        modalResult: this.$q.reject(),
      });
      this.initComponent();
      // invoke action list function
      this.controller.actionList.filter(action => action.actionKey === 'integrations.overview.revokeAccess')[0].actionFunction();
      expect(this.ModalService.open).toHaveBeenCalled();
      this.$scope.$apply();
      expect(this.IntegrationsManagementFakeService.revokeTokensForIntegration).not.toHaveBeenCalled();
    });
  });

  describe('Download', () => {
    it('should download CSV of adopted users', function (this: Test) {
      this.initSpies();
      this.initComponent();
      // invoke action list function
      this.controller.actionList.filter(action => action.actionKey === 'integrations.overview.download')[0].actionFunction();
      // TODO should do something
    });
  });

  describe('Save Button', () => {
    it('should create custom policy if one didn\'t exist', function (this: Test) {
      this.initSpies();
      this.initComponent();
      this.view.find(View.controls.userAccess).click(); // chnaged to differ from global
      this.view.find(View.buttons.save).click();
      expect(this.IntegrationsManagementFakeService.createCustomPolicy).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.view.find(View.buttons.save)).not.toExist();
    });

    it('should update custom policy if one exists', function (this: Test) {
      this.initSpies({
        getIntegration: this.$q.resolve(_.assignIn({}, applicationUsage, { policyId: 'policy-id' })),
      });
      this.initComponent();
      this.view.find(View.controls.userAccess).click(); // changed to differ from global
      this.view.find(View.buttons.save).click();
      expect(this.IntegrationsManagementFakeService.updateCustomPolicy).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.view.find(View.buttons.save)).not.toExist();
    });

    it('should delete custom policy if one exists', function (this: Test) {
      this.initSpies({
        getIntegration: this.$q.resolve(_.assignIn({}, applicationUsage, { policyAction: PolicyAction.ALLOW, policyId: 'policy-id' })),
      });
      this.initComponent();
      this.view.find(View.controls.userAccess).click(); // changed to match global
      this.view.find(View.buttons.save).click();
      expect(this.IntegrationsManagementFakeService.deleteCustomPolicy).toHaveBeenCalled();
      expect(this.Notification.success).toHaveBeenCalled();
      expect(this.view.find(View.buttons.save)).not.toExist();
    });
  });
});

const applicationUsage: IApplicationUsage = {
  appClientId: 'app-client-id',
  appCompanyUrl: 'app-company-url',
  appContactEmail: 'app-contact-email',
  appContactName: 'app-contact-name',
  appCreated: 'app-created',
  appId: 'app-id',
  appName: 'app-name',
  appPrivacyUrl: 'app-privacy-url',
  appSupportUrl: 'app-support-url',
  appUserAdoption: 100,
  id: 'id',
  orgId: 'org-id',
  policyAction: PolicyAction.DENY,
};
const customPolicy: ICustomPolicy = {
  action: PolicyAction.DENY,
  appId: 'app-id',
  id: 'id',
  name: 'name',
  orgId: 'org-id',
  type: PolicyType.CUSTOM,
};
