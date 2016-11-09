import { CardType, ServicesOverviewCard } from './ServicesOverviewCard';
import { ServicesOverviewMessageCard } from './messageCard';
import { ServicesOverviewMeetingCard } from './meetingCard';
import { ServicesOverviewCallCard } from './cloudCallCard';
import { ServicesOverviewCareCard } from './careCard';
import { ServicesOverviewHybridServicesCard } from './hybridServicesCard';
import { ServicesOverviewHybridCalendarCard } from './hybridCalendarCard';
import { ServicesOverviewHybridCallCard } from './hybridCallCard';
import { ServicesOverviewHybridMediaCard } from './hybridMediaCard';
import { ServicesOverviewHybridDataSecurityCard } from './hybridDataSecurityCard';

export class ServicesOverviewCtrl {

  private cards: Array<ServicesOverviewCard>;

  /* @ngInject */
  constructor(
    private Auth,
    private Authinfo,
    private Config,
    private FeatureToggleService,
    private FusionClusterService,
    private FusionClusterStatesService,
  ) {
    this.cards = [
      new ServicesOverviewMessageCard(this.Authinfo),
      new ServicesOverviewMeetingCard(this.Authinfo),
      new ServicesOverviewCallCard(this.Authinfo),
      new ServicesOverviewCareCard(this.Authinfo),
      new ServicesOverviewHybridServicesCard(this.Authinfo),
      new ServicesOverviewHybridCalendarCard(this.Authinfo, this.FusionClusterStatesService),
      new ServicesOverviewHybridCallCard(this.Authinfo, this.FusionClusterStatesService),
      new ServicesOverviewHybridMediaCard(this.Authinfo, this.Config, this.FusionClusterStatesService),
      new ServicesOverviewHybridDataSecurityCard(this.Authinfo, this.FusionClusterStatesService),
    ];

    this.loadWebexSiteList();

    this.loadHybridServicesStatuses();

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasMediaServiceOnboarding)
      .then(supports => {
        this.forwardEvent('hybridMediaFeatureToggleEventHandler', supports);
      });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasCareTrials)
      .then(supports => {
        this.forwardEvent('careFeatureToggleEventHandler', supports);
      });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasPMRonM2)
      .then(supports => {
        if (supports) {
          this.getPMRStatus();
        }
      });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridDataSecurity)
      .then(supports => {
        this.forwardEvent('hybridDataSecurityToggleEventHandler', supports);
      });

    this.FeatureToggleService.supports(FeatureToggleService.features.csdmPstn)
      .then(supports => {
        this.forwardEvent('csdmPstnFeatureToggleEventHandler', supports);
      });
  }

  public getHybridCards() {
    return _.filter(this.cards, {
      cardType: CardType.hybrid,
    });
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
    this.FusionClusterService.getAll()
      .then((clusterList) => {
        let servicesStatuses: Array<any> = [
          this.FusionClusterService.getStatusForService('squared-fusion-mgmt', clusterList),
          this.FusionClusterService.getStatusForService('squared-fusion-cal', clusterList),
          this.FusionClusterService.getStatusForService('squared-fusion-uc', clusterList),
          this.FusionClusterService.getStatusForService('squared-fusion-media', clusterList),
        ];
        this.forwardEvent('hybridStatusEventHandler', servicesStatuses);
        this.forwardEvent('hybridClustersEventHandler', clusterList);
      });
  }

  private loadWebexSiteList() {
    let siteList = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
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
