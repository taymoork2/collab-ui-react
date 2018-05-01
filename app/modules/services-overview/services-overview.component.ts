import { CardType, ServicesOverviewCard } from './shared/services-overview-card';
import { ServicesOverviewMessageCard } from './cloud/message-card';
import { ServicesOverviewMeetingCard } from './cloud/meeting-card';
import { ServicesOverviewCallCard } from './cloud/cloud-call-card';
import { ServicesOverviewCareCard } from './cloud/care-card';

import { Config } from 'modules/core/config/config';
import { CloudConnectorService, CCCService, ICCCService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { EnterprisePrivateTrunkService, IPrivateTrunkResourceWithStatus } from 'modules/hercules/services/enterprise-private-trunk-service';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { HybridServicesClusterService, IServiceStatusWithSetup } from 'modules/hercules/services/hybrid-services-cluster.service';
import { HybridServiceId, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { IToolkitModalService } from 'modules/core/modal';
import { MessengerInteropService } from 'modules/core/users/userAdd/shared/messenger-interop/messenger-interop.service';
import { Notification } from 'modules/core/notifications';
import { ProPackService }  from 'modules/core/proPack/proPack.service';
import { TaskManagerService } from 'modules/hcs/task-manager';
import { ServiceDescriptorService } from 'modules/hercules/services/service-descriptor.service';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';

type AllService = ICCCService | IServiceStatusWithSetup;

export class ServicesOverviewController implements ng.IComponentController {
  // TODO: rewrite the following properties with proper AngularJS 1.5+ components
  private cards: ServicesOverviewCard[] = [
    new ServicesOverviewMessageCard(this.Authinfo, this.MessengerInteropService),
    new ServicesOverviewMeetingCard(this.Authinfo),
    new ServicesOverviewCallCard(this.Authinfo),
    new ServicesOverviewCareCard(this.Authinfo),
  ];

  private urlParams: ng.ui.IStateParamsService;
  public _servicesToDisplay: HybridServiceId[] = []; // made public for easier testing
  public _servicesActive: HybridServiceId[] = []; // made public for easier testing
  public _servicesInactive: HybridServiceId[] = []; // made public for easier testing
  public clusters: IExtendedClusterFusion[];
  public trunks: IPrivateTrunkResourceWithStatus[];
  public servicesStatuses: AllService[] = [];
  public loadingHybridServicesCards = true;
  public hasCapacityFeatureToggle: boolean;
  public hasEventsHistoryFeatureToggle: boolean;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private Analytics,
    private Authinfo,
    private CloudConnectorService: CloudConnectorService,
    private Config: Config,
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
    private FeatureToggleService: FeatureToggleService,
    private HcsTestManagerService: TaskManagerService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private MessengerInteropService: MessengerInteropService,
    private Notification: Notification,
    private ProPackService: ProPackService,
    private ServiceDescriptorService: ServiceDescriptorService,
  ) {}

  public $onInit() {
    this.loadWebexSiteList();

    const PropackPromises = {
      hasProPackEnabled: this.ProPackService.hasProPackEnabled(),
      hasProPackPurchased: this.ProPackService.hasProPackPurchased(),
    };
    this.$q.all(PropackPromises)
      .then(result => {
        this.forwardEvent('proPackEventHandler', result);
      });

    const features = this.$q.all({
      atlasHybridCapacity: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridCapacity),
      atlasHybridAuditLog: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridAuditLog),
      atlasHybridImp: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridImp),
      atlasOffice365Support: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasOffice365Support),
      atlasHostedCloudService: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHostedCloudService),
      hI1484: this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484),
      hI1638: this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1638),
      hI802: this.FeatureToggleService.supports(this.FeatureToggleService.features.hI802),
      huronEnterprisePrivateTrunking: this.FeatureToggleService.supports(this.FeatureToggleService.features.huronEnterprisePrivateTrunking),
      hybridCare: this.FeatureToggleService.supports(this.FeatureToggleService.features.hybridCare),
    });

    features
      .then((response) => {
        // Used by cloud cards
        this.forwardEvent('hybridCareToggleEventHandler', response.hybridCare);
        this.forwardEvent('hI1484FeatureToggleEventhandler', response.hI1484);
        this.forwardEvent('sparkCallCdrReportingFeatureToggleEventhandler', response.hI802);

        // Used by hybrid cards
        this.hasCapacityFeatureToggle = response.atlasHybridCapacity;
        this.hasEventsHistoryFeatureToggle = response.atlasHybridAuditLog;
        if (this.Authinfo.isFusionUC() || ((this.Authinfo.hasCallLicense() || this.Authinfo.hasCareLicense()) && response.hybridCare)) {
          this._servicesToDisplay.push('squared-fusion-uc');
        }
        if (this.Authinfo.isFusionCal()) {
          this._servicesToDisplay.push('squared-fusion-cal');
        }
        if (this.Authinfo.isFusionCal() && response.atlasOffice365Support) {
          this._servicesToDisplay.push('squared-fusion-o365');
        }
        if (this.Authinfo.isFusionGoogleCal()) {
          this._servicesToDisplay.push('squared-fusion-gcal');
        }
        if (this.Authinfo.isFusionMedia() && _.some(this.Authinfo.getRoles(), (role) => role === this.Config.roles.full_admin || this.Config.roles.readonly_admin)) {
          this._servicesToDisplay.push('squared-fusion-media');
        }
        if (this.Authinfo.isEnterpriseCustomer() && _.some(this.Authinfo.getRoles(), (role) => role === this.Config.roles.full_admin || this.Config.roles.readonly_admin)) {
          this._servicesToDisplay.push('spark-hybrid-datasecurity');
        }
        if (this.Authinfo.isContactCenterContext()) {
          this._servicesToDisplay.push('contact-center-context');
        }
        if (response.huronEnterprisePrivateTrunking && (this.Authinfo.isSquaredUC() || ((this.Authinfo.hasCallLicense() || this.Authinfo.hasCareLicense()) && response.hybridCare))) {
          this._servicesToDisplay.push('ept');
        }
        if (response.atlasHybridImp && this.Authinfo.isFusionIMP()) {
          this._servicesToDisplay.push('spark-hybrid-impinterop');
        }
        if (response.atlasHostedCloudService && this.isPartnerAdmin()) {
          this._servicesToDisplay.push('hcs');
          this._servicesToDisplay.push('hcs-licensing');
          this._servicesToDisplay.push('hcs-upgrade');
        }
      })
      .then(() => {
        // Now let's get all clusters, needed to do some computation (like finding the status for the services to display)
        return this.HybridServicesClusterService.getAll();
      })
      .then((clusters) => {
        this.clusters = clusters;
        const promises = _.compact(_.map(this._servicesToDisplay, (serviceId) => {
          if (_.includes(['squared-fusion-gcal', 'squared-fusion-o365'], serviceId)) {
            // TODO: When the backend returns an error, we should say "we don't know" instead of considering `setup: false`
            return this.CloudConnectorService.getService(serviceId as CCCService)
              .catch(() => ({
                serviceId: serviceId,
                setup: false,
              }));
          } else if (serviceId === 'ept') {
            return this.EnterprisePrivateTrunkService.fetch()
              .then((trunks) => {
                this.trunks = trunks;
                return {
                  serviceId: serviceId,
                  setup: trunks.length > 0,
                };
              })
              .catch(() => ({
                serviceId: serviceId,
                setup: false,
              }));
          } else if (serviceId === 'spark-hybrid-testing') {
            return this.HcsTestManagerService.getServiceStatus(serviceId)
            .catch(() => ({
              serviceId: serviceId,
              setup: false,
            }));
          } else if (serviceId === 'hcs') {
            return {
              serviceId: serviceId,
              setup: true,
            };
          } else if (serviceId === 'hcs-licensing' || serviceId === 'hcs-upgrade') {
            return {
              serviceId: serviceId,
              setup: true,
            };
          }
        }));
        // Now get all from FMS
        if (_.some(['squared-fusion-uc', 'squared-fusion-cal', 'squared-fusion-media', 'spark-hybrid-datasecurity', 'contact-center-context', 'spark-hybrid-impinterop'], (serviceId) => _.includes(this._servicesToDisplay, serviceId))) {
          promises.push(this.ServiceDescriptorService.getServices()
            .then((servicesStatusesFromFMS) => {
              return _.compact(_.map(servicesStatusesFromFMS, (serviceStatus) => {
                // For some services, we rather trust data from CCC or Huron. For some services, we don't care, because they have no card in the Services Overview page.
                if (!_.includes(['squared-fusion-gcal', 'ept', 'squared-fusion-khaos', 'squared-fusion-servicability', 'squared-fusion-ec', 'squared-fusion-mgmt'], serviceStatus.id)) {
                  const status = this.HybridServicesClusterService.processClustersToAggregateStatusForService(serviceStatus.id, this.clusters);
                  return {
                    serviceId: serviceStatus.id,
                    setup: serviceStatus.enabled,
                    status: status,
                    cssClass: this.HybridServicesClusterStatesService.getServiceStatusCSSClassFromLabel(status),
                  };
                }
              }));
            }));
        }
        return this.$q.all<any[]>(promises)
          .then((servicesStatuses) => {
            servicesStatuses = _.flatten(servicesStatuses);
            this.servicesStatuses = servicesStatuses;
            _.forEach(this._servicesToDisplay, (serviceId) => {
              const serviceStatus: IServiceStatusWithSetup = _.find(this.servicesStatuses, (status: IServiceStatusWithSetup) =>  status.serviceId === serviceId);
              if (serviceStatus && serviceStatus.setup) {
                this._servicesActive.push(serviceId);
              } else {
                this._servicesInactive.push(serviceId);
              }
            });
            const payload = {
              'All Clusters is clickable': _.sum([_.get(this.clusters, 'length', 0), _.get(this.trunks, 'length', 0)]) > 0,
              'Call is setup': this.getProperty(servicesStatuses, 'squared-fusion-uc', 'setup'),
              'Call status': this.getProperty(servicesStatuses, 'squared-fusion-uc', 'status'),
              'Calendar is setup': this.getProperty(servicesStatuses, 'squared-fusion-cal', 'setup'),
              'Calendar status': this.getProperty(servicesStatuses, 'squared-fusion-cal', 'status'),
              'Office 365 is setup': this.getProperty(servicesStatuses, 'squared-fusion-o365', 'setup'),
              'Office 365 status': this.getProperty(servicesStatuses, 'squared-fusion-o365', 'status'),
              'Google Calendar is setup': this.getProperty(servicesStatuses, 'squared-fusion-gcal', 'setup'),
              'Google Calendar status': this.getProperty(servicesStatuses, 'squared-fusion-gcal', 'status'),
              'Media is setup': this.getProperty(servicesStatuses, 'squared-fusion-media', 'setup'),
              'Media status': this.getProperty(servicesStatuses, 'squared-fusion-media', 'status'),
              'Data Security is setup': this.getProperty(servicesStatuses, 'spark-hybrid-datasecurity', 'setup'),
              'Data Security status': this.getProperty(servicesStatuses, 'spark-hybrid-datasecurity', 'status'),
              'Context is setup': this.getProperty(servicesStatuses, 'contact-center-context', 'setup'),
              'Context status': this.getProperty(servicesStatuses, 'contact-center-context', 'status'),
              'Private Trunking is setup': this.getProperty(servicesStatuses, 'ept', 'setup'),
              'Private Trunking status': this.getProperty(servicesStatuses, 'ept', 'status'),
              'Message is setup': this.getProperty(servicesStatuses, 'spark-hybrid-impinterop', 'setup'),
              'Message status': this.getProperty(servicesStatuses, 'spark-hybrid-impinterop', 'status'),
            };
            this.Analytics.trackEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.VISIT_SERVICES_OVERVIEW, payload);
          })
          .finally(() => {
            this.loadingHybridServicesCards = false;
          });
      })
      .catch((error) => {
        this.Notification.errorWithTrackingId(error, 'overview.cards.hybrid.herculesError');
      });

    if (this.urlParams.office365 === 'success') {
      this.$modal.open({
        template: '<office-365-test-modal class="modal-content" close="$close()" dismiss="$dismiss()"></office-365-test-modal>',
        type: 'full',
      }).result
      .then(() => {
        this.$state.go('.', { office365: null });
      });
    } else if (this.urlParams.office365 === 'failure') {
      this.$modal.open({
        template: `<office-365-fail-modal class="modal-content" reason="${this.urlParams.reason}" close="$close()" dismiss="$dismiss()"></office-365-fail-modal>`,
        type: 'full',
      }).result
      .then(() => {
        this.$state.go('.', { office365: null, reason: null });
      });
    }
  }

  public isActive(serviceId: HybridServiceId): boolean {
    return _.includes(this._servicesToDisplay, serviceId) && _.includes(this._servicesActive, serviceId);
  }

  public isInactive(serviceId: HybridServiceId): boolean {
    return _.includes(this._servicesToDisplay, serviceId) && _.includes(this._servicesInactive, serviceId);
  }

  public isAnyHybridServiceActive(): boolean {
    return this._servicesActive.length > 0;
  }

  public showOnPremisesCard(): boolean {
    // If one of the active services is a service containing "resources"
    return _.some(this._servicesActive, (service) => {
      return _.includes<HybridServiceId>(['squared-fusion-cal', 'squared-fusion-uc', 'spark-hybrid-impinterop', 'squared-fusion-media', 'spark-hybrid-datasecurity', 'contact-center-context', 'ept'], service);
    });
  }

  public getServiceStatus(serviceId: HybridServiceId): any {
    return _.find(this.servicesStatuses, { serviceId: serviceId });
  }

  public hasActiveHybridCards() {
    return !!_.find(this.cards, card => card.display && card.getCardType() === CardType.hybrid);
  }

  public hasOneOrMoreHybridEntitlements() {
    return this.Authinfo.isFusion() || this.Authinfo.isFusionMedia() || this.Authinfo.isFusionUC() || this.Authinfo.isFusionCal();
  }

  public getCloudCards() {
    return _.filter(this.cards, {
      cardType: CardType.cloud,
    });
  }

  private forwardEvent(handlerName, ...eventArgs: any[]) {
    _.each(this.cards, function (card) {
      if (_.isFunction(card[handlerName])) {
        card[handlerName].apply(card, eventArgs);
      }
    });
  }

  private loadWebexSiteList() {
    let siteList = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
    siteList = siteList.concat(this.Authinfo.getConferenceServicesWithLinkedSiteUrl() || []);
    this.forwardEvent('updateWebexSiteList', siteList);
  }

  private getProperty(servicesStatuses: AllService[], serviceId: HybridServiceId, property: 'setup' | 'status'): any {
    if (property === 'setup') {
      return _.get(_.find(servicesStatuses, { serviceId: serviceId }), property, false);
    } else if (property === 'status') {
      return _.get(_.find(servicesStatuses, { serviceId: serviceId }), property, 'notAvailable');
    }
  }

  public isPartnerAdmin() {
    return this.Authinfo.isPartnerAdmin();
  }
}

export class ServicesOverviewComponent implements ng.IComponentOptions {
  public controller = ServicesOverviewController;
  public template = require('modules/services-overview/services-overview.component.html');
  public bindings = {
    urlParams: '<',
  };
}
