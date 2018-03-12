import { ILicenseUsage } from 'modules/core/users/userAdd/assignable-services/shared';
import { UserEntitlementName } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { IAssignableLicenseCheckboxState } from 'modules/core/users/userAdd/assignable-services/shared/license-usage-util.interfaces';
import { IAutoAssignTemplateData } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.interfaces';
import { OfferName } from 'modules/core/shared';
import { ICrCheckboxItemState } from 'modules/core/users/shared/cr-checkbox-item/cr-checkbox-item.component';

class AutoAssignTemplateSummaryController implements ng.IComponentController {
  private advancedMeetingLicenses: ILicenseUsage[];
  private autoAssignTemplateData: IAutoAssignTemplateData;
  public readonly ENTITLEMENT_NAME = UserEntitlementName;
  public OFFER_NAME = OfferName;

  /* @ngInject */
  constructor(
    private LicenseUsageUtilService,
  ) {}

  public $onInit(): void {
    this.advancedMeetingLicenses = this.getAdvancedMeetingLicenses();
  }

  private getSelectedLicenses(): ILicenseUsage[] {
    const isSelectedLicense = _.filter(
      this.autoAssignTemplateData.viewData.LICENSE as { [key: string]: IAssignableLicenseCheckboxState; },
      { isSelected: true });
    return _.map(isSelectedLicense, 'license');
  }

  private getAdvancedMeetingLicenses(): ILicenseUsage[] {
    return this.LicenseUsageUtilService.getAdvancedMeetingLicenses(this.getSelectedLicenses());
  }

  private getUserEntitlements(): { [key: string]: ICrCheckboxItemState } {
    return _.get(this.autoAssignTemplateData, 'viewData.USER_ENTITLEMENT', {});
  }

  public findLicenseForOfferName(offerName: string): ILicenseUsage | undefined {
    return this.LicenseUsageUtilService.findLicense({ offerName }, this.getSelectedLicenses());
  }

  public getTotalLicenseUsage(offerName: string): number {
    return this.LicenseUsageUtilService.getTotalLicenseUsage(offerName, this.getSelectedLicenses());
  }

  public getTotalLicenseVolume(offerName: string): number {
    return this.LicenseUsageUtilService.getTotalLicenseVolume(offerName, this.getSelectedLicenses());
  }

  public hasUserEntitlement(entitlementName: string): boolean {
    const userEntitlements = this.getUserEntitlements();
    return _.get(userEntitlements, `${entitlementName}.isSelected`, false);
  }

  public hasMessageRow(): boolean {
    return !!this.findLicenseForOfferName(this.OFFER_NAME.MS) || this.hasUserEntitlement(this.ENTITLEMENT_NAME.MESSENGER_INTEROP);
  }

  public hasMeetingRow(): boolean {
    return this.hasBasicMeetings() || this.hasAdvancedMeetings();
  }

  public hasBasicMeetings(): boolean {
    return !!this.findLicenseForOfferName(this.OFFER_NAME.CF);
  }

  public hasAdvancedMeetings(): boolean {
    return !_.isEmpty(this.advancedMeetingLicenses);
  }

  public hasCallRow(): boolean {
    return !!this.findLicenseForOfferName(this.OFFER_NAME.CO);
  }

  public hasCareRow(): boolean {
    return !!this.findLicenseForOfferName(this.OFFER_NAME.CDC) || !!this.findLicenseForOfferName(this.OFFER_NAME.CVC);
  }

  public hasHybridServicesEntitlementsRow(): boolean {
    return this.hasUserEntitlement(this.ENTITLEMENT_NAME.SPARK_HYBRID_IMP_INTEROP) ||
      this.hasUserEntitlement(this.ENTITLEMENT_NAME.SQUARED_FUSION_CAL) ||
      this.hasUserEntitlement(this.ENTITLEMENT_NAME.SQUARED_FUSION_GCAL) ||
      this.hasUserEntitlement(this.ENTITLEMENT_NAME.SQUARED_FUSION_UC) ||
      this.hasUserEntitlement(this.ENTITLEMENT_NAME.SQUARED_FUSION_EC);
  }
}

export class AutoAssignTemplateSummaryComponent implements ng.IComponentOptions {
  public controller = AutoAssignTemplateSummaryController;
  public template = require('./auto-assign-template-summary.html');
  public bindings = {
    autoAssignTemplateData: '<',
  };
}
