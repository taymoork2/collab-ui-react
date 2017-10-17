import { PlaceCallOverviewComponent } from './placeCallOverview.component';
import serviceModule from '../../../huron/lines/services';
import dialingModule from '../../../huron/dialing';
import { PlaceCallOverviewService } from './placeCallOverview.service';
import preferredLanguageModule from '../../../huron/preferredLanguage';
import FeatureToggleService from 'modules/core/featureToggle';
import primaryLineModule from 'modules/huron/primaryLine';

export { PlaceCallOverviewService };

export default angular
  .module('huron.place-call-overview', [
    serviceModule,
    dialingModule,
    preferredLanguageModule,
    FeatureToggleService,
    primaryLineModule,
  ])
  .component('placeCallOverview', new PlaceCallOverviewComponent())
  .service('PlaceCallOverviewService', PlaceCallOverviewService)
  .name;
