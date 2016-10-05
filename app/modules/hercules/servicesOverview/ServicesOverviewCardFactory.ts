import { ServicesOverviewCard } from './ServicesOverviewCard';
import { ServicesOverviewMessageCard } from './messageCard';
import { ServicesOverviewMeetingCard } from './meetingCard';
import { ServicesOverviewCallCard } from './cloudCallCard';
import { ServicesOverviewCareCard } from './careCard';
import { ServicesOverviewHybridServicesCard } from './hybridServicesCard';
import { ServicesOverviewHybridCalendarCard } from './hybridCalendarCard';
import { ServicesOverviewHybridCallCard } from './hybridCallCard';
import { ServicesOverviewHybridMediaCard } from './hybridMediaCard';

angular
  .module('Hercules')
  .factory('ServicesOverviewCardFactory', ServicesOverviewCardFactory);

/* @ngInject */
function ServicesOverviewCardFactory(Authinfo, FusionClusterStatesService) {
  return {
    createCards: function (): Array<ServicesOverviewCard> {
      return [
        new ServicesOverviewMessageCard(Authinfo),
        new ServicesOverviewMeetingCard(Authinfo),
        new ServicesOverviewCallCard(Authinfo),
        new ServicesOverviewCareCard(Authinfo),
        new ServicesOverviewHybridServicesCard(),
        new ServicesOverviewHybridCalendarCard(FusionClusterStatesService),
        new ServicesOverviewHybridCallCard(FusionClusterStatesService),
        new ServicesOverviewHybridMediaCard(FusionClusterStatesService),
      ];
    },
  };
}
