/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {
  export enum CardFilter{
    all,
    active
  }
  class ServicesLandingCtrl {

    private cards:Array<ServicesLandingCard>;
    private _feature = false;

    get featureEnabled():boolean {
      return this._feature;
    }

    public hybridCardFilters = {
      all: {cardType: servicesLanding.CardType.hybrid},
      active: {cardType: servicesLanding.CardType.hybrid, active: true}
    };
    private activeHybridCardFilter = this.hybridCardFilters.all;
    public showFilterDropDown:boolean = false;


    /* @ngInject */
    constructor(Orgservice, private ServicesLandingCardFactory, private $q, private Authinfo, ServiceDescriptor, FeatureToggleService) {
      this.cards = ServicesLandingCardFactory.createCards();

      this.loadWebexSiteList();

      ServiceDescriptor.services((err, services)=> {
        this.forwardEvent('hybridStatusEventHandler', services)
      }, true);

      FeatureToggleService.supports(FeatureToggleService.features.serviceLanding).then((supports)=> {
        this._feature = !!supports;
      });
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
      console.log("forwarding event", eventArgs, "this", this);
      _.each(this.cards, function (card) {
        if (typeof (card[handlerName]) === 'function') {
          card[handlerName].apply(card, eventArgs);
        }
      });
    }

    private loadWebexSiteList() {
      this.$q((resolve, reject)=> {
        let siteList = this.Authinfo.getConferenceServicesWithoutSiteUrl() || [];
        resolve(siteList);
      }).then((siteList)=> {
        console.log("supersite", siteList);
        this.forwardEvent('updateWebexSiteList', siteList);
      });

    }
  }
  angular
    .module('Hercules')
    .controller('ServicesLandingCtrl', ServicesLandingCtrl);
}
