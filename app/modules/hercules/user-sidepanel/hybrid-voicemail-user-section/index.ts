import { HybridVoicemailUserSectionComponent } from './hybrid-voicemail-user-section.component';

require('./_hybrid-voicemail-user-section.scss');

export default angular
  .module('Hercules')
  .component('hybridVoicemailUserSection', new HybridVoicemailUserSectionComponent())
  .name;
