/// <reference path="ServicesOverviewCard.ts"/>
/// <reference path="messageCard.ts"/>
/// <reference path="meetingCard.ts"/>
/// <reference path="cloudCallCard.ts"/>
/// <reference path="hybridManagementCard.ts"/>
/// <reference path="calendarCard.ts"/>
/// <reference path="hybridCallCard.ts"/>
/// <reference path="hybridMediaCard.ts"/>
/// <reference path="hybridContextCard.ts"/>
namespace servicesOverview {

  /* @ngInject */
  import ServicesOverviewCard = servicesOverview.ServicesOverviewCard;
  function ServicesOverviewCardFactory($translate) {

    return {
      createCards: function ():Array<ServicesOverviewCard> {
        return [
          new ServicesOverviewMessageCard(),
          new ServicesOverviewMeetingCard(),
          new ServicesOverviewCallCard(),
          new ServicesOverviewHybridManagementCard(),
          new ServicesOverviewCalendarCard(),
          new ServicesOverviewHybridCallCard(),
          new ServicesOverviewHybridMediaCard(),
          new ServicesOverviewHybridContextCard()
        ];
      }
    };
  }

  angular
    .module('Hercules')
    .factory('ServicesOverviewCardFactory', ServicesOverviewCardFactory);
}
