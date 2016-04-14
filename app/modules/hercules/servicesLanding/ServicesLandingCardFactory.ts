/// <reference path="ServicesLandingCard.ts"/>
/// <reference path="webexCard.ts"/>
/// <reference path="meetingCard.ts"/>
/// <reference path="callCard.ts"/>
/// <reference path="hybridManagementCard.ts"/>
namespace servicesLanding {

  /* @ngInject */
  function ServicesLandingCardFactory($translate) {

    return {
      createCards: function ():Array<ServicesLandingCard> {
        return [
          new ServicesLandingWebexCard(),
          new ServicesLandingMeetingCard(),
          new ServicesLandingCallCard(),
          new ServicesLandingHybridManagementCard(),
        ];
      }
    };
  }

  angular
    .module('Hercules')
    .factory('ServicesLandingCardFactory', ServicesLandingCardFactory);
}
