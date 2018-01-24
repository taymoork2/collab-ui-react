import { IWebExSite, IPendingLicense } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { WebExSite } from 'modules/core/setupWizard/meeting-settings/meeting-settings.model';
import { Config } from 'modules/core/config/config';
class WebexSiteLicensesCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Config: Config,
  ) {
  }

  public conferenceLicensesInSubscription;
  public licenseDistributionForm: ng.IFormController;
  public sitesArray: IWebExSite[];
  public existingWebexSites: WebExSite[];
  public distributedLicensesArray: IWebExSite[][];
  public centerDetails: { centerType: string; volume: number; }[];
  public isHideDescription: boolean;
  public onDistributionChange: Function;
  public onSendTracking: Function;

  private readonly centerTypes = {
    EE: this.$translate.instant('firstTimeWizard.centerTypes.EE'),
    MC: this.$translate.instant('firstTimeWizard.centerTypes.MC'),
    EC: this.$translate.instant('firstTimeWizard.centerTypes.EC'),
    TC: this.$translate.instant('firstTimeWizard.centerTypes.TC'),
    SC: this.$translate.instant('firstTimeWizard.centerTypes.SC'),
  };

  private centerTypesInits = {
    EE: this.$translate.instant('firstTimeWizard.centerTypesInits.EE'),
    MC: this.$translate.instant('firstTimeWizard.centerTypesInits.MC'),
    EC: this.$translate.instant('firstTimeWizard.centerTypesInits.EC'),
    TC: this.$translate.instant('firstTimeWizard.centerTypesInits.TC'),
    SC: this.$translate.instant('firstTimeWizard.centerTypesInits.SC'),
  };

  public licenseDistributionErrors = {
    required: this.$translate.instant('firstTimeWizard.required'),
    min: this.$translate.instant('firstTimeWizard.meetingSettingsError.invalidLicense'),
    step: this.$translate.instant('firstTimeWizard.meetingSettingsError.invalidLicense'),
  };

  public $postLink(): void {
    this.validateData();
  }

  public $onInit(): void {
    if (this.sitesArray && this.conferenceLicensesInSubscription) {
      this.centerDetails = this.getWebExMeetingsLicenseTypeDetails(this.conferenceLicensesInSubscription);
      this.constructDistributedSitesArray();
    }
  }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.sitesArray) {
      this.sitesArray = <IWebExSite[]>_.cloneDeep(changes.sitesArray.currentValue);
    }
  }

  public constructDistributedSitesArray(): void {
    //if it doesn't exist build
    if (_.isEmpty(this.distributedLicensesArray)) {
      this.distributedLicensesArray = _.map(this.sitesArray, (site: IWebExSite) => {
        return _.map(this.centerDetails, (center) => {
          return new WebExSite({
            centerType: center.centerType,
            quantity: 0,
            siteUrl: site.siteUrl,
            timezone: site.timezone,
            setupType: site.setupType,
          });
        });
      });
      this.addExistingLicenseCounts();
    }
  }

  private addExistingLicenseCounts(): void {
    _.forEach(this.distributedLicensesArray, (sitesArray) => {
      _.forEach(sitesArray, (site) => {
        const matchingExistingSiteAndCenterType = _.find(this.existingWebexSites, { siteUrl: site.siteUrl, centerType: site.centerType });
        if (matchingExistingSiteAndCenterType) {
          site.quantity = matchingExistingSiteAndCenterType.quantity;
        }
      });
    });
  }

  public hasTotalLicensesRemaining () {
    return this.getTotalLicensesRemaining() > 0;
  }

  private getTotalLicensesRemaining () {
    let licensesRemaining = 0;
    _.forEach(this.centerDetails, (center) => {
      licensesRemaining += this.calculateLicensesRemaining(center.centerType);
    });
    return licensesRemaining;
  }

  public validateData(): void {
    const licensesRemaining = this.getTotalLicensesRemaining();
    const sitesWithoutLicenses = this.hasSitesWithoutLicensesAssigned();
    _.forEach(this.licenseDistributionForm.$$controls, (control) => { control.$validate(); });
    const invalidData = this.licenseDistributionForm.$invalid || licensesRemaining !== 0 || sitesWithoutLicenses;
    if (!invalidData) {
      this.updateSitesLicenseCount();
    } else {
      this.onDistributionChange({ sites: [], isValid: false });
    }
  }

  public hasSitesWithoutLicensesAssigned() {
    let result = false;
    _.forEach(this.sitesArray, (site) => {
      if (this.getLicensesForSite(site.siteUrl) === 0) {
        result = true;
      }
    });
    return result;
  }

  public getCenterTypeString(offerCode: string) {
    return this.centerTypes[offerCode];
  }

  public getCenterTypeInits(offerCode: string) {
    return this.centerTypesInits[offerCode];
  }

  public getLicensesForSite(siteUrl) {
    const total = _.sumBy(_.filter(_.flatten(this.distributedLicensesArray), { siteUrl: siteUrl }), 'quantity');
    return total;
  }

  public getLicensesAssignedTotal(centerType) {
    const siteArray = _.filter(_.flatten(this.distributedLicensesArray), { centerType: centerType });

    return this.sumOfWebExLicensesAssigned(siteArray);
  }

  public getLicensesRemaining(centerType) {
    const licensesRemaining = this.calculateLicensesRemaining(centerType);

    return licensesRemaining;
  }

  private calculateLicensesRemaining(centerType) {
    const siteArray = _.filter(_.flatten(this.distributedLicensesArray), { centerType: centerType });
    const centerDetail = _.find(this.centerDetails, { centerType: centerType });
    const licenseVolume = _.get<number>(centerDetail, 'volume');

    return (licenseVolume - this.sumOfWebExLicensesAssigned(siteArray));
  }

  public sumOfWebExLicensesAssigned(siteArray) {
    const result = _.sumBy(siteArray, (site: WebExSite) => {
      return Number(site.quantity);
    });

    return result;
  }

  private getMeetingLicensesGroupedByOfferName(confServicesInActingSubscription): { offerName, volume }[] {
    const meetingLicensesGrouped = _.groupBy(confServicesInActingSubscription, 'offerName');
    return _.map(meetingLicensesGrouped, function (value, key) {
      return {
        offerName: key,
        volume: _.reduce(value, function (total, o) {
          return total + _.get(o, 'volume', 0);
        }, 0),
      };
    });
  }

  private constructWebexLicensesPayload(distributedLicensesArray): WebExSite[] {
    const webexSiteDetailsList: WebExSite[] = [];
    const distributedLicenses = _.flatten(distributedLicensesArray);
    _.forEach(distributedLicenses, (site: WebExSite) => {
      if (_.get(site, 'quantity', 0) > 0) {
        const siteUrl = site.siteUrl + this.Config.siteDomainUrl.webexUrl;
        const webexSiteDetail = new WebExSite({
          centerType: site.centerType,
          quantity: _.get<number>(site, 'quantity', 0),
          siteUrl: siteUrl,
          timezone: _.get<string>(site, 'timezone.timeZoneId'),
          setupType: site.setupType,
        });
        webexSiteDetailsList.push(webexSiteDetail);
      }
    });

    return webexSiteDetailsList;
  }

  private updateSitesLicenseCount() {
    const sourceArray = _.flatten(this.distributedLicensesArray);
    _.forEach(this.sitesArray, (site) => {
      const matchingSite = _.filter(sourceArray, { siteUrl: site.siteUrl });
      if (matchingSite.length) {
        site.quantity = _.sumBy(matchingSite, 'quantity');
      } else {
        site.quantity = 0;
      }
    });
    const licensePayload = this.constructWebexLicensesPayload(this.distributedLicensesArray);
    this.onDistributionChange({ sites: licensePayload, isValid: true });
  }

  private getWebExMeetingsLicenseTypeDetails(confServicesInActingSubscription) {
    const meetingLicenses = this.getMeetingLicensesGroupedByOfferName(confServicesInActingSubscription);
    return _.map(meetingLicenses, (license: IPendingLicense) => {
      return {
        centerType: license.offerName,
        volume: license.volume,
      };
    });
  }
}

export class WebexSiteLicensesComponent implements ng.IComponentOptions {
  public controller = WebexSiteLicensesCtrl;
  public template = require('./webex-site-licenses.html');
  public bindings = {
    sitesArray: '<',
    existingWebexSites: '<',
    conferenceLicensesInSubscription: '<',
    isHideDescription: '<?',
    onDistributionChange: '&',
    onSendTracking: '&?',
  };
}

