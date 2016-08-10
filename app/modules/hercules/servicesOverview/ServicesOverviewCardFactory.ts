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
function ServicesOverviewCardFactory(Authinfo, FeatureToggleService) {

  return {
    createCards: function () {

      var cards = [
        new ServicesOverviewMessageCard(Authinfo),
        new ServicesOverviewMeetingCard(Authinfo),
        new ServicesOverviewCallCard(Authinfo),
        //new ServicesOverviewCareCard(Authinfo),
        new ServicesOverviewHybridManagementCard(),
        new ServicesOverviewHybridManagementF410Card(),
        new ServicesOverviewCalendarCard(),
        new ServicesOverviewHybridCallCard(),
        new ServicesOverviewHybridMediaCard(),
        // new ServicesOverviewHybridContextCard() //removed until feature is ready.
        ];
      //console.log("1 "+cards);
      //
      //FeatureToggleService.atlasCareTrialsGetStatus().then(function (careStatus) {
      //  if(careStatus) {
      //    cards.push(new ServicesOverviewCareCard(Authinfo));
      //  }
      //
      //  //return cards;
      //});
      //
      //return cards;

      return $q(function(resolve, reject) {
        setTimeout(function() {
          if (FeatureToggleService.atlasCareTrialsGetStatus()) {
            resolve(cards);
          } else {
            reject(cards);
          }
        }, 1000);
      });
    }
  };
}

angular
  .module('Hercules')
  .factory('ServicesOverviewCardFactory', ServicesOverviewCardFactory);
