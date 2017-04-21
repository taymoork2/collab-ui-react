import { PstnContactInfoComponent } from './pstnContactInfo.component';

export default angular
  .module('huron.pstn-contactInfo', [
    require('scripts/app.templates'),
  ])
  .component('ucPstnContactInfo', new PstnContactInfoComponent())
  .name;
