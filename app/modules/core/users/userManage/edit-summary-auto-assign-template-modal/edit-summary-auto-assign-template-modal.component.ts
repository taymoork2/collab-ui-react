import { ILicenseRequestItem, IUserEntitlementRequestItem, IAutoAssignTemplateRequestPayload } from 'modules/core/users/shared';
import { AssignableServicesItemCategory, IAssignableLicenseCheckboxState } from 'modules/core/users/userAdd/assignable-services/shared';
import { LicenseChangeOperation } from 'modules/core/users/shared/onboard.interfaces';

class EditSummaryAutoAssignTemplateModalController implements ng.IComponentController {
  private dismiss: Function;
  private stateData: any;  // TODO: better type
  private readonly DEFAULT_TEMPLATE_NAME = 'Default';
  public saveLoading = false;

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private Notification,
    private Analytics,
    private AutoAssignTemplateService,
  ) {}

  public $onInit(): void {
    this.stateData = _.get(this.$state, 'params.stateData');
  }

  public dismissModal(): void {
    this.Analytics.trackAddUsers(this.Analytics.eventNames.CANCEL_MODAL);
    this.dismiss();
  }

  public back(): void {
    this.$state.go('users.manage.edit-auto-assign-template-modal', {
      stateData: this.stateData,
    });
  }

  public save(): void {
    this.saveLoading = true;
    const payload: IAutoAssignTemplateRequestPayload = this.mkPayload();
    this.AutoAssignTemplateService.saveTemplate(payload)
      .then(() => {
        this.Notification.success('userManage.autoAssignTemplate.editSummary.saveSuccess');
        this.$state.go('users.list');
      })
      .catch((response) => {
        this.Notification.errorResponse(response, 'userManage.autoAssignTemplate.editSummary.saveError');
      })
      .finally(() => {
        this.saveLoading = false;
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
    const licenseItems = this.stateData[AssignableServicesItemCategory.LICENSE];
    const selectedItems: IAssignableLicenseCheckboxState[] = _.filter(licenseItems, { isSelected: true });
    const result = _.map(selectedItems, (selectedItem) => {
      return <ILicenseRequestItem>{
        id: selectedItem.license.licenseId,
        idOperation: LicenseChangeOperation.ADD,
        properties: {},
      };
    });
    return result;
  }

  private mkUserEntitlementsPayload(): IUserEntitlementRequestItem[] {
    if (_.isEmpty(_.get(this.stateData, AssignableServicesItemCategory.LICENSE))) {
      return [];
    }

    let result: IUserEntitlementRequestItem[] = [];
    // TODO: rm this logic once 'hybrid-services-entitlements-panel' propogates its UI state
    //   and build this payload from UI state instead
    const hybridUserEntitlements: IUserEntitlementRequestItem[] = _.get(this.stateData, 'USER_ENTITLEMENTS_PAYLOAD', []);
    result = result.concat(hybridUserEntitlements);

    return result;
  }
}

export class EditSummaryAutoAssignTemplateModalComponent implements ng.IComponentOptions {
  public controller = EditSummaryAutoAssignTemplateModalController;
  public template = require('./edit-summary-auto-assign-template-modal.html');
  public bindings = {
    dismiss: '&?',
  };
}
