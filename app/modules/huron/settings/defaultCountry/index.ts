import { HuronDefaultCountryComponent } from './defaultCountry.component';

export default angular
  .module('huron.settings.default-country', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    'pascalprecht.translate',
  ])
  .component('ucDefaultCountry', new HuronDefaultCountryComponent())
  .name;
