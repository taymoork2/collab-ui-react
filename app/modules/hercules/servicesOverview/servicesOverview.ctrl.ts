import { CardType, ServicesOverviewCard } from './ServicesOverviewCard';
import { ServicesOverviewCareCard } from './careCard';

export class ServicesOverviewCtrl {

  private cards:Array<ServicesOverviewCard>;

  public showFilterDropDown:boolean = false;

  /* @ngInject */
  constructor(Orgservice, private ServicesOverviewCardFactory, private $q, private Authinfo, ServiceDescriptor, FeatureToggleService) {

    this.cards = ServicesOverviewCardFactory.createCards();

    this.loadWebexSiteList();

    ServiceDescriptor.services((err, services)=> {
      this.forwardEvent('hybridStatusEventHandler', services)
    }, true);

    FeatureToggleService.supports(FeatureToggleService.features.atlasHybridServicesResourceList).then(supports => {
      this.forwardEvent('f410FeatureEventHandler', supports);
    });

    FeatureToggleService.supports(FeatureToggleService.features.atlasMediaServiceOnboarding).then(supports => {
      this.forwardEvent('hybridMediaFeatureToggleEventHandler', supports);
    });

    FeatureToggleService.atlasCareTrialsGetStatus().then(supports => {
      this.forwardEvent('careFeatureToggleEventHandler', supports);
    });
  }

  get hybridCards() {
    return _.filter(this.cards, {
      cardType: CardType.hybrid,
      display: true
    });
  }

  get cloudCards() {
    return _.filter(this.cards, {
      cardType: CardType.cloud,
      display: true
    });
  }

  public toggleDropdown() {
    this.showFilterDropDown = !this.showFilterDropDown;
  }

  private forwardEvent(handlerName, ...eventArgs:Array<any>) {
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
