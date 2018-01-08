import { CareNumbersComponent } from 'modules/sunlight/numbers/care-numbers.component';

export default angular
  .module('Sunlight.numbers', [
    require('modules/core/scripts/services/authinfo'),
  ])
  .component('careNumbersComponent', new CareNumbersComponent())
  .name;
