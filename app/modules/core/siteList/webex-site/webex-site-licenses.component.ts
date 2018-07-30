import { IWebExSite, ICenterDetails } from 'modules/core/setupWizard/meeting-settings/meeting-settings.interface';
import { WebExSite } from 'modules/core/setupWizard/meeting-settings/meeting-settings.model';
import { Config } from 'modules/core/config/config';
import { WebExSiteService } from './webex-site.service';
class WebexSiteLicensesCtrl implements ng.IComponentController {

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Config: Config,
    private WebExSiteService: WebExSiteService,
  ) {
  }

  public conferenceLicensesInSubscription;
  public licenseDistributionForm: ng.IFormController;
  public sitesArray: IWebExSite[];
  public existingWebexSites: IWebExSite[];
  public sitesByCenterType: IWebExSite[][];
  public centerDetails: ICenterDetails[];
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
        // if loaded from Setup Wizard, no center details are passed. Calculate center license totals from subscription.
        // if loaded from Overview -> siteList controller, center details passed down from parent.
        // if call to subscriptions/orderDetails fails, an empty array is passed. Calculate center license totals from subscription.
      if (_.isEmpty(this.centerDetails)) {
        this.centerDetails = this.WebExSiteService.extractCenterDetailsFromSingleSubscription(this.conferenceLicensesInSubscription);
      }
      this.sitesByCenterType = this.getSitesByCenterType();
      this.addExistingLicenseCounts(this.sitesByCenterType);
    }
  }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.sitesArray) {
      this.sitesArray = <IWebExSite[]>_.cloneDeep(changes.sitesArray.currentValue);
    }
  }

  // TODO (mipark2): migrate OO -> factory pattern
  private getSitesByCenterType(): IWebExSite[][] {
    return _.map(this.sitesArray, (site) => {
      return _.map(this.centerDetails, (center) => {
        return new WebExSite({
          centerType: center.serviceName,
          quantity: (this.sitesArray.length === 1) ? center.quantity : 0,
          siteUrl: site.siteUrl,
          timezone: site.timezone,
          setupType: site.setupType,
        });
      });
    });
  }

  private addExistingLicenseCounts(sitesByCenterType: IWebExSite[][]): void {
    _.forEach(sitesByCenterType, (sites) => {
      _.forEach(sites, (site) => {
        const matchingExistingSiteAndCenterType = _.find(this.existingWebexSites, { siteUrl: site.siteUrl, centerType: site.centerType });
        if (matchingExistingSiteAndCenterType) {
          site.quantity = matchingExistingSiteAndCenterType.quantity;
        }
      });
    });
  }

  public hasTotalLicensesRemaining (): boolean {
    return this.getTotalLicensesRemaining() > 0;
  }

  private getTotalLicensesRemaining (): number {
    let licensesRemaining = 0;
    _.forEach(this.centerDetails, (center) => {
      licensesRemaining += this.calculateLicensesRemaining(center.serviceName);
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

  public hasSitesWithoutLicensesAssigned(): boolean {
    let result = false;
    _.forEach(this.sitesArray, (site) => {
      if (this.getLicensesForSite(site.siteUrl) === 0) {
        result = true;
      }
    });
    return result;
  }

  public getCenterTypeString(offerCode: string): string {
    return this.centerTypes[offerCode];
  }

  public getCenterTypeInits(offerCode: string): string {
    return this.centerTypesInits[offerCode];
  }

  public getLicensesForSite(siteUrl: string) {
    const total = _.sumBy(_.filter(_.flatten(this.sitesByCenterType), { siteUrl: siteUrl }), 'quantity');
    return total;
  }

  public getLicensesAssignedTotal(centerType: string): number {
    const siteArray = _.filter(_.flatten(this.sitesByCenterType), { centerType: centerType });

    return this.sumOfWebExLicensesAssigned(siteArray);
  }

  public getLicensesRemaining(centerType: string): number {
    const licensesRemaining = this.calculateLicensesRemaining(centerType);

    return licensesRemaining;
  }

  private calculateLicensesRemaining(centerType: string): number {
    const siteArray = _.filter(_.flatten(this.sitesByCenterType), { centerType: centerType });
    const centerDetail = _.find(this.centerDetails, { serviceName: centerType });
    const licenseVolume = _.get<number>(centerDetail, 'quantity');

    return (licenseVolume - this.sumOfWebExLicensesAssigned(siteArray));
  }

  public sumOfWebExLicensesAssigned(siteArray: IWebExSite[]): number {
    const result = _.sumBy(siteArray, (site: IWebExSite) => {
      return Number(site.quantity);
    });

    return result;
  }

  private constructWebexLicensesPayload(sitesByCenterType: IWebExSite[][]): IWebExSite[] {
    const webexSiteDetailsList: IWebExSite[] = [];
    const sites = _.flatten(sitesByCenterType);
    _.forEach(sites, (site) => {
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

  private updateSitesLicenseCount(): void {
    const sourceArray = _.flatten(this.sitesByCenterType);
    _.forEach(this.sitesArray, (site) => {
      const matchingSite = _.filter(sourceArray, { siteUrl: site.siteUrl });
      if (matchingSite.length) {
        site.quantity = _.sumBy(matchingSite, 'quantity');
      } else {
        site.quantity = 0;
      }
    });
    const licensePayload = this.constructWebexLicensesPayload(this.sitesByCenterType);
    this.onDistributionChange({ sites: licensePayload, isValid: true });
  }
}

export class WebexSiteLicensesComponent implements ng.IComponentOptions {
  public controller = WebexSiteLicensesCtrl;
  public template = require('./webex-site-licenses.html');
  public bindings = {
    sitesArray: '<',
    existingWebexSites: '<',
    centerDetails: '<?',
    conferenceLicensesInSubscription: '<',
    isHideDescription: '<?',
    onDistributionChange: '&',
    onSendTracking: '&?',
  };
}
