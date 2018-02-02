import { ILicenseRequestItem, ILicenseResponseItem, IUserEntitlementRequestItem, IAutoAssignTemplateRequestPayload, LicenseChangeOperation, UserEntitlementName, UserEntitlementState } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { AssignableServicesItemCategory, IAssignableLicenseCheckboxState, ILicenseUsage, ILicenseUsageMap, ISubscription } from 'modules/core/users/userAdd/assignable-services/shared';
import { MessengerInteropService } from 'modules/core/users/userAdd/shared/messenger-interop/messenger-interop.service';
import { IAutoAssignTemplateData, IAutoAssignTemplateResponse, IUserEntitlementsViewState } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.interfaces';
import { ICrCheckboxItemState } from 'modules/core/users/shared/cr-checkbox-item/cr-checkbox-item.component';

export class AutoAssignTemplateService {

  public readonly DEFAULT = 'Default';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private Authinfo,
    private MessengerInteropService: MessengerInteropService,
    private Orgservice,
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

  public getDefaultTemplate(): ng.IPromise<any> {
    return this.getTemplates()
      .then(templates => {
        return _.find(templates, { name: this.DEFAULT });
      })
      .catch(response => {
        // resolve with undefined for 404s (will be fairly common when fetching auto-assign templates)
        return (response.status === 404) ? undefined : this.$q.reject(response);
      });
  }

  public isEnabledForOrg(): ng.IPromise<boolean> {
    return this.$http.get<{autoLicenseAssignment: boolean}>(this.autoAssignSettingsUrl).then(response => response.data.autoLicenseAssignment);
  }

  public createTemplate(payload: IAutoAssignTemplateRequestPayload): ng.IPromise<any> {
    return this.$http.post(this.autoAssignTemplateUrl, payload);
  }

  public updateTemplate(templateId: string, payload: IAutoAssignTemplateRequestPayload): ng.IPromise<any> {
    return this.$http.patch(`${this.autoAssignTemplateUrl}/${templateId}`, payload);
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

  public autoAssignTemplateDataToPayload(autoAssignTemplateData: IAutoAssignTemplateData): any {
    return this.mkPayload(autoAssignTemplateData);
  }

  private getAllLicenses(subscriptions: ISubscription[]): ILicenseUsageMap {
    const licensesList: ILicenseUsage[] = _.flatMap(subscriptions, subscription => subscription.licenses);
    return _.reduce(licensesList, (result, license) => {
      result[license.licenseId] = license;
      return result;
    }, {});
  }

  private mkLicenseEntries(assignedLicenses: { id: string }[], allLicenses: ILicenseUsageMap) {
    return _.reduce(assignedLicenses, (result, assignedLicense) => {
      const id = assignedLicense.id;
      const originalLicense = _.get(allLicenses, id);
      result[id] = {
        isSelected: true,
        license: originalLicense,
      };
      return result;
    }, {});
  }

  private mkUserEntitlementEntries(userEntitlementItems: IUserEntitlementRequestItem[]): IUserEntitlementsViewState {
    return _.reduce(userEntitlementItems, (result, userEntitlementItem) => {
      const { entitlementName, entitlementState } = userEntitlementItem;
      result[entitlementName] = <ICrCheckboxItemState>{
        isSelected: entitlementState === 'ACTIVE' ? true : false,
        isDisabled: false,
      };
      return result;
    }, {});
  }

  public toAutoAssignTemplateData(template: IAutoAssignTemplateResponse, subscriptions: ISubscription[]): IAutoAssignTemplateData {
    const autoAssignTemplateData = this.initAutoAssignTemplateData();

    const assignedLicenses = template.licenses;
    const allLicenses = this.getAllLicenses(subscriptions);
    autoAssignTemplateData.viewData.LICENSE = this.mkLicenseEntries(assignedLicenses, allLicenses);
    autoAssignTemplateData.viewData.USER_ENTITLEMENT = this.mkUserEntitlementEntries(template.userEntitlements);
    autoAssignTemplateData.apiData.subscriptions = subscriptions;
    autoAssignTemplateData.apiData.template = template;
    return autoAssignTemplateData;
  }

  public getDefaultStateData() {
    return this.$q.all({
      defaultAutoAssignTemplate: this.getDefaultTemplate(),
      subscriptions: this.getSortedSubscriptions(),
    })
    .then(results => this.toAutoAssignTemplateData(results.defaultAutoAssignTemplate, results.subscriptions));
  }

  public getSortedSubscriptions(): ng.IPromise<ISubscription[]> {
    return this.Orgservice.getLicensesUsage()
      .then((subscriptions: ISubscription[]) => {
        subscriptions = _.sortBy(subscriptions, 'subscriptionId');
        subscriptions = _.reject(subscriptions, (subscription) => {
          return this.MessengerInteropService.subscriptionIsMessengerOnly(subscription);
        });
        return subscriptions;
      });
  }

  private mkPayload(autoAssignTemplateData: IAutoAssignTemplateData): IAutoAssignTemplateRequestPayload {
    const licensesPayload = this.mkLicensesPayload(autoAssignTemplateData);
    const userEntitlementsPayload = this.mkUserEntitlementsPayload(autoAssignTemplateData);
    const result = {
      name: this.DEFAULT,
      userEntitlements: userEntitlementsPayload,
      licenses: licensesPayload,
    };
    return result;
  }

  private mkLicensesPayload(autoAssignTemplateData: IAutoAssignTemplateData): ILicenseRequestItem[] {
    const licenseItems: IAssignableLicenseCheckboxState[] = _.values(autoAssignTemplateData.viewData[AssignableServicesItemCategory.LICENSE]);
    const result = _.compact(_.map(licenseItems, (licenseItem) => {
      // allow any "add" operations, only allow "remove" operations if license already existed in the template
      if (licenseItem.isSelected || this.isLicenseIdInTemplate(licenseItem.license.licenseId, autoAssignTemplateData)) {
        return <ILicenseRequestItem>{
          id: licenseItem.license.licenseId,
          idOperation: licenseItem.isSelected ? LicenseChangeOperation.ADD : LicenseChangeOperation.REMOVE,
          properties: {},
        };
      }
    })) as ILicenseRequestItem[];

    return result;
  }

  private mkUserEntitlementsPayload(autoAssignTemplateData: IAutoAssignTemplateData): IUserEntitlementRequestItem[] {
    const userEntitlementItems = autoAssignTemplateData.viewData[AssignableServicesItemCategory.USER_ENTITLEMENT];
    const result = _.reduce(<IUserEntitlementsViewState>userEntitlementItems, (result, userEntitlementItem, userEntitlementName) => {
      // allow any "add" operations, only allow "remove" operations if user entitlement already existed in the template
      if (userEntitlementItem.isSelected || this.isUserEntitlementNameInTemplate(userEntitlementName, autoAssignTemplateData)) {
        result.push(<IUserEntitlementRequestItem>{
          entitlementName: userEntitlementName,
          entitlementState: userEntitlementItem.isSelected ? UserEntitlementState.ACTIVE : UserEntitlementState.INACTIVE,
        });
      }
      return result;
    }, [] as IUserEntitlementRequestItem[]);
    return result;
  }

  private isLicenseIdInTemplate(licenseId: string, autoAssignTemplateData: IAutoAssignTemplateData): boolean {
    const templateLicenseItems: ILicenseResponseItem[] = _.get(autoAssignTemplateData, 'apiData.template.licenses');
    return !!_.find(templateLicenseItems, { id: licenseId });
  }

  private isUserEntitlementNameInTemplate(userEntitlementName: UserEntitlementName, autoAssignTemplateData: IAutoAssignTemplateData): boolean {
    const templateUserEntitlementItems: IUserEntitlementRequestItem[] = _.get(autoAssignTemplateData, 'apiData.template.userEntitlements');
    return !!_.find(templateUserEntitlementItems, { entitlementName: userEntitlementName });
  }

  public initAutoAssignTemplateData(): IAutoAssignTemplateData {
    return {
      viewData: {},
      apiData: {},
      otherData: {},
    };
  }
}
