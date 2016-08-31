import { ServicesOverviewCard } from './ServicesOverviewCard';
import { ServicesOverviewMessageCard } from './messageCard';
import { ServicesOverviewMeetingCard } from './meetingCard';
import { ServicesOverviewCallCard } from './cloudCallCard';
import { ServicesOverviewCareCard } from './careCard';
import { ServicesOverviewHybridManagementCard } from './hybridManagementCard';
import { ServicesOverviewHybridManagementF410Card } from './hybridManagementF410Card';
import { ServicesOverviewHybridCalendarCard } from './hybridCalendarCard';
import { ServicesOverviewHybridCallCard } from './hybridCallCard';
import { ServicesOverviewHybridMediaCard } from './hybridMediaCard';

/* @ngInject */
function ServicesOverviewCardFactory(Authinfo) {

  return {
    createCards: function ():Array<ServicesOverviewCard> {

      return [
        new ServicesOverviewMessageCard(Authinfo),
        new ServicesOverviewMeetingCard(Authinfo),
        new ServicesOverviewCallCard(Authinfo),
        new ServicesOverviewCareCard(Authinfo),
        new ServicesOverviewHybridManagementCard(),
        new ServicesOverviewHybridManagementF410Card(),
        new ServicesOverviewHybridCalendarCard(),
        new ServicesOverviewHybridCallCard(),
        new ServicesOverviewHybridMediaCard()
      ];
    }
  };
}

angular
  .module('Hercules')
  .factory('ServicesOverviewCardFactory', ServicesOverviewCardFactory);
