import { CardType, ServicesOverviewCard } from './ServicesOverviewCard';
import { ServicesOverviewMessageCard } from './messageCard';
import { ServicesOverviewMeetingCard } from './meetingCard';
import { ServicesOverviewCallCard } from './cloudCallCard';
import { ServicesOverviewCareCard } from './careCard';
import { ServicesOverviewCmcCard } from './servicesOverviewCmcCard';
import { ServicesOverviewHybridServicesCard } from './hybridServicesCard';
import { ServicesOverviewHybridAndGoogleCalendarCard } from './hybridAndGoogleCalendarCard';
import { ServicesOverviewHybridCalendarCard } from './hybridCalendarCard';
import { ServicesOverviewHybridCallCard } from './hybridCallCard';
import { ServicesOverviewImpCard } from './impCard';
import { ServicesOverviewHybridMediaCard } from './hybridMediaCard';
import { ServicesOverviewHybridDataSecurityCard } from './hybridDataSecurityCard';
import { ServicesOverviewHybridContextCard } from './hybridContextCard';
import { ServicesOverviewPrivateTrunkCard } from './privateTrunkCard';
import { PrivateTrunkPrereqService } from 'modules/hercules/private-trunk/private-trunk-prereq';
import { HybridServicesClusterStatesService } from 'modules/hercules/services/hybrid-services-cluster-states.service';
import { ITProPackService }  from 'modules/core/itProPack/itProPack.service';
import { EnterprisePrivateTrunkService } from 'modules/hercules/services/enterprise-private-trunk-service';
import { IPrivateTrunkResource } from 'modules/hercules/private-trunk/private-trunk-services/private-trunk';
import { ICluster } from 'modules/hercules/hybrid-services.types';
import { HybridServicesClusterService } from 'modules/hercules/services/hybrid-services-cluster.service';

export class ServicesOverviewCtrl {

  private cards: Array<ServicesOverviewCard>;

  /* @ngInject */
  constructor(
    private $state: ng.IQService,
    private $q: ng.IQService,
    private $modal: ng.IQService,
    private Analytics,
    private Auth,
    private Authinfo,
    private CloudConnectorService,
    private Config,
    private EnterprisePrivateTrunkService: EnterprisePrivateTrunkService,
    private FeatureToggleService,
    private HybridServicesClusterService: HybridServicesClusterService,
    private HybridServicesClusterStatesService: HybridServicesClusterStatesService,
    private PrivateTrunkPrereqService: PrivateTrunkPrereqService,
    private ITProPackService: ITProPackService,
  ) {
    this.cards = [
      new ServicesOverviewMessageCard(this.Authinfo),
      new ServicesOverviewMeetingCard(this.Authinfo),
      new ServicesOverviewCallCard(this.Authinfo, this.Config),
      new ServicesOverviewCareCard(this.Authinfo),
      new ServicesOverviewHybridServicesCard(this.Authinfo),
      new ServicesOverviewCmcCard(this.Authinfo),
      new ServicesOverviewHybridAndGoogleCalendarCard(this.$state, this.$q, this.$modal, this.Authinfo, this.CloudConnectorService, this.HybridServicesClusterStatesService),
      new ServicesOverviewHybridCalendarCard(this.Authinfo, this.HybridServicesClusterStatesService),
      new ServicesOverviewHybridCallCard(this.Authinfo, this.HybridServicesClusterStatesService),
      new ServicesOverviewHybridMediaCard(this.Authinfo, this.Config, this.HybridServicesClusterStatesService),
      new ServicesOverviewHybridDataSecurityCard(this.Authinfo, this.Config, this.HybridServicesClusterStatesService),
      new ServicesOverviewHybridContextCard(this.HybridServicesClusterStatesService),
      new ServicesOverviewPrivateTrunkCard( this.PrivateTrunkPrereqService, this.HybridServicesClusterStatesService),
      new ServicesOverviewImpCard(this.Authinfo, this.HybridServicesClusterStatesService),
    ];

    this.loadWebexSiteList();

    this.loadHybridServicesStatuses();

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasPMRonM2)
      .then(supports => {
        if (supports) {
          this.getPMRStatus();
        }
      });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.contactCenterContext)
      .then(supports => {
        // Invoke the event handler passing in true if feature toggle is enabled AND the user is Entitled to view this card.
        // When this feature flag is removed, move the entitlement check to hybridContextCard's constructor
        this.forwardEvent('hybridContextToggleEventHandler', supports && Authinfo.isContactCenterContext());
      });

    this.FeatureToggleService.supports(FeatureToggleService.features.csdmPstn)
      .then(supports => {
        this.forwardEvent('csdmPstnFeatureToggleEventHandler', supports);
      });

    this.FeatureToggleService.supports(FeatureToggleService.features.atlasHybridDataSecurity)
      .then(supports => {
        this.forwardEvent('hybridDataSecurityFeatureToggleEventHandler', supports);
      });

    let ItPropackPromises = {
      hasITProPackEnabled: this.ITProPackService.hasITProPackEnabled(),
      hasITProPackPurchased: this.ITProPackService.hasITProPackPurchased(),
    };
    this.$q.all(ItPropackPromises).then(result => {
      this.forwardEvent('itProPackEventHandler', result);
    });

    this.FeatureToggleService.supports(FeatureToggleService.features.atlasHerculesGoogleCalendar)
      .then(supports => {
        this.forwardEvent('googleCalendarFeatureToggleEventHandler', supports);
      });
    this.FeatureToggleService.supports(FeatureToggleService.features.atlasHybridImp)
      .then(supports => {
        this.forwardEvent('atlasHybridImpFeatureToggleEventHandler', supports);
      });

    this.FeatureToggleService.supports(FeatureToggleService.features.huronEnterprisePrivateTrunking)
      .then(supports => {
        this.forwardEvent('privateTrunkFeatureToggleEventHandler', supports);
        if (supports) {
          this.PrivateTrunkPrereqService.getVerifiedDomains().then(response => {
            this.forwardEvent('privateTrunkDomainEventHandler', response.length);
          });
        }
      });

    this.FeatureToggleService.supports(FeatureToggleService.features.sparkCallTenDigitExt)
      .then(supports => {
        this.forwardEvent('sparkCallTenDigitExtFeatureToggleEventhandler', supports);
      });

    this.FeatureToggleService.supports(FeatureToggleService.features.hI802)
      .then(supports => {
        this.forwardEvent('sparkCallCdrReportingFeatureToggleEventhandler', supports);
      });

  }

  public getHybridCards() {
    return _.filter(this.cards, {
      cardType: CardType.hybrid,
    });
  }

  public getCmcCards() {
    return _.filter(this.cards, {
      cardType: CardType.cmc,
    });
  }

  public hasActiveHybridCards() {
    return !!_.find(this.cards, card => card.display && card.getCardType() === CardType.hybrid);
  }

  public hasOneOrMoreHybridEntitlements() {
    return this.Authinfo.isFusion() || this.Authinfo.isFusionMedia() || this.Authinfo.isFusionUC() || this.Authinfo.isFusionCal() || this.Authinfo.isFusionHDS();
  }

  public getCloudCards() {
    return _.filter(this.cards, {
      cardType: CardType.cloud,
    });
  }

  private forwardEvent(handlerName, ...eventArgs: Array<any>) {
    _.each(this.cards, function (card) {
      if (_.isFunction(card[handlerName])) {
        card[handlerName].apply(card, eventArgs);
      }
    });
  }

  private loadHybridServicesStatuses() {
    this.HybridServicesClusterService.getAll()
      .then((clusterList) => {
        let servicesStatuses: Array<any> = [
          this.HybridServicesClusterService.getStatusForService('squared-fusion-mgmt', clusterList),
          this.HybridServicesClusterService.getStatusForService('squared-fusion-cal', clusterList),
          this.HybridServicesClusterService.getStatusForService('squared-fusion-uc', clusterList),
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

  private loadSipDestinations = (clusterList: Array<ICluster>) => {
    this.FeatureToggleService.supports(this.FeatureToggleService.features.huronEnterprisePrivateTrunking)
      .then((supported: boolean) => {
        if (supported) {
          this.EnterprisePrivateTrunkService.fetch()
            .then((sipTrunkResources: Array<IPrivateTrunkResource>) => {
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
    let customerAccount = this.Auth.getCustomerAccount(this.Authinfo.getOrgId());
    this.forwardEvent('updatePMRStatus', customerAccount);
  }
}

angular
  .module('Hercules')
  .controller('ServicesOverviewCtrl', ServicesOverviewCtrl);
