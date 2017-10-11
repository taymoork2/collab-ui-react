import './placeOverview.scss';

import { PlaceOverviewComponent } from './placeOverview.component';

import placeCallOverviewServiceModule from 'modules/squared/places/callOverview';
import preferredLanguageModule from 'modules/huron/preferredLanguage';
import locationsServiceModule from 'modules/call/locations/shared';

export default angular
  .module('huron.place-overview', [
    preferredLanguageModule,
    placeCallOverviewServiceModule,
    locationsServiceModule,
  ])
  .component('placeOverview', new PlaceOverviewComponent())
  .name;
