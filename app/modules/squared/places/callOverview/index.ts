import { PlaceCallOverviewComponent } from './placeCallOverview.component';
import { default as serviceModule } from '../../../huron/lines/services';
import {default as dialingModule} from '../../../huron/dialing';

export default angular
  .module('huron.place-call-overview', [
    serviceModule,
    dialingModule,
  ])
  .component('placeCallOverview', new PlaceCallOverviewComponent())
  .name;
