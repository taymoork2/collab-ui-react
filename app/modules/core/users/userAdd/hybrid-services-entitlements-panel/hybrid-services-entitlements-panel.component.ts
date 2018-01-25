import { CloudConnectorService, ICCCService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { IServiceDescription, ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { IEntitlementNameAndState } from 'modules/hercules/services/hybrid-services-user-sidepanel-helper.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';

interface IExtendedServiceDescription extends IServiceDescription {
  entitled?: boolean;
}

export interface IHybridServices {
  calendarEntitled: boolean;
  selectedCalendarType: HybridServiceId | null;
  hybridMessage: IExtendedServiceDescription | null;
  calendarExchangeOrOffice365: IExtendedServiceDescription | null;
  calendarGoogle: IExtendedServiceDescription | null;
  callServiceAware: IExtendedServiceDescription | null;
  callServiceConnect: IExtendedServiceDescription | null;
  notSetupText: string;
  hasHybridMessageService: Function;
  hasCalendarService: Function;
  hasCallService: Function;
  setSelectedCalendarEntitlement: Function;
}

class HybridServicesEntitlementsPanelController implements ng.IComponentController {

  private static readonly HYBRID_SERVICES = 'hybridServices';
  private isEnabled = false;
  private entitlements: IEntitlementNameAndState[] = [];
  private showCalendarChoice: boolean;
  private services: IHybridServices;
  private entitlementsCallback: Function;
  private stateData: any;  // TODO: better type

  /* @ngInject */
  constructor (
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private CloudConnectorService: CloudConnectorService,
    private FeatureToggleService: FeatureToggleService,
    private OnboardService,
    private ServiceDescriptorService: ServiceDescriptorService,

  ) {
    this.showCalendarChoice = this.Authinfo.isFusionGoogleCal();
    this.services = {
      calendarEntitled: false,
      selectedCalendarType: null,
      hybridMessage: null,
      calendarExchangeOrOffice365: null,
      calendarGoogle: null,
      callServiceAware: null,
      callServiceConnect: null,
      notSetupText: this.$translate.instant('hercules.cloudExtensions.notSetup'),
      hasHybridMessageService: (): boolean => {
        return this.services.hybridMessage !== null;
      },
      hasCalendarService: (): boolean => {
        return this.services.calendarExchangeOrOffice365 !== null || this.services.calendarGoogle !== null;
      },
      hasCallService: (): boolean => {
        return this.services.callServiceAware !== null;
      },
      setSelectedCalendarEntitlement: (): void => {
        if (this.services.calendarEntitled) {
          let selectedCalendarService;
          let previousCalendarService;
          if (!this.services.selectedCalendarType) {
            // Set one of them entitled (preferring Exchange over Google) if none selected yet
            selectedCalendarService = this.services.calendarExchangeOrOffice365 || this.services.calendarGoogle;
            this.services.selectedCalendarType = selectedCalendarService.id;
          } else {
            if (this.services.selectedCalendarType === 'squared-fusion-cal') {
              selectedCalendarService = this.services.calendarExchangeOrOffice365;
              previousCalendarService = this.services.calendarGoogle;
            } else {
              selectedCalendarService = this.services.calendarGoogle;
              previousCalendarService = this.services.calendarExchangeOrOffice365;
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
    if (!this.stateData) {
      this.stateData = {};
    }
    this.initHybridServices(this.stateData);
  }

  private initHybridServices(stateData) {
    // restore from 'stateData' if present
    const previousServices: IHybridServices = _.get(stateData, HybridServicesEntitlementsPanelController.HYBRID_SERVICES);
    if (previousServices) {
      this.services = previousServices;
      this.initIsEnabled();
      return;
    }

    // otherwise initialize as per usual, and store in 'stateData'
    this.$q.all({
      servicesFromFms: this.ServiceDescriptorService.getServices(),
      gcalService: this.CloudConnectorService.getService('squared-fusion-gcal'),
      office365: this.CloudConnectorService.getService('squared-fusion-o365'),
      hasHybridMessageFeatureToggle: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridImp),
    }).then((response) => {
      this.services.calendarExchangeOrOffice365 = this.getServiceIfEnabledInFMS(response.servicesFromFms, 'squared-fusion-cal') || this.getServiceIfEnabledInCCC(response.office365);
      this.services.callServiceAware = this.getServiceIfEnabledInFMS(response.servicesFromFms, 'squared-fusion-uc');
      this.services.callServiceConnect = this.getServiceIfEnabledInFMS(response.servicesFromFms, 'squared-fusion-ec');
      this.services.calendarGoogle = this.getServiceIfEnabledInCCC(response.gcalService);
      if (response.hasHybridMessageFeatureToggle) {
        this.services.hybridMessage = this.getServiceIfEnabledInFMS(response.servicesFromFms, 'spark-hybrid-impinterop');
      }
      _.set(stateData, HybridServicesEntitlementsPanelController.HYBRID_SERVICES, this.services);
      this.initIsEnabled();
    });
  }

  private initIsEnabled() {
    if (!this.services) {
      this.isEnabled = false;
      return;
    }
    this.isEnabled = this.services.hasCalendarService() || this.services.hasCallService() || this.services.hasHybridMessageService();
  }

  private getServiceIfEnabledInFMS(services: IServiceDescription[], id: HybridServiceId): IExtendedServiceDescription | null {
    const service: IExtendedServiceDescription = _.find(services, {
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

  private getServiceIfEnabledInCCC(service: ICCCService): IExtendedServiceDescription | null {
    if (service.setup) {
      return<IExtendedServiceDescription> {
        id: service.serviceId,
        enabled: true,
        entitled: false,
        emailSubscribers: '',
        url: '',
      };
    } else {
      return null;
    }
  }

  public setEntitlements(): void {
    // US8209 says to only add entitlements, not remove them. Allowing INACTIVE would remove entitlement when users are patched.
    this.entitlements = [];
    if (this.services.calendarEntitled) {
      this.services.setSelectedCalendarEntitlement();
      if (_.get(this.services, 'calendarExchangeOrOffice365.entitled')) {
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

}

export class HybridServicesEntitlementsPanelComponent implements ng.IComponentOptions {
  public controller = HybridServicesEntitlementsPanelController;
  public template = require('./hybrid-services-entitlements-panel.html');
  public bindings = {
    entitlementsCallback: '&',
    onUpdate: '&?',
    stateData: '<?',
  };
}
