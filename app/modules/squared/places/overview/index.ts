import './placeOverview.scss';

import { PlaceOverviewComponent } from './placeOverview.component';
import { PlaceCallOverviewService } from 'modules/squared/places/callOverview/placeCallOverview.service';
import preferredLanguageModule from 'modules/huron/preferredLanguage';
import { LocationsService } from 'modules/call/locations/shared';

export default angular
  .module('huron.place-overview', [
    preferredLanguageModule,
  ])
  .component('placeOverview', new PlaceOverviewComponent())
  .service('PlaceCallOverviewService', PlaceCallOverviewService)
  .service('LocationsService', LocationsService)
  .name;
