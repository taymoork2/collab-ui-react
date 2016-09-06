import { PlaceCallOverviewComponent } from './placeCallOverview.component';
import { default as serviceModule } from '../../../huron/lines/services';
import { default as internationalDialing } from '../../../huron/internationalDialing'

export default angular
  .module('huron.place-call-overview', [
    serviceModule,
    internationalDialing,
  ])
  .component('placeCallOverview', new PlaceCallOverviewComponent())
  .name;