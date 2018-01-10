import { ILicenseRequestItem, IUserEntitlementRequestItem, IAutoAssignTemplateRequestPayload } from 'modules/core/users/shared';
import { AssignableServicesItemCategory, IAssignableLicenseCheckboxState } from 'modules/core/users/userAdd/assignable-services/shared';
import { LicenseChangeOperation } from 'modules/core/users/shared';

export class AutoAssignTemplateService {

  private readonly DEFAULT_TEMPLATE_NAME = 'Default';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private Authinfo,
    private UrlConfig,
  ) {}

  private get autoAssignTemplateUrl(): string {
    return `${this.UrlConfig.getAdminServiceUrl()}organizations/${this.Authinfo.getOrgId()}/templates`;
  }
  // as of 2017-12-21, this endpoint returns `data` property as a JSON string, which is uncommon behavior
  private get autoAssignSettingsUrl(): string {
    return `${this.UrlConfig.getAdminServiceUrl()}organizations/${this.Authinfo.getOrgId()}/settings/autoLicenseAssignment`;
  }

  public getTemplates(): ng.IPromise<any> {
    return this.$http.get(this.autoAssignTemplateUrl).then(response => response.data);
  }

  public isEnabled(): ng.IPromise<boolean> {
    return this.$http.get<{autoLicenseAssignment: boolean}>(this.autoAssignSettingsUrl).then(response => response.data.autoLicenseAssignment);
  }

  public saveTemplate(payload: IAutoAssignTemplateRequestPayload): ng.IPromise<any> {
    return this.$http.post(this.autoAssignTemplateUrl, payload);
  }

  public updateTemplate(payload: IAutoAssignTemplateRequestPayload): ng.IPromise<any> {
    return this.$http.patch(this.autoAssignTemplateUrl, payload);
  }

  private setTemplateEnabled(enabled: boolean): ng.IPromise<any> {
    return this.$http.post(this.autoAssignSettingsUrl, {}, {
      params: {
        enabled,
      },
    });
  }

  public activateTemplate(): ng.IPromise<any> {
    return this.setTemplateEnabled(true);
  }

  public deactivateTemplate(): ng.IPromise<any> {
    return this.setTemplateEnabled(false);
  }

  public deleteTemplate(templateId: string): ng.IPromise<any> {
    return this.$http.delete(`${this.autoAssignTemplateUrl}/${templateId}`);
  }

  public stateDataToPayload(stateData): any {
    return this.mkPayload(stateData);
  }

  private mkPayload(stateData): IAutoAssignTemplateRequestPayload {
    const licensesPayload = this.mkLicensesPayload(stateData);
    const userEntitlementsPayload = this.mkUserEntitlementsPayload(stateData);
    const result = {
      name: this.DEFAULT_TEMPLATE_NAME,
      userEntitlements: userEntitlementsPayload,
      licenses: licensesPayload,
    };
    return result;
  }

  private mkLicensesPayload(stateData): ILicenseRequestItem[] {
    const licenseItems = stateData[AssignableServicesItemCategory.LICENSE];
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

  private mkUserEntitlementsPayload(stateData): IUserEntitlementRequestItem[] {
    if (_.isEmpty(_.get(stateData, AssignableServicesItemCategory.LICENSE))) {
      return [];
    }

    let result: IUserEntitlementRequestItem[] = [];
    // TODO: rm this logic once 'hybrid-services-entitlements-panel' propogates its UI state
    //   and build this payload from UI state instead
    const hybridUserEntitlements: IUserEntitlementRequestItem[] = _.get(stateData, 'USER_ENTITLEMENTS_PAYLOAD', []);
    result = result.concat(hybridUserEntitlements);

    return result;
  }
}
