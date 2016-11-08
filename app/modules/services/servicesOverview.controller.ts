import { CardType, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewCtrl {

  private cards: Array<ServicesOverviewCard>;

  /* @ngInject */
  constructor(
    private ServicesOverviewCardFactory,
    private Authinfo,
    private FusionClusterService,
    private FeatureToggleService,
  ) {
    this.cards = this.ServicesOverviewCardFactory.createCards();

    this.loadWebexSiteList();

    this.FusionClusterService.getAll()
      .then((clusterList) => {
        let services: any[] = [];
        services.push(this.FusionClusterService.getStatusForService('squared-fusion-mgmt', clusterList));
        services.push(this.FusionClusterService.getStatusForService('squared-fusion-cal', clusterList));
        services.push(this.FusionClusterService.getStatusForService('squared-fusion-uc', clusterList));
        services.push(this.FusionClusterService.getStatusForService('squared-fusion-media', clusterList));
        this.forwardEvent('hybridStatusEventHandler', services);
        this.forwardEvent('hybridClustersEventHandler', clusterList);
      });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasMediaServiceOnboarding).then(supports => {
      this.forwardEvent('hybridMediaFeatureToggleEventHandler', supports);
    });

    FeatureToggleService.atlasCareTrialsGetStatus().then(supports => {
      this.forwardEvent('careFeatureToggleEventHandler', supports);
    });

    FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridDataSecurity).then(supports => {
      this.forwardEvent('hybridDataSecurityToggleEventHandler', supports);
    });

  }

  get hybridCards() {
    return _.filter(this.cards, {
      cardType: CardType.hybrid,
    });
  }

  get cloudCards() {
    return _.filter(this.cards, {
      cardType: CardType.cloud,
    });
  }

  private forwardEvent(handlerName, ...eventArgs: Array<any>) {
    _.each(this.cards, function (card) {
      if (typeof (card[handlerName]) === 'function') {
        card[handlerName].apply(card, eventArgs);
      }
    });
  }

  private loadWebexSiteList() {
    let siteList = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
    this.forwardEvent('updateWebexSiteList', siteList);
  }
}

angular
  .module('Hercules')
  .controller('ServicesOverviewCtrl', ServicesOverviewCtrl);
