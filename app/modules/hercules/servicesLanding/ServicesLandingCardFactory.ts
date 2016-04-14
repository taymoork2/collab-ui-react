/// <reference path="ServicesLandingCard.ts"/>
/// <reference path="webexCard.ts"/>
/// <reference path="meetingCard.ts"/>
namespace servicesLanding {

  /* @ngInject */
  function ServicesLandingCardFactory($translate) {

    return {
      createCards: function ():Array<ServicesLandingCard> {
        return [
          new ServicesLandingWebexCard(),
          new ServicesLandingMeetingCard()
        ];
      }
    };
  }

  angular
    .module('Hercules')
    .factory('ServicesLandingCardFactory', ServicesLandingCardFactory);
}
