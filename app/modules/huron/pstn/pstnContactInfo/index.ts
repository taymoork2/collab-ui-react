import { PstnContactInfoComponent } from './pstnContactInfo.component';

export default angular
  .module('huron.pstn-contactInfo', [
    'atlas.templates',
  ])
  .component('ucPstnContactInfo', new PstnContactInfoComponent())
  .name;
