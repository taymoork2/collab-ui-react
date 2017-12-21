import { CrProgressbarComponent } from './cr-progressbar.component';

export default angular.module('core.shared.cr-progressbar', [
  require('@collabui/collab-ui-ng').default,
])
  .component('crProgressbar', new CrProgressbarComponent())
  .name;
