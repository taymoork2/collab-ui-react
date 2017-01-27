import './placeOverview.scss';

import { PlaceOverviewComponent } from './placeOverview.component';
import { PlaceCallOverviewService } from '../callOverview/placeCallOverviewService.service';

export default angular
  .module('Squared')
  .component('placeOverview', new PlaceOverviewComponent())
  .service('PlaceCallOverviewService', PlaceCallOverviewService);
