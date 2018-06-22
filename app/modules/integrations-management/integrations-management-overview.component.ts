import { IToolkitModalService } from 'modules/core/modal';
import { IActionItem } from 'modules/core/shared/section-title/section-title.component';
import { Notification } from '../core/notifications';
import { IntegrationsManagementFakeService } from './integrations-management.fake-service';
import { IApplicationUsage, ICustomPolicy, PolicyAction, PolicyRestriction } from './integrations-management.types';

export class IntegrationsManagementOverview implements ng.IComponentController {
  public customPolicyRestriction: PolicyRestriction;
  public form: ng.IFormController;
  public globalPolicyAction: PolicyAction;
  public integration: IApplicationUsage;
  public origIntegration: IApplicationUsage;

  public actionList: IActionItem[] = [{
    actionKey: 'integrations.overview.download',
    actionFunction: () => this.downloadUserAdoption(),
  }, {
    actionKey: 'integrations.overview.revokeAccess',
    actionFunction: () => this.revokeAccess(),
  }];
  public policyAction = PolicyAction;
  public policyRestriction = PolicyRestriction;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private IntegrationsManagementFakeService: IntegrationsManagementFakeService,
    private ModalService: IToolkitModalService,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
    this.loadIntegration();
  }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.integration) {
      this.setIntegration(changes.integration.currentValue);
    }
  }

  public get name(): string {
    return this.integration.appName;
  }

  public get contact(): string {
    return this.integration.appContactName;
  }

  public get userAdoptionCount(): number {
    return this.integration.appUserAdoption;
  }

  public get customPolicyAction(): PolicyAction {
    return this.integration.policyAction;
  }

  public set customPolicyAction(policyAction) {
    this.integration.policyAction = policyAction;
  }

  public get showCustomPolicy(): boolean {
    return this.isCustomDifferentFromGlobalPolicyAction();
  }

  public get showCustomPolicySpecificList(): boolean {
    return this.customPolicyRestriction === PolicyRestriction.SPECIFIC;
  }

  public get showSaveButtons(): boolean {
    return this.isFormDirty() && this.isModelChanged();
  }

  public downloadUserAdoption(): void {
    // TODO implement
  }

  public revokeAccess(): void {
    this.ModalService.open({
      title: this.$translate.instant('integrations.overview.revokeAccessDialog.title'),
      message: this.$translate.instant('integrations.overview.revokeAccessDialog.message', {
        count: this.userAdoptionCount,
      }, 'messageformat'),
      close: this.$translate.instant('common.yes'),
      dismiss: this.$translate.instant('common.no'),
    }).result
      .then(() => this.IntegrationsManagementFakeService.revokeTokensForIntegration(this.integration.appId))
      .then(() => this.loadIntegration());
  }

  public saveForm(): void {
    this.saveCustomPolicy()
      .then(() => this.loadIntegration())
      .then(() => this.form.$setPristine())
      .then(() => this.Notification.success('integrations.overview.saveSuccess'))
      .catch(response => this.Notification.errorResponse(response, 'integrations.overview.saveError'));
  }

  public resetForm(): void {
    this.integration = _.cloneDeep(this.origIntegration);
    this.form.$setPristine();
  }

  private saveCustomPolicy(): ng.IPromise<void> {
    if (this.isCustomDifferentFromGlobalPolicyAction()) {
      if (this.hasCustomPolicy()) {
        return this.IntegrationsManagementFakeService.updateCustomPolicy(
          this.integration.policyId!,
          this.integration.appId,
          this.integration.policyAction,
        );
      } else {
        return this.IntegrationsManagementFakeService.createCustomPolicy(
          this.integration.appId,
          this.integration.policyAction,
        );
      }
    } else {
      if (this.hasCustomPolicy()) {
        return this.IntegrationsManagementFakeService.deleteCustomPolicy(
          this.integration.policyId!,
        );
      } else {
        return this.$q.resolve();
      }
    }
  }

  private loadIntegration(): ng.IPromise<void> {
    return this.IntegrationsManagementFakeService.getIntegration(this.integration.appId)
      .then(integration => {
        this.setIntegration(integration);
        if (integration.policyId) {
          return this.loadCustomPolicy(integration.policyId);
        } else {
          this.initCustomPolicyRestriction();
        }
      });
  }

  private loadCustomPolicy(id: string): ng.IPromise<void> {
    return this.IntegrationsManagementFakeService.getCustomPolicy(id)
      .then(customPolicy => {
        this.customPolicyRestriction = this.getPolicyRestrictionFromCustomPolicy(customPolicy);
      });
  }

  private setIntegration(integration: IApplicationUsage) {
    this.integration = _.cloneDeep(integration);
    this.origIntegration = _.cloneDeep(integration);
  }

  private initCustomPolicyRestriction(): void {
    this.customPolicyRestriction = PolicyRestriction.ALL;
  }

  private getPolicyRestrictionFromCustomPolicy(customPolicy: ICustomPolicy): PolicyRestriction {
    return _.isArray(customPolicy.personIds) && customPolicy.personIds.length ? PolicyRestriction.SPECIFIC : PolicyRestriction.ALL;
  }

  private hasCustomPolicy(): boolean {
    return _.isString(this.integration.policyId);
  }

  private isCustomDifferentFromGlobalPolicyAction(): boolean {
    return this.customPolicyAction !== this.globalPolicyAction;
  }

  private isFormDirty(): boolean {
    return !!this.form && this.form.$dirty;
  }

  private isModelChanged(): boolean {
    return !_.isEqual(this.integration, this.origIntegration);
  }
}

export class IntegrationsManagementOverviewComponent implements ng.IComponentOptions {
  public controller = IntegrationsManagementOverview;
  public template = require('./integrations-management-overview.html');
  public bindings = {
    globalPolicyAction: '<',
    integration: '<',
  };
}
