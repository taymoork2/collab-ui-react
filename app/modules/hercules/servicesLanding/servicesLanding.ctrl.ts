/// <reference path="ServicesLandingCard.ts"/>
namespace servicesLanding {

  class ServicesLandingCtrl {

    private cards:Array<ServicesLandingCard>;

    /* @ngInject */
    constructor(Orgservice, private ServicesLandingCardFactory) {

      this.cards = ServicesLandingCardFactory.createCards();
    }

    public hybridCards() {
      return this.cards;
    }
    
    public cloudCards(){
      return this.cards;
    }

    private forwardEvent(handlerName, ...eventArgs:Array<any>) {
      _.each(this.cards, function (card) {
        if (typeof (card[handlerName]) === 'function') {
          card[handlerName].apply(card, eventArgs);
        }
      });
    }
  }
  angular
    .module('Hercules')
    .controller('ServicesLandingCtrl', ServicesLandingCtrl);
}
