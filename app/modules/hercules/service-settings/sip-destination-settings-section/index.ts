import { SipDestinationSettingsSectionComponent } from './sip-destination-settings-section.component';
import './_sip-destination-settings-section.scss';

export default angular
  .module('Hercules')
  .component('sipDestinationSettingsSection', new SipDestinationSettingsSectionComponent())
  .name;
