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
import { Notification } from 'modules/core/notifications';
import { ProPackService }  from 'modules/core/proPack/proPack.service';

export class ServicesOverviewController implements ng.IComponentController {
  private cards: ServicesOverviewCard[] = [
    new ServicesOverviewMessageCard(this.Authinfo),
    new ServicesOverviewMeetingCard(this.Authinfo),
    new ServicesOverviewCallCard(this.Authinfo, this.Config),
    new ServicesOverviewCareCard(this.Authinfo),
  ];

  // ⚠️ The properties below are exclusive to the new cards coming with the office 365 feature
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
    private HybridServicesClusterService: HybridServicesClusterService,
    private Notification: Notification,
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
            this.Analytics.trackEvent(this.Analytics.sections.HS_NAVIGATION.eventNames.VISIT_SERVICES_OVERVIEW, {
              'All Clusters is clickable': this.clusters ? this.clusters.length > 0 : false,
              'Call is setup': servicesStatuses[0].setup,
              'Call status': servicesStatuses[0].status,
              'Calendar is setup': servicesStatuses[1].setup,
              'Calendar status': servicesStatuses[1].status,
              'Office 365 is setup': servicesStatuses[2].setup,
              'Office 365 status': servicesStatuses[2].status,
              'Google Calendar is setup': servicesStatuses[3].setup,
              'Google Calendar status': servicesStatuses[3].status,
              'Media is setup': servicesStatuses[4].setup,
              'Media status': servicesStatuses[4].status,
              'Context is setup': servicesStatuses[5].setup,
              'Context status': servicesStatuses[5].status,
              'Private Trunking is setup': servicesStatuses[6].setup,
              'Private Trunking status': servicesStatuses[6].status,
              'Message is setup': servicesStatuses[7].setup,
              'Message status': servicesStatuses[7].status,
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

  private getPMRStatus() {
    const customerAccount = this.Auth.getCustomerAccount(this.Authinfo.getOrgId());
    this.forwardEvent('updatePMRStatus', customerAccount);
  }
}

export class ServicesOverviewComponent implements ng.IComponentOptions {
  public controller = ServicesOverviewController;
  public template = require('modules/services-overview/services-overview.component.html');
  public bindings = {
    urlParams: '<',
  };
}
