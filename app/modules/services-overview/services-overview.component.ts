import { CardType, ServicesOverviewCard } from './shared/services-overview-card';
import { ServicesOverviewMessageCard } from './cloud/message-card';
import { ServicesOverviewMeetingCard } from './cloud/meeting-card';
import { ServicesOverviewCallCard } from './cloud/cloud-call-card';
import { ServicesOverviewCareCard } from './cloud/care-card';
import { ServicesOverviewHybridServicesCard } from './hybrid/hybrid-services-card';
import { ServicesOverviewHybridAndGoogleCalendarCard } from './hybrid/hybrid-and-google-calendar-card';
import { ServicesOverviewHybridCalendarCard } from './hybrid/hybrid-calendar-card';
import { ServicesOverviewHybridCallCard } from './hybrid/hybrid-call-card';
import { ServicesOverviewImpCard } from './hybrid/imp-card';
import { ServicesOverviewHybridMediaCard } from './hybrid/hybrid-media-card';
import { ServicesOverviewHybridDataSecurityCard } from './hybrid/hybrid-data-security-card';
import { ServicesOverviewHybridContextCard } from './hybrid/hybrid-context-card';
import { ServicesOverviewPrivateTrunkCard } from './hybrid/private-trunk-card';

import { Config } from 'modules/core/config/config';
import { CloudConnectorService, CCCService, ICCCService } from 'modules/hercules/services/calendar-cloud-connector.service';
import { EnterprisePrivateTrunkService, IPrivateTrunkResourceWithStatus } from 'modules/hercules/services/enterprise-private-trunk-service';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { HybridServicesClusterService, IServiceStatusWithSetup } from 'modules/hercules/services/hybrid-services-cluster.service';
import { ICluster, HybridServiceId, IExtendedClusterFusion } from 'modules/hercules/hybrid-services.types';
import { IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk';
import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
import { PrivateTrunkPrereqService } from 'modules/services-overview/new-hybrid/prerequisites-modals/private-trunk-prereq';
import { ProPackService }  from 'modules/core/proPack/proPack.service';

export class ServicesOverviewController implements ng.IComponentController {
  // ️️⚠️ The property below is exclusive to the OLD cards, before the UI rewrite for the office 365 feature
  private cards: ServicesOverviewCard[] = [
    new ServicesOverviewMessageCard(this.Authinfo),
    new ServicesOverviewMeetingCard(this.Authinfo),
    new ServicesOverviewCallCard(this.Authinfo, this.Config),
    new ServicesOverviewCareCard(this.Authinfo),
    new ServicesOverviewHybridServicesCard(this.Authinfo),
    new ServicesOverviewHybridAndGoogleCalendarCard(this.$state, this.$q, this.$modal, this.Authinfo, this.CloudConnectorService, this.Notification),
    new ServicesOverviewHybridCalendarCard(this.Authinfo),
    new ServicesOverviewHybridCallCard(this.Authinfo),
    new ServicesOverviewHybridMediaCard(this.Authinfo, this.Config),
    new ServicesOverviewHybridDataSecurityCard(this.$state, this.Authinfo, this.Config, this.HDSService, this.Notification),
    new ServicesOverviewHybridContextCard(this.Authinfo),
    new ServicesOverviewPrivateTrunkCard(this.PrivateTrunkPrereqService),
    new ServicesOverviewImpCard(this.Authinfo),
  ];

  // ⚠️ The properties below are exclusive to the new cards coming with the office 365 feature
  private hasServicesOverviewRefreshToggle: boolean; // this feature toggle is used to decide if we display the new design for hybrid cards
  private urlParams: ng.ui.IStateParamsService;
  public _servicesToDisplay: HybridServiceId[] = []; // made public for easier testing
  public _servicesActive: HybridServiceId[] = []; // made public for easier testing
  public _servicesInactive: HybridServiceId[] = []; // made public for easier testing
  public clusters: IExtendedClusterFusion[] | null = null;
  public trunks: IPrivateTrunkResourceWithStatus[] | null = null;
  public servicesStatuses: (ICCCService | IPrivateTrunkResourceWithStatus | IServiceStatusWithSetup)[] = [];
  public loadingHybridServicesCards = true;

  /* @ngInject */
  constructor(
    private $modal: IToolkitModalService,
    private $q: ng.IQService,
    private $state: ng.ui.IStateService,
    private Analytics,
    private Auth,
    private Authinfo,
    private CloudConnectorService: CloudConnectorService,
    private Config: Config,
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
    private FeatureToggleService: FeatureToggleService,
    private HDSService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private ProPackService: ProPackService,
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
      atlasHybridImp: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridImp),
      atlasOffice365Support: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasOffice365Support),
      atlasPMRonM2: this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasPMRonM2),
      hI1484: this.FeatureToggleService.supports(this.FeatureToggleService.features.hI1484),
      hI802: this.FeatureToggleService.supports(this.FeatureToggleService.features.hI802),
      huronEnterprisePrivateTrunking: this.FeatureToggleService.supports(this.FeatureToggleService.features.huronEnterprisePrivateTrunking),
    });

    if (!this.hasServicesOverviewRefreshToggle) {
      this.loadHybridServicesStatuses();
      features
        .then((response) => {
          this.forwardEvent('atlasHybridImpFeatureToggleEventHandler', response.atlasHybridImp);
          if (response.atlasPMRonM2) {
            this.getPMRStatus();
          }
          this.forwardEvent('hI1484FeatureToggleEventhandler', response.hI1484);
          this.forwardEvent('sparkCallCdrReportingFeatureToggleEventhandler', response.hI802);
          this.forwardEvent('privateTrunkFeatureToggleEventHandler', response.huronEnterprisePrivateTrunking);
          if (response.huronEnterprisePrivateTrunking) {
            this.PrivateTrunkPrereqService.getVerifiedDomains().then(domains => {
              this.forwardEvent('privateTrunkDomainEventHandler', domains.length);
            });
          }
        });
    } else {
      features
        .then((response) => {
          // Used by cloud cards
          if (response.atlasPMRonM2) {
            this.getPMRStatus();
          }
          this.forwardEvent('hI1484FeatureToggleEventhandler', response.hI1484);
          this.forwardEvent('sparkCallCdrReportingFeatureToggleEventhandler', response.hI802);

          // Used by hybrid cards
          if (this.Authinfo.isFusionUC()) {
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
          if (response.huronEnterprisePrivateTrunking && this.Authinfo.isSquaredUC()) {
            this._servicesToDisplay.push('ept');
          }
          if (response.atlasHybridImp && this.Authinfo.isFusionIMP()) {
            this._servicesToDisplay.push('spark-hybrid-impinterop');
          }
        })
        .then(() => {
          // Now let's get all clusters, needed to do some computation (like finding the status for the services to display)
          return this.HybridServicesClusterService.getAll();
        })
        .then((clusters) => {
          this.clusters = clusters;
          const promises = _.map(this._servicesToDisplay, (serviceId) => {
            if (_.includes(['squared-fusion-uc', 'squared-fusion-cal', 'squared-fusion-media', 'spark-hybrid-datasecurity', 'contact-center-context', 'spark-hybrid-impinterop'], serviceId)) {
              return this.HybridServicesClusterService.getStatusForService(serviceId, clusters);
            } else if (_.includes(['squared-fusion-gcal', 'squared-fusion-o365'], serviceId)) {
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
            }
          });
          return this.$q.all<any[]>(promises)
            .then((servicesStatuses) => {
              this.servicesStatuses = servicesStatuses;
              _.forEach(this._servicesToDisplay, (serviceId, i) => {
                if (servicesStatuses[i].setup) {
                  this._servicesActive.push(serviceId);
                } else {
                  this._servicesInactive.push(serviceId);
                }
              });
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

  public getHybridCards() {
    return _.filter(this.cards, {
      cardType: CardType.hybrid,
    });
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

  private loadHybridServicesStatuses() {
    this.HybridServicesClusterService.getAll()
      .then((clusterList) => {
        const servicesStatuses: IServiceStatusWithSetup[] = [
          this.HybridServicesClusterService.getStatusForService('squared-fusion-mgmt', clusterList),
          this.HybridServicesClusterService.getStatusForService('squared-fusion-cal', clusterList),
          this.HybridServicesClusterService.getStatusForService('squared-fusion-uc', clusterList),
          this.HybridServicesClusterService.getStatusForService('spark-hybrid-impinterop', clusterList),
          this.HybridServicesClusterService.getStatusForService('squared-fusion-media', clusterList),
          this.HybridServicesClusterService.getStatusForService('spark-hybrid-datasecurity', clusterList),
          this.HybridServicesClusterService.getStatusForService('contact-center-context', clusterList),
        ];
        this.forwardEvent('hybridStatusEventHandler', servicesStatuses);
        this.forwardEvent('hybridClustersEventHandler', clusterList);
        this.Analytics.trackEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.VISIT_SERVICES_OVERVIEW, {
          'All Clusters is clickable': clusterList.length > 0,
          'Management is setup': servicesStatuses[0].setup,
          'Management status': servicesStatuses[0].status,
          'Calendar is setup': servicesStatuses[1].setup,
          'Calendar status': servicesStatuses[1].status,
          'Call is setup': servicesStatuses[2].setup,
          'Call status': servicesStatuses[2].status,
          'Media is setup': servicesStatuses[3].setup,
          'Media status': servicesStatuses[3].status,
          'Data Security is setup': servicesStatuses[4].setup,
          'Data Security status': servicesStatuses[4].status,
          'Context is setup': servicesStatuses[5].setup,
          'Context status': servicesStatuses[5].status,
        });
        return clusterList;
      })
      .then(this.loadSipDestinations);
  }

  private loadSipDestinations = (clusterList: ICluster[]) => {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.huronEnterprisePrivateTrunking)
      .then((supported: boolean) => {
        if (supported) {
          this.EnterprisePrivateTrunkService.fetch()
            .then((sipTrunkResources: IPrivateTrunkResource[]) => {
              this.forwardEvent('sipDestinationsEventHandler', sipTrunkResources, clusterList);
            });
        }
      });
  }

  private loadWebexSiteList() {
    let siteList = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
    siteList = siteList.concat(this.Authinfo.getConferenceServicesWithLinkedSiteUrl() || []);
    this.forwardEvent('updateWebexSiteList', siteList);
  }

  private getPMRStatus() {
    const customerAccount = this.Auth.getCustomerAccount(this.Authinfo.getOrgId());
    this.forwardEvent('updatePMRStatus', customerAccount);
  }
}

export class ServicesOverviewComponent implements ng.IComponentOptions {
  public controller = ServicesOverviewController;
  public template = require('modules/services-overview/services-overview.component.html');
  public bindings = {
    hasServicesOverviewRefreshToggle: '<',
    urlParams: '<',
  };
}
