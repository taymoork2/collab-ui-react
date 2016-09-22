import { CardType, ServicesOverviewCard } from './ServicesOverviewCard';

export class ServicesOverviewCtrl {

  private cards: Array<ServicesOverviewCard>;

  public showFilterDropDown: boolean = false;

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
        let services = [];
        services.push(this.FusionClusterService.getStatusForService('squared-fusion-mgmt', clusterList));
        services.push(this.FusionClusterService.getStatusForService('squared-fusion-cal', clusterList));
        services.push(this.FusionClusterService.getStatusForService('squared-fusion-uc', clusterList));
        services.push(this.FusionClusterService.getStatusForService('squared-fusion-media', clusterList));
        this.forwardEvent('hybridStatusEventHandler', services);
      });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasHybridServicesResourceList).then(supports => {
      this.forwardEvent('f410FeatureEventHandler', supports);
    });

    this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasMediaServiceOnboarding).then(supports => {
      this.forwardEvent('hybridMediaFeatureToggleEventHandler', supports);
    });

    this.FeatureToggleService.atlasCareTrialsGetStatus().then(supports => {
      let isCareEnabled = Authinfo.isCare() && supports;
      this.forwardEvent('careFeatureToggleEventHandler', isCareEnabled);
    });

  }

  get hybridCards() {
    return _.filter(this.cards, {
      cardType: CardType.hybrid,
      display: true,
    });
  }

  get cloudCards() {
    return _.filter(this.cards, {
      cardType: CardType.cloud,
      display: true,
    });
  }

  public toggleDropdown() {
    this.showFilterDropDown = !this.showFilterDropDown;
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
