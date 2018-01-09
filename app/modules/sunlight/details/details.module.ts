import featuresModule from 'modules/core/featureToggle';
import { DetailsHeaderComponent } from 'modules/sunlight/details/detailsHeaderCtrl';

export default angular
  .module('CareDetails', [
    featuresModule,
    require('collab-ui-ng').default,
  ])
  .component('detailsHeaderComponent', new DetailsHeaderComponent())
  .name;
