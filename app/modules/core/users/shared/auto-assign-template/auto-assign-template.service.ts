import { ILicenseRequestItem, ILicenseResponseItem, IUserEntitlementRequestItem, IAutoAssignTemplateRequestPayload, LicenseChangeOperation, UserEntitlementName, UserEntitlementState } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { AssignableServicesItemCategory, IAssignableLicenseCheckboxState, ILicenseUsage, ILicenseUsageMap, ISubscription } from 'modules/core/users/userAdd/assignable-services/shared';
import { MessengerInteropService } from 'modules/core/users/userAdd/shared/messenger-interop/messenger-interop.service';
import { IAutoAssignTemplateData, IAutoAssignTemplateDataViewData, IAutoAssignTemplateResponse, IUserEntitlementsViewState } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.interfaces';
import { ICrCheckboxItemState } from 'modules/core/shared/cr-checkbox-item/cr-checkbox-item.component';

export class AutoAssignTemplateService {

  public readonly DEFAULT = 'Default';

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
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

  public getTemplates(): ng.IPromise<IAutoAssignTemplateResponse[]> {
    return this.$http.get<IAutoAssignTemplateResponse[]>(this.autoAssignTemplateUrl).then(response => response.data);
  }

  public getDefaultTemplate(): ng.IPromise<IAutoAssignTemplateResponse | undefined> {
    return this.getTemplates()
      .then(templates => {
        return _.find(templates, { name: this.DEFAULT });
      })
      .catch<IAutoAssignTemplateResponse | undefined>(response => {
        // resolve with undefined for 404s (will be fairly common when fetching auto-assign templates)
        return (response.status === 404) ? undefined : this.$q.reject(response);
      });
  }

  public hasDefaultTemplate(): ng.IPromise<boolean> {
    return this.getDefaultTemplate().then(template => !!template);
  }

  public isEnabledForOrg(): ng.IPromise<boolean> {
    return this.$http.get<{autoLicenseAssignment: boolean}>(this.autoAssignSettingsUrl).then(response => response.data.autoLicenseAssignment);
  }

  public isDefaultAutoAssignTemplateActivated(): ng.IPromise<boolean> {
    return this.$q.all({
      hasDefaultTemplate: this.hasDefaultTemplate(),
      isEnabledForOrg: this.isEnabledForOrg(),
    }).then(responses => {
      if (!responses.hasDefaultTemplate) {
        return false;
      }
      return responses.isEnabledForOrg;
    }).catch(() => false);
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

  public autoAssignTemplateDataToPayload(autoAssignTemplateData: IAutoAssignTemplateData): IAutoAssignTemplateRequestPayload {
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
        isSelected: entitlementState === 'ACTIVE',
        isDisabled: false,
      };
      return result;
    }, {});
  }

  public toViewData(template: IAutoAssignTemplateResponse | undefined, subscriptions: ISubscription[] = []): IAutoAssignTemplateDataViewData {
    const assignedLicenses = _.get(template, 'licenses', []);
    const allLicenses = this.getAllLicenses(subscriptions);
    const userEntitlements = _.get(template, 'userEntitlements', []);
    return {
      LICENSE: this.mkLicenseEntries(assignedLicenses, allLicenses),
      USER_ENTITLEMENT: this.mkUserEntitlementEntries(userEntitlements),
    };
  }

  public toAutoAssignTemplateData(template: IAutoAssignTemplateResponse | undefined, subscriptions: ISubscription[]): IAutoAssignTemplateData {
    const autoAssignTemplateData = this.initAutoAssignTemplateData();

    autoAssignTemplateData.viewData = this.toViewData(template, subscriptions);
    autoAssignTemplateData.apiData.subscriptions = subscriptions;
    autoAssignTemplateData.apiData.template = template;
    return autoAssignTemplateData;
  }

  public getDefaultStateData(): ng.IPromise<IAutoAssignTemplateData> {
    return this.$q.all({
      defaultAutoAssignTemplate: this.getDefaultTemplate(),
      subscriptions: this.getSortedSubscriptions(),
    })
      .then(results => this.toAutoAssignTemplateData(results.defaultAutoAssignTemplate, results.subscriptions));
  }

  public gotoEditAutoAssignTemplate(options: {
    autoAssignTemplateData?: IAutoAssignTemplateData,
    isEditTemplateMode?: boolean,
    prevState?: string,
  } = {}) {
    const {
      autoAssignTemplateData,
      isEditTemplateMode = true,
      prevState = 'users.manage.org',
    } = options;
    this.$state.go('users.manage.edit-auto-assign-template-modal', {
      autoAssignTemplateData,
      isEditTemplateMode,
      prevState,
    });
  }

  public getSortedSubscriptions(): ng.IPromise<ISubscription[]> {
    return this.Orgservice.getLicensesUsage()
      .then((subscriptions: ISubscription[]) => {
        subscriptions = _.sortBy(subscriptions, 'subscriptionId');
        subscriptions = _.reject(subscriptions, (subscription) => {
          return this.MessengerInteropService.subscriptionIsMessengerOnly(subscription);
        });
        subscriptions = _.reject(subscriptions, (subscription) => _.isEmpty(subscription.licenses));
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
    return !!this.findLicense(autoAssignTemplateData, { id: licenseId });
  }

  private isUserEntitlementNameInTemplate(userEntitlementName: UserEntitlementName, autoAssignTemplateData: IAutoAssignTemplateData): boolean {
    return !!this.findUserEntitlement(autoAssignTemplateData, { entitlementName: userEntitlementName });
  }

  public findLicense(autoAssignTemplateData: IAutoAssignTemplateData, criteria: Object): ILicenseResponseItem {
    const templateLicenseItems: ILicenseResponseItem[] = _.get(autoAssignTemplateData, 'apiData.template.licenses');
    return _.find(templateLicenseItems, criteria);
  }

  public findUserEntitlement(autoAssignTemplateData: IAutoAssignTemplateData, criteria: Object): IUserEntitlementRequestItem {
    const templateUserEntitlementItems: IUserEntitlementRequestItem[] = _.get(autoAssignTemplateData, 'apiData.template.userEntitlements');
    return _.find(templateUserEntitlementItems, criteria);
  }

  public getLicenseOrUserEntitlement(itemId: string, itemCategory: AssignableServicesItemCategory, autoAssignTemplateData: IAutoAssignTemplateData): ILicenseResponseItem | IUserEntitlementRequestItem | undefined {
    if (itemCategory === AssignableServicesItemCategory.LICENSE) {
      return this.findLicense(autoAssignTemplateData, { id: itemId });
    }
    if (itemCategory === AssignableServicesItemCategory.USER_ENTITLEMENT) {
      return this.findUserEntitlement(autoAssignTemplateData, { entitlementName: itemId });
    }
  }

  public getIsEnabled(itemFromTemplate: ILicenseResponseItem | IUserEntitlementRequestItem | undefined, itemCategory: AssignableServicesItemCategory): boolean {
    if (itemCategory === AssignableServicesItemCategory.LICENSE) {
      return _.get(itemFromTemplate, 'idOperation') === LicenseChangeOperation.ADD;
    }
    if (itemCategory === AssignableServicesItemCategory.USER_ENTITLEMENT) {
      return _.get(itemFromTemplate, 'entitlementState') === UserEntitlementState.ACTIVE;
    }
    return false;
  }

  public initAutoAssignTemplateData(): IAutoAssignTemplateData {
    return {
      viewData: {},
      apiData: {},
      otherData: {},
    };
  }

  public showEditAutoAssignTemplateModal() {
    this.hasDefaultTemplate().then(hasDefaultTemplate => {
      this.$state.go('users.list').then(() => {
        this.$timeout(() => {
          this.gotoEditAutoAssignTemplate({
            isEditTemplateMode: hasDefaultTemplate,
          });
        });
      });
    });
  }
}
