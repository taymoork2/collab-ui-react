import { PstnContactInfoComponent } from './pstnContactInfo.component';

export default angular
  .module('huron.pstn.pstn-contactInfo', [
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('ucPstnContactInfo', new PstnContactInfoComponent())
  .name;
