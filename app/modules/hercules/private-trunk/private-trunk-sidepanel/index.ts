import { PrivateTrunkSidepanelComponent } from './private-trunk-sidepanel.component';

require('./_private-trunk-sidepanel.scss');

export default angular
  .module('Hercules')
  .component('privateTrunkSidepanel', new PrivateTrunkSidepanelComponent())
  .name;
