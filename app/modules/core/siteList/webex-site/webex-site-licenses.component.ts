import { IWebExSite, IPendingLicense } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { WebExSite } from 'modules/core/setupWizard/meeting-settings/meeting-settings.model';
import { Config }  from 'modules/core/config/config';
class WebexSiteLicensesCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Config: Config,
  ) {
  }

  private meetingCenterLicenses;
  private existingWebexSites;
  public licenseDistributionForm: ng.IFormController;
  public sitesArray: IWebExSite[] = [];
  public distributedLicensesArray: IWebExSite[][];
  public meetingLicenses;
  public centerDetails: { centerType: string; volume: number; }[];

  public onDistributionChange: Function;
  public $onInit(): void {
  }

  public $onChanges(changes: ng.IOnChangesObject) {
    if (changes.meetingLicenses) {
      this.meetingCenterLicenses = _.clone(changes.meetingLicenses.currentValue);
    }
    if (changes.sites) {
      this.sitesArray = _.clone(changes.sites.currentValue);
    }
    if (changes.existingWebexSites) {
      this.existingWebexSites = _.clone(changes.existingWebexSites.currentValue);
    }
    this.centerDetails = this.getWebExMeetingsLicenseTypeDetails();
    this.constructDistributedSitesArray();
  }

  /* AG THIS IMPLEMENTATIONS IS DRASTICALLY DIFFERENT FROM THE WIZARD */
  public constructDistributedSitesArray(): void {
    //if it doesn't exit build
    if (_.isEmpty(this.distributedLicensesArray)) {
      this.distributedLicensesArray = _.map(this.sitesArray, (site: IWebExSite) => {
        return _.map(this.centerDetails, (center) => {
          return new WebExSite({
            centerType: center.centerType,
            quantity: site.quantity || 0,
            siteUrl: site.siteUrl,
            timezone: site.timezone,
            setupType: site.setupType,
          });
        });
      });
      this.mergeExistingWebexSites();
    }
  }

  private mergeExistingWebexSites(): void {
    _.forEach(this.distributedLicensesArray, (sitesArray) => {
      _.forEach(this.existingWebexSites, (siteObj) => {
        const site = _.find(sitesArray, { siteUrl: siteObj.siteUrl, centerType: siteObj.centerType });
        if (_.has(site, 'quantity')) {
          site.quantity = siteObj.quantity;
        }
      });
    });
  }


  public validateData(): void {
    let licensesRemaining = 0;
    _.forEach(this.centerDetails, (center) => {
      licensesRemaining += this.calculateLicensesRemaining(center.centerType);
    });

    const sitesWithoutLicenses = this.hasSitesWithoutLicensesAssigned();
    _.forEach(this.licenseDistributionForm.$$controls, (control) => { control.$validate(); });
    const invalidData = this.licenseDistributionForm.$invalid || licensesRemaining !== 0 || sitesWithoutLicenses;
    if (!invalidData) {
      this.updateSitesLicenseCount();
    } else {
      this.onDistributionChange({ sites: [], isValid: false });
    }
  }

  private hasSitesWithoutLicensesAssigned() {
    let result = false;
    _.forEach(this.sitesArray, (site) => {
      if (this.getLicensesForSite(site.siteUrl) === 0) {
        result = true;
      }
    });
    return result;
  }

  public offerCodeToCenterTypeString(offerCode: string) {
    switch (offerCode) {
      case this.Config.offerCodes.EE:
        return this.$translate.instant('firstTimeWizard.enterpriseEditionLicensesRemaining');
      case this.Config.offerCodes.MC:
        return this.$translate.instant('firstTimeWizard.meetingCenterLicensesRemaining');
      case this.Config.offerCodes.EC:
        return this.$translate.instant('firstTimeWizard.eventCenterLicensesRemaining');
      case this.Config.offerCodes.TC:
        return this.$translate.instant('firstTimeWizard.trainingCenterLicensesRemaining');
      case this.Config.offerCodes.SC:
        return this.$translate.instant('firstTimeWizard.supportCenterLicensesRemaining');
      default:
        return this.$translate.instant('firstTimeWizard.invalidCenterType');
    }
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
    const centerDetail = _.find(this.getWebExMeetingsLicenseTypeDetails(), { centerType: centerType });
    const licenseVolume = _.get<number>(centerDetail, 'volume');

    return (licenseVolume - this.sumOfWebExLicensesAssigned(siteArray));
  }

  public sumOfWebExLicensesAssigned(siteArray) {
    const result = _.sumBy(siteArray, (site: WebExSite) => {
      return Number(site.quantity);
    });

    return result;
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
    this.onDistributionChange( { sites: _.clone(this.sitesArray), isValid: true });
  }

  private getWebExMeetingsLicenseTypeDetails() {
    return _.map(this.meetingCenterLicenses, (license: IPendingLicense) => {
      return {
        centerType: license.offerName,
        volume: license.volume,
      };
    });
  }
}

export class WebexSiteLicensesComponent implements ng.IComponentOptions {
  public controller = WebexSiteLicensesCtrl;
  public template = require('modules/core/siteList/webex-site/webex-site-licenses.html');
  public bindings = {
    sites: '<',
    meetingLicenses: '<',
    existingWebexSites: '<',
    onDistributionChange: '&',
  };
}

