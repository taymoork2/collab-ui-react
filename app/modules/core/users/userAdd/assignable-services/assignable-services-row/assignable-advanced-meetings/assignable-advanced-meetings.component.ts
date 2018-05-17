import { ILicenseUsage, IOnUpdateParam } from 'modules/core/users/userAdd/assignable-services/shared';
import { LicenseUsageUtilService } from 'modules/core/users/userAdd/assignable-services/shared/license-usage-util.service';
import { OfferName } from 'modules/core/shared/offer-name';
import { OfferNameService } from 'modules/core/shared/offer-name/offer-name.service';

class AssignableAdvancedMeetingsController implements ng.IComponentController {
  private licenses: ILicenseUsage[];
  private onUpdate: Function;
  public OFFER_NAME = OfferName;

  /* @ngInject */
  constructor(
    private OfferNameService: OfferNameService,
    private LicenseUsageUtilService: LicenseUsageUtilService,
  ) {}

  public $onInit(): void {
    if (_.isEmpty(this.licenses)) {
      return;
    }

    this.licenses = this.sortLicenses(this.licenses);

    // notes:
    // - licenses with 'CMR' are a bit of a special case
    // - they are normally associated with licenses with 'EE' or 'MC' (with matching site url)
    // - so we strip them from the original list of licenses
    // - then reinsert them back AFTER their corresponding 'EE' or 'MC' license (whichever exists)
    const cmrLicenses = this.removeCmrLicenses(this.licenses);
    this.reinsertCmrLicenses(cmrLicenses, this.licenses);
  }

  private sortLicenses(licenses: ILicenseUsage[]): ILicenseUsage[] {
    const ORDERED_OFFER_NAMES = this.OfferNameService.getSortedAdvancedMeetingOfferNames();
    return _.sortBy(licenses, [
      // - sorted first by 'siteUrl'
      'siteUrl',

      // - then by 'offerName', as determined by ORDERED_OFFER_NAMES
      (license) => {
        return _.indexOf(ORDERED_OFFER_NAMES, license.offerName);
      }]);
  }

  private removeCmrLicenses(licenses: ILicenseUsage[]): ILicenseUsage[] {
    return _.remove(licenses, { offerName: 'CMR' });
  }

  private reinsertCmrLicenses(cmrLicenses: ILicenseUsage[], licenses: ILicenseUsage[]): void {
    if (_.isEmpty(licenses)) {
      return;
    }

    _.forEach(cmrLicenses, (cmrLicense) => {
      let foundIndex = -1;

      // notes:
      // - if license with matching site url and either 'EE' or 'MC' is present, splice in license
      //   with 'CMR' right after it (ie. foundIndex + 1)
      // - do this only once for each license with 'CMR'
      foundIndex = _.findIndex(licenses, { siteUrl: cmrLicense.siteUrl, offerName: 'EE' });
      if (foundIndex > -1) {
        licenses.splice(foundIndex + 1, 0, cmrLicense);
        return;
      }

      foundIndex = _.findIndex(licenses, { siteUrl: cmrLicense.siteUrl, offerName: 'MC' });
      if (foundIndex > -1) {
        licenses.splice(foundIndex + 1, 0, cmrLicense);
        return;
      }
    });
  }

  public hasAdvancedMeetings(): boolean {
    return !_.isEmpty(this.licenses);
  }

  public getTotalLicenseUsage(license: ILicenseUsage): number {
    return _.get(license, 'usage', 0);
  }

  public getTotalLicenseVolume(license: ILicenseUsage): number {
    return _.get(license, 'volume', 0);
  }

  public isSharedMeetingsLicense(license: ILicenseUsage): boolean {
    return this.LicenseUsageUtilService.isSharedMeetingsLicense(license);
  }

  public isLicenseDisabledByDefault(license: ILicenseUsage): boolean {
    return this.LicenseUsageUtilService.isLegacyWebExLicense(license);
  }

  // notes:
  // - a "buddy" license in this sense is the corresponding advanced meeting license with a
  //   matching 'siteUrl' property
  // - e.g. either 'EE' or 'MC' will have a buddy 'CMR' that follows it
  // - e.g. 'CMR' will have a buddy license that preceeds it
  private getBuddyLicenseFor(license: ILicenseUsage): ILicenseUsage | undefined {
    if (!_.includes([OfferName.EE, OfferName.MC, OfferName.CMR], license.offerName)) {
      return;
    }
    let foundIndex = _.findIndex(this.licenses, {
      offerName: license.offerName,
      siteUrl: license.siteUrl,
    });
    if (foundIndex < 0) {
      return;
    }
    if (_.includes([OfferName.EE, OfferName.MC], license.offerName)) {
      foundIndex = foundIndex + 1;
    } else if (license.offerName === OfferName.CMR) {
      foundIndex = foundIndex - 1;
    }
    const buddyLicense: ILicenseUsage = _.get(this.licenses, `[${foundIndex}]`);
    if (this.isBuddyLicense(license, buddyLicense)) {
      return buddyLicense;
    }
  }

  // notes:
  // - a "buddy" license in this sense is the corresponding advanced meeting license with a
  //   matching 'siteUrl' property
  // - a buddy license for 'EE' or 'MC' will be 'CMR' with a matching 'siteUrl'
  // - a buddy license for 'CMR' will be either 'EE' or 'MC' with a matching 'siteUrl'
  private isBuddyLicense(license1: ILicenseUsage, license2: ILicenseUsage): boolean {
    const offerName1 = _.get(license1, 'offerName');
    const offerName2 = _.get(license2, 'offerName');
    const siteUrl1 = _.get(license1, 'siteUrl');
    const siteUrl2 = _.get(license2, 'siteUrl');
    if (siteUrl1 !== siteUrl2) {
      return false;
    }
    if (_.includes([OfferName.EE, OfferName.MC], offerName1)) {
      return offerName2 === OfferName.CMR;
    }
    if (offerName1 === OfferName.CMR) {
      return _.includes([OfferName.EE, OfferName.MC], offerName2);
    }
    return false;
  }

  public recvUpdate($event): void {
    // always pass event bubble up, as per usual
    this.onUpdate({ $event: $event });

    const changedLicense: ILicenseUsage = _.get($event, 'item.license');
    const buddyLicense: ILicenseUsage | undefined = this.getBuddyLicenseFor(changedLicense);
    if (!buddyLicense) {
      return;
    }

    const changedLicenseOfferName = _.get($event, 'item.license.offerName');

    // any license selection change events on 'EE' or 'MC' must reflect on associated 'CMR'
    if (_.includes([OfferName.EE, OfferName.MC], changedLicenseOfferName)) {
      this.changeBuddy(buddyLicense, $event);
      return;
    }

    // 'CMR' change event to 'true' must reflect on associated 'EE' or 'MC' license
    if (changedLicenseOfferName === OfferName.CMR && !!_.get($event, 'item.isSelected')) {
      this.changeBuddy(buddyLicense, $event);
      return;
    }
  }

  private changeBuddy(buddyLicense: ILicenseUsage, $event): void {
    const buddyChangeEvent = this.mkBuddyChangeEvent(buddyLicense, $event);
    this.onUpdate({ $event: buddyChangeEvent });
  }

  // notes:
  // - for creating a duplicate event, copying 'isSelected' and 'isDisabled' properties, for use on
  //   a separate license
  // - useful for sync-ing checkbox states on changes
  private mkBuddyChangeEvent(buddyLicense: ILicenseUsage, changeEvent): IOnUpdateParam {
    const buddyChangeEvent = _.cloneDeep(changeEvent);
    _.set(buddyChangeEvent, 'itemId', buddyLicense.licenseId);
    _.set(buddyChangeEvent, 'item.license', buddyLicense);
    return buddyChangeEvent;
  }
}

export class AssignableAdvancedMeetingsComponent implements ng.IComponentOptions {
  public controller = AssignableAdvancedMeetingsController;
  public template = require('./assignable-advanced-meetings.html');
  public bindings = {
    licenses: '<',
    siteUrls: '<',
    onUpdate: '&',
    autoAssignTemplateData: '<',
  };
}
