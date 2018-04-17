import { CareNumbersComponent } from 'modules/sunlight/numbers/care-numbers.component';
import featureModule from 'modules/core/featureToggle';
import './_care-numbers.scss';

export default angular
  .module('Sunlight.numbers', [
    require('modules/core/scripts/services/authinfo'),
    featureModule,
  ])
  .component('careNumbersComponent', new CareNumbersComponent())
  .name;
