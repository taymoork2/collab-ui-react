import { CloudConnectorService, ICCCService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { IServiceDescription, ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServiceId } from 'modules/hercules/hybrid-services.types';
import { UserEntitlementName, IUserEntitlementRequestItem } from 'modules/core/users/shared/onboard/onboard.interfaces';
import { HybridServicesEntitlementsPanelService, IHybridServices } from './hybrid-services-entitlements-panel.service';
import { IUserEntitlementsViewState } from 'modules/core/users/shared/auto-assign-template/auto-assign-template.interfaces';

interface IExtendedServiceDescription extends IServiceDescription {
  entitled?: boolean;
}

class HybridServicesEntitlementsPanelController implements ng.IComponentController {

  private allowRemove: boolean;
  private isEnabled = false;
  private entitlements: IUserEntitlementRequestItem[] = [];
  private saveInstance: Function;
  private showCalendarChoice: boolean;
  private services: IHybridServices;
  private entitlementsCallback: Function;
  private restoreInstance: IHybridServices;
  private restoreUserEntitlements: IUserEntitlementsViewState;

  /* @ngInject */
  constructor (
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
    private CloudConnectorService: CloudConnectorService,
    private FeatureToggleService: FeatureToggleService,
    private HybridServicesEntitlementsPanelService: HybridServicesEntitlementsPanelService,
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
    this.allowRemove = !!this.allowRemove;
    this.initHybridServices();
  }

  private initHybridServices() {
    const restoreUserEntitlements = this.restoreUserEntitlements || {} as IUserEntitlementsViewState;
    const preselected = {
      squaredFusionCal: _.get(restoreUserEntitlements, `${UserEntitlementName.SQUARED_FUSION_CAL}.isSelected`, false),
      squaredFusionUc: _.get(restoreUserEntitlements, `${UserEntitlementName.SQUARED_FUSION_UC}.isSelected`, false),
      squaredFusionEc: _.get(restoreUserEntitlements, `${UserEntitlementName.SQUARED_FUSION_EC}.isSelected`, false),
      squaredFusionGcal: _.get(restoreUserEntitlements, `${UserEntitlementName.SQUARED_FUSION_GCAL}.isSelected`, false),
      sparkHybridImpInterop: _.get(restoreUserEntitlements, `${UserEntitlementName.SPARK_HYBRID_IMP_INTEROP}.isSelected`, false),
    };
    // restore from previous instance if present
    if (this.restoreInstance) {
      this.services = this.restoreInstance;
      this.initIsEnabled();
      return;
    }

    // otherwise initialize as per usual
    this.$q.all({
      servicesFromFms: this.ServiceDescriptorService.getServices(),
      gcalService: this.CloudConnectorService.getService('squared-fusion-gcal'),
      office365: this.CloudConnectorService.getService('squared-fusion-o365'),
      hasHybridMessageFeatureToggle: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridImp),
    }).then((response) => {
      this.services.calendarExchangeOrOffice365 = this.getServiceIfEnabledInFMS(response.servicesFromFms, 'squared-fusion-cal', { isPreselected: preselected.squaredFusionCal }) || this.getServiceIfEnabledInCCC(response.office365, { isPreselected: preselected.squaredFusionCal });
      this.services.callServiceAware = this.getServiceIfEnabledInFMS(response.servicesFromFms, 'squared-fusion-uc', { isPreselected: preselected.squaredFusionUc });
      this.services.callServiceConnect = this.getServiceIfEnabledInFMS(response.servicesFromFms, 'squared-fusion-ec', { isPreselected: preselected.squaredFusionEc });
      this.services.calendarGoogle = this.getServiceIfEnabledInCCC(response.gcalService, { isPreselected: preselected.squaredFusionGcal });
      if (response.hasHybridMessageFeatureToggle) {
        this.services.hybridMessage = this.getServiceIfEnabledInFMS(response.servicesFromFms, 'spark-hybrid-impinterop', { isPreselected: preselected.sparkHybridImpInterop });
      }
      // if a calendar service was entitled previously, must set calendarEntitled as true and set proper entitlement
      if (preselected.squaredFusionCal || preselected.squaredFusionGcal) {
        this.services.calendarEntitled = true;
        this.services.setSelectedCalendarEntitlement();
      }
      this.initIsEnabled();
    });
  }

  private initIsEnabled() {
    if (!this.services) {
      this.isEnabled = false;
      return;
    }
    this.isEnabled = this.services.hasCalendarService() || this.services.hasCallService() || this.services.hasHybridMessageService();
    this.saveInstance({ hybridServices: this.services });
  }

  private getServiceIfEnabledInFMS(services: IServiceDescription[], id: HybridServiceId, options?: { isPreselected: boolean }): IExtendedServiceDescription | null {
    const isPreselected = _.get(options, 'isPreselected', false);
    const service: IExtendedServiceDescription = _.find(services, {
      id: id,
      enabled: true,
    });
    if (service) {
      service.entitled = isPreselected;
      return service;
    } else {
      return null;
    }
  }

  private getServiceIfEnabledInCCC(service: ICCCService, options?: { isPreselected: boolean }): IExtendedServiceDescription | null {
    const isPreselected = _.get(options, 'isPreselected', false);
    if (service.setup) {
      return<IExtendedServiceDescription> {
        id: service.serviceId,
        enabled: true,
        entitled: isPreselected,
        emailSubscribers: '',
        url: '',
      };
    } else {
      return null;
    }
  }

  public setEntitlements(): void {
    // US8209 says to only add entitlements, not remove them. Allowing INACTIVE would remove entitlement when users are patched.
    this.entitlements = this.HybridServicesEntitlementsPanelService.getEntitlements(this.services, { allowRemove: this.allowRemove });
    if (!_.isUndefined(this.entitlementsCallback)) {
      this.entitlementsCallback({
        entitlements: this.entitlements,
      });
    }
  }

  public hasHuronCallEntitlement() {
    return this.HybridServicesEntitlementsPanelService.hasHuronCallEntitlement();
  }
}

export class HybridServicesEntitlementsPanelComponent implements ng.IComponentOptions {
  public controller = HybridServicesEntitlementsPanelController;
  public template = require('./hybrid-services-entitlements-panel.html');
  public bindings = {
    allowRemove: '<',
    entitlementsCallback: '&',
    restoreInstance: '<',
    restoreUserEntitlements: '<',
    saveInstance: '&',
  };
}
