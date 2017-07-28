import { HuronDefaultCountryComponent } from './settings-default-country.component';

export default angular
  .module('call.settings.default-country', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucDefaultCountry', new HuronDefaultCountryComponent())
  .name;
