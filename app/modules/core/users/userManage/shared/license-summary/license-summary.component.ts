import { ILicenseUsage } from 'modules/core/users/userAdd/assignable-services/shared';
import { IUserEntitlementRequestItem, UserEntitlementName } from 'modules/core/users/shared/onboard.interfaces';
import { IAutoAssignTemplateData } from 'modules/core/users/shared/auto-assign-template';
import { OfferName } from 'modules/core/shared';

class LicenseSummaryController implements ng.IComponentController {
  private advancedMeetingLicenses: ILicenseUsage[];
  private advancedMeetingSiteUrls: string[];
  private autoAssignTemplateData: IAutoAssignTemplateData;
  public readonly ENTITLEMENT_NAME = UserEntitlementName;
  public OFFER_NAME = OfferName;

  /* @ngInject */
  constructor(
    private LicenseUsageUtilService,
  ) {}

  public $onInit(): void {
    this.advancedMeetingLicenses = this.getAdvancedMeetingLicenses();
    this.advancedMeetingSiteUrls = this.getAdvancedMeetingSiteUrls();
  }
  private getSelectedLicenses(): ILicenseUsage[] {
    const isSelectedLicense = _.filter(this.autoAssignTemplateData.LICENSE, { isSelected: true });
    return _.map(isSelectedLicense, 'license');
  }

  private getAdvancedMeetingLicenses(): ILicenseUsage[] {
    return this.LicenseUsageUtilService.getAdvancedMeetingLicenses(this.getSelectedLicenses());
  }

  private getAdvancedMeetingSiteUrls(): string[] {
    return this.LicenseUsageUtilService.getAdvancedMeetingSiteUrls(this.getSelectedLicenses());
  }

  // TODO: 'USER_ENTITLEMENTS_PAYLOAD' is a temporary key, replace with proper key when no longer needed
  private getHybridUserEntitlements(): IUserEntitlementRequestItem[] {
    return _.get(this.autoAssignTemplateData, 'USER_ENTITLEMENTS_PAYLOAD', []);
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

  public findHybridUserEntitlement(entitlementName: string): IUserEntitlementRequestItem | undefined {
    return _.find(this.getHybridUserEntitlements(), { entitlementName });
  }
}

export class LicenseSummaryComponent implements ng.IComponentOptions {
  public controller = LicenseSummaryController;
  public template = require('./license-summary.html');
  public bindings = {
    autoAssignTemplateData: '<',
  };
}
