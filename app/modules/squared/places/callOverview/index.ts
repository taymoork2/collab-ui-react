import { PlaceCallOverviewComponent } from './placeCallOverview.component';
import serviceModule from '../../../huron/lines/services';
import dialingModule from '../../../huron/dialing';
import { PlaceCallOverviewService } from './placeCallOverviewService.service';

export default angular
  .module('huron.place-call-overview', [
    serviceModule,
    dialingModule,
  ])
  .component('placeCallOverview', new PlaceCallOverviewComponent())
  .service('PlaceCallOverviewService', PlaceCallOverviewService)
  .name;
