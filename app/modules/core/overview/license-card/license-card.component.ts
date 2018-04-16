import { OfferName, OfferType } from 'modules/core/shared/offer-name';
import { OverviewEvents } from 'modules/core/overview/overview.keys';
import { IOfferData } from 'modules/core/myCompany/mySubscriptions/subscriptionsInterfaces';
import { HealthStatus, IHealthComponent, IHealthObject, ISettingsUrlObject, LicenseCardHelperService } from './index';

class LicenseCardController implements ng.IComponentController {
  public licenseType: string[];
  public statusId: string;
  public settingsUrlObject?: ISettingsUrlObject;

  public healthStatusAria: string;
  public healthStatus: HealthStatus;
  public totalLicenses: number = 0;

  public readonly statusPageUrl = this.UrlConfig.getStatusPageUrl();

  private healthData?: IHealthObject;
  private licenseList: IOfferData[] = [];

  /* @ngInject */
  constructor(
    private $rootScope: ng.IRootScopeService,
    private $scope: ng.IScope,
    private LicenseCardHelperService: LicenseCardHelperService,
    private UrlConfig,
  ) {}

  public $onInit() {
    const subscriptionsLoadedEvent = this.$rootScope.$on(OverviewEvents.SUBSCRIPTIONS_LOADED_EVENT, (_event, subscriptions) => {
      this.totalLicenses = 0;
      this.licenseList = _.flatMap(subscriptions, (subscription) => subscription.licenses);

      _.forEach(this.licenseList, (license: IOfferData) => {
        if (this.licenseMatchesType(license)) {
          this.totalLicenses += license.volume;
        }
      });
    });

    const healthDataLoadedEvent = this.$rootScope.$on(OverviewEvents.HEALTH_STATUS_LOADED_EVENT, (_event, healthData: IHealthObject) => {
      this.healthData = healthData;

      if (!_.isUndefined(this.healthData)) {
        _.each(this.healthData!.components, (component: IHealthComponent) => {
          if (component.id === this.statusId) {
            this.healthStatusAria = this.LicenseCardHelperService.mapStatusAria(this.healthStatus, component.status);
            this.healthStatus = this.LicenseCardHelperService.mapStatus(this.healthStatus, component.status);
          }
        });
      }
    });

    this.$scope.$on('$destroy', subscriptionsLoadedEvent);
    this.$scope.$on('$destroy', healthDataLoadedEvent);
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
    return _.some(this.licenseType, (type) => {
      // if the card's licenseType(s) is/are a valid OfferType or OfferName and the license isn't cancelled/suspended,
      // then the license is valid for this card
      return ((!_.isUndefined(OfferType[type]) && OfferType[type] === license.licenseType) ||
        (!_.isUndefined(OfferName[type]) && OfferName[type] === license.offerName)) &&
        !(license.status === 'CANCELLED' || license.status === 'SUSPENDED');
    });
  }
}

export class LicenseCardComponent implements ng.IComponentOptions {
  public template = require('./license-card.tpl.html');
  public controller = LicenseCardController;
  public bindings = {
    l10nTitle: '@',
    l10nDefaultMessage: '@',
    l10nLicenseDescription: '@',
    lcClass: '@?',
    licenseType: '<',
    loading: '<',
    settingsUrlObject: '<?',
    statusId: '@',
  };
}
