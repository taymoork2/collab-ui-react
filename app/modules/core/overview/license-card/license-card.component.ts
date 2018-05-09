import { OfferName, OfferType } from 'modules/core/shared/offer-name';
import { OverviewEvent } from 'modules/core/overview/overview.keys';
import { IOfferData } from 'modules/core/myCompany/mySubscriptions/subscriptionsInterfaces';
import { LicenseCardHelperService } from './index';
import { HealthStatus, IHealthComponent, IHealthObject } from 'modules/core/health-monitor';

interface ISettingsUrlObject {
  requireSites?: boolean;
  url: string;
}

class LicenseCardController implements ng.IComponentController {
  public licenseTypes: string[];
  public statusId: string;
  public settingsUrlObject?: ISettingsUrlObject;

  public healthStatusAria: string;
  public healthStatus: HealthStatus;
  public totalLicenses: number = 0;

  public readonly statusPageUrl = this.UrlConfig.getStatusPageUrl();

  private healthData?: IHealthObject;
  private licenseList: IOfferData[] = [];
  private subscriptionsLoadedEvent: Function;
  private healthDataLoadedEvent: Function;

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private LicenseCardHelperService: LicenseCardHelperService,
    private UrlConfig,
  ) {}

  public $onDestroy() {
    this.subscriptionsLoadedEvent();
    this.healthDataLoadedEvent();
  }

  public $onInit() {
    this.subscriptionsLoadedEvent = this.$rootScope.$on(OverviewEvent.SUBSCRIPTIONS_LOADED_EVENT, (_event, subscriptions) => {
      const allLicenses = _.flatMap(subscriptions, (subscription) => subscription.licenses);
      this.licenseList = _.filter(allLicenses, (license: IOfferData) => this.licenseMatchesType(license));
      this.totalLicenses = _.sumBy(this.licenseList, license => license.volume);
    });

    this.healthDataLoadedEvent = this.$rootScope.$on(OverviewEvent.HEALTH_STATUS_LOADED_EVENT, (_event, healthData?: IHealthObject) => {
      this.healthData = healthData;
      if (!this.healthData) {
        return;
      }

      const component: IHealthComponent = _.find(this.healthData.components, { id: this.statusId });
      if (!component) {
        return;
      }

      this.healthStatusAria = this.LicenseCardHelperService.mapStatusAria(this.healthStatus, component.status);
      this.healthStatus = this.LicenseCardHelperService.mapStatus(this.healthStatus, component.status);
    });
  }

  public displaySettingsUrl(): boolean {
    const url = _.get(this.settingsUrlObject, 'url');
    const requireSites = _.get(this.settingsUrlObject, 'requireSites', false);

    if (_.isString(url) && requireSites) {
      return _.some(this.licenseList, (license: IOfferData) => {
        return license.siteUrl;
      });
    } else {
      return _.isString(url);
    }
  }

  public hasLicenses(): boolean {
    return this.totalLicenses > 0;
  }

  public showHealth(): boolean {
    return !_.isUndefined(this.healthData);
  }

  private licenseMatchesType(license: IOfferData): boolean {
    return _.some(this.licenseTypes, (type) => {
      return (this.licenseMatchesOfferType(license, type) || this.licenseMatchesOfferName(license, type)) && this.isLicenseStatusValid(license);
    });
  }

  private licenseMatchesOfferType(license: IOfferData, type: string): boolean {
    return !!OfferType[type] && OfferType[type] === license.licenseType;
  }

  private licenseMatchesOfferName(license: IOfferData, type: string): boolean {
    return !!OfferName[type] && OfferName[type] === license.offerName;
  }

  private isLicenseStatusValid(license: IOfferData) {
    return !(license.status === 'CANCELLED' || license.status === 'SUSPENDED');
  }
}

export class LicenseCardComponent implements ng.IComponentOptions {
  public template = require('./license-card.tpl.html');
  public controller = LicenseCardController;
  public bindings = {
    l10nTitle: '@',
    l10nDefaultMessage: '@',
    l10nLicenseDescription: '@',
    headerClass: '@?',
    licenseTypes: '<',
    loading: '<',
    settingsUrlObject: '<?',
    statusId: '@',
  };
}
