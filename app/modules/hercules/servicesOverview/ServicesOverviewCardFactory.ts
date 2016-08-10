import { ServicesOverviewCard } from './ServicesOverviewCard';
import { ServicesOverviewMessageCard } from './messageCard';
import { ServicesOverviewMeetingCard } from './meetingCard';
import { ServicesOverviewCallCard } from './cloudCallCard';
import { ServicesOverviewCareCard } from './careCard';
import { ServicesOverviewHybridManagementCard } from './hybridManagementCard';
import { ServicesOverviewHybridManagementF410Card } from './hybridManagementF410Card';
import { ServicesOverviewCalendarCard } from './calendarCard';
import { ServicesOverviewHybridCallCard } from './hybridCallCard';
import { ServicesOverviewHybridMediaCard } from './hybridMediaCard';
import { ServicesOverviewHybridContextCard } from './hybridContextCard';

/* @ngInject */
function ServicesOverviewCardFactory($q, Authinfo, FeatureToggleService) {

  return {
    createCards: function (careStatus) {

      return [
        new ServicesOverviewMessageCard(Authinfo),
        new ServicesOverviewMeetingCard(Authinfo),
        new ServicesOverviewCallCard(Authinfo),
        new ServicesOverviewCareCard(Authinfo),
        new ServicesOverviewHybridManagementCard(),
        new ServicesOverviewHybridManagementF410Card(),
        new ServicesOverviewCalendarCard(),
        new ServicesOverviewHybridCallCard(),
        new ServicesOverviewHybridMediaCard(),
        // new ServicesOverviewHybridContextCard() //removed until feature is ready.
        ];
    }
  };
}

angular
  .module('Hercules')
  .factory('ServicesOverviewCardFactory', ServicesOverviewCardFactory);
