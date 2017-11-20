import { ILicenseRequestItem, IUserEntitlementRequestItem, IAutoAssignTemplateRequestPayload } from 'modules/core/users/shared';

class EditSummaryAutoAssignTemplateModalController implements ng.IComponentController {
  private stateData: any;  // TODO: better type
  private DEFAULT_TEMPLATE_NAME = 'Default';
  private ADD_OPERATION = 'ADD';

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Notification,
    private AutoAssignTemplateService,
  ) {}

  public $onInit(): void {
    this.stateData = _.get(this.$state, 'params.stateData');
  }

  public back(): void {
    this.$state.go('users.manage.edit-auto-assign-template-modal', {
      stateData: this.stateData,
    });
  }

  public save(): void {
    const payload: IAutoAssignTemplateRequestPayload = this.mkPayload();
    this.AutoAssignTemplateService.save(payload)
      .then(() => {
        this.Notification.success('userManage.autoAssignTemplate.editSummary.saveSuccess');
        this.$state.go('users.list');
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'userManage.autoAssignTemplate.editSummary.saveError');
      });
  }

  private mkPayload(): IAutoAssignTemplateRequestPayload {
    const licensesPayload = this.mkLicensesPayload();
    const userEntitlementsPayload = this.mkUserEntitlementsPayload();
    const result = {
      name: this.DEFAULT_TEMPLATE_NAME,
      userEntitlements: userEntitlementsPayload,
      licenses: licensesPayload,
    };
    return result;
  }

  private mkLicensesPayload(): ILicenseRequestItem[] {
    if (_.isEmpty(this.stateData.items)) {
      return [];
    }
    const selectedLicenses = _.get(this.stateData, 'items');
    const result = _.map(_.keys(selectedLicenses), (licenseId: string) => {
      return <ILicenseRequestItem>{
        id: licenseId,
        idOperation: this.ADD_OPERATION,
        properties: {},
      };
    });
    return result;
  }

  private mkUserEntitlementsPayload(): IUserEntitlementRequestItem[] {
    if (_.isEmpty(this.stateData.items)) {
      return [];
    }

    // TODO: implement calculation of appropriate entitlements
    const result: any[] = [];
    result.push({
      entitlementName: 'webExSquared',
      entitlementState: 'ACTIVE',
    });

    return result;
  }
}

export class EditSummaryAutoAssignTemplateModalComponent implements ng.IComponentOptions {
  public controller = EditSummaryAutoAssignTemplateModalController;
  public template = require('./edit-summary-auto-assign-template-modal.html');
  public bindings = {};
}
