class HybridServicesEntitlementsPanelController implements ng.IComponentController {

  private isEnabled = false;
  // TODO: add better TS type
  private entitlements: any[] = [];
  private showCalendarChoice: boolean;
  // TODO: add better TS type
  private services: any;
  private entitlementsCallback: Function;

  /* @ngInject */
  constructor (
    private $q,
    private $translate,
    private Authinfo,
    private CloudConnectorService,
    private FeatureToggleService,
    private OnboardService,
    private ServiceDescriptorService,
  ) {
    this.showCalendarChoice = this.Authinfo.isFusionGoogleCal();
    this.services = {
      calendarEntitled: false,
      selectedCalendarType: null,
      hybridMessage: null,
      calendarExchange: null,
      calendarGoogle: null,
      callServiceAware: null,
      callServiceConnect: null,
      notSetupText: this.$translate.instant('hercules.cloudExtensions.notSetup'),
      hasHybridMessageService: () => {
        return this.services.hybridMessage !== null;
      },
      hasCalendarService: () => {
        return this.services.calendarExchange !== null || this.services.calendarGoogle !== null;
      },
      hasCallService: () => {
        return this.services.callServiceAware !== null;
      },
      setSelectedCalendarEntitlement: () => {
        if (this.services.calendarEntitled) {
          let selectedCalendarService;
          let previousCalendarService;
          if (!this.services.selectedCalendarType) {
            // Set one of them entitled (preferring Exchange over Google) if none selected yet
            selectedCalendarService = this.services.calendarExchange || this.services.calendarGoogle;
            this.services.selectedCalendarType = selectedCalendarService.id;
          } else {
            if (this.services.selectedCalendarType === 'squared-fusion-cal') {
              selectedCalendarService = this.services.calendarExchange;
              previousCalendarService = this.services.calendarGoogle;
            } else {
              selectedCalendarService = this.services.calendarGoogle;
              previousCalendarService = this.services.calendarExchange;
            }
          }
          selectedCalendarService.entitled = true;
          if (previousCalendarService) {
            previousCalendarService.entitled = false;
          }
        }
      },
    };
  }

  public $onInit(): void {
    this.$q.all({
      servicesFromFms: this.ServiceDescriptorService.getServices(),
      gcalService: this.CloudConnectorService.getService('squared-fusion-gcal'),
      hasHybridMessageFeatureToggle: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridImp),
    }).then((response) => {
      this.services.calendarExchange = this.getServiceIfEnabled(response.servicesFromFms, 'squared-fusion-cal');
      this.services.callServiceAware = this.getServiceIfEnabled(response.servicesFromFms, 'squared-fusion-uc');
      this.services.callServiceConnect = this.getServiceIfEnabled(response.servicesFromFms, 'squared-fusion-ec');
      this.services.calendarGoogle = (response.gcalService && response.gcalService.setup) ? response.gcalService : null;
      if (response.hasHybridMessageFeatureToggle) {
        this.services.hybridMessage = this.getServiceIfEnabled(response.servicesFromFms, 'spark-hybrid-impinterop');
      }
      this.isEnabled = this.services.hasCalendarService() || this.services.hasCallService() || this.services.hasHybridMessageService();
    });
  }

  // TODO: add better TS types for args
  public $onChanges(changes): void {
    if (changes.userIsLicensed && !changes.userIsLicensed.currentValue && changes.userIsLicensed.previousValue) {
      this.clearSelectedHybridServicesEntitlements();
    }
  }

  // TODO: add better TS types for args
  public getServiceIfEnabled(services, id): any {
    // TODO: add better TS type
    const service: any = _.find(services, {
      id: id,
      enabled: true,
    });
    if (service) {
      service.entitled = false;
      return service;
    } else {
      return null;
    }
  }

  public setEntitlements(): void {
    // US8209 says to only add entitlements, not remove them. Allowing INACTIVE would remove entitlement when users are patched.
    this.entitlements = [];
    if (this.services.calendarEntitled) {
      this.services.setSelectedCalendarEntitlement();
      if (_.get(this.services, 'calendarExchange.entitled')) {
        this.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionCal' });
      } else if (_.get(this.services, 'calendarGoogle.entitled')) {
        this.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionGCal' });
      }
    } else {
      this.services.selectedCalendarType = null;
    }
    if (!this.hasHuronCallEntitlement() && _.get(this.services, 'callServiceAware.entitled')) {
      this.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionUC' });
      if (this.services.callServiceConnect && this.services.callServiceConnect.entitled) {
        this.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'squaredFusionEC' });
      }
    } else {
      if (this.services.callServiceAware) {
        this.services.callServiceAware.entitled = false;
      }
      if (this.services.callServiceConnect) {
        this.services.callServiceConnect.entitled = false;
      }
    }
    if (_.get(this.services, 'hybridMessage.entitled')) {
      this.entitlements.push({ entitlementState: 'ACTIVE', entitlementName: 'sparkHybridImpInterop' });
    }
    if (!_.isUndefined(this.entitlementsCallback)) {
      this.entitlementsCallback({
        entitlements: this.entitlements,
      });
    }
  }

  public hasHuronCallEntitlement(): boolean {
    return this.OnboardService.huronCallEntitlement;
  }

  public clearSelectedHybridServicesEntitlements(): void {
    this.services.calendarEntitled = false;
    if (this.services.callServiceAware) {
      this.services.callServiceAware.entitled = false;
    }
    if (this.services.callServiceConnect) {
      this.services.callServiceConnect.entitled = false;
    }
    if (this.services.hybridMessage) {
      this.services.hybridMessage.entitled = false;
    }
    this.setEntitlements();
  }
}

export class HybridServicesEntitlementsPanelComponent implements ng.IComponentOptions {
  public controller = HybridServicesEntitlementsPanelController;
  public template = require('./hybrid-services-entitlements-panel.html');
  public bindings = {
    entitlementsCallback: '&',
    userIsLicensed: '<',
  };
}
