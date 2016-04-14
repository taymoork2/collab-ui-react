/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {
  export enum CardFilter{
    all,
    active
  }
  class ServicesLandingCtrl {

    private cards:Array<ServicesLandingCard>;


    public hybridCardFilters = {
      all: {cardType: servicesLanding.CardType.hybrid},
      active: {cardType: servicesLanding.CardType.hybrid, active: true}
    };
    private activeHybridCardFilter = this.hybridCardFilters.all;
    public showFilterDropDown:boolean = false;


    /* @ngInject */
    constructor(Orgservice, private ServicesLandingCardFactory) {
      this.cards = ServicesLandingCardFactory.createCards();

      this.loadWebexSiteList();
    }

    public hybridCards() {
      return _.filter(this.cards, this.activeHybridCardFilter);
    }

    public cloudCards() {
      return _.filter(this.cards, {cardType: servicesLanding.CardType.cloud});
    }

    public filterHybridCard(filter:string) {
      this.toggleDropdown();
      this.activeHybridCardFilter = this.hybridCardFilters[filter];
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
      this.forwardEvent('updateWebexSiteList', [{}]);
    }
  }
  angular
    .module('Hercules')
    .controller('ServicesLandingCtrl', ServicesLandingCtrl);
}
