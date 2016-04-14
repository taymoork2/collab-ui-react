/// <reference path="ServicesLandingCard.ts"/>
/// <reference path="webexCard.ts"/>
/// <reference path="meetingCard.ts"/>
/// <reference path="cloudCallCard.ts"/>
/// <reference path="hybridManagementCard.ts"/>
/// <reference path="calendarCard.ts"/>
/// <reference path="hybridCallCard.ts"/>
/// <reference path="hybridMediaCard.ts"/>
/// <reference path="hybridContextCard.ts"/>
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
          new ServicesLandingCalendarCard(),
          new ServicesLandingHybridCallCard(),
          new ServicesLandingHybridMediaCard(),
          new ServicesLandingHybridContextCard()
        ];
      }
    };
  }

  angular
    .module('Hercules')
    .factory('ServicesLandingCardFactory', ServicesLandingCardFactory);
}
