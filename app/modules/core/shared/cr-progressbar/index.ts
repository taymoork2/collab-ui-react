import { CrProgressbarComponent } from './cr-progressbar.component';

export default angular.module('core.shared.cr-progressbar', [
  require('collab-ui-ng').default,
])
  .component('crProgressbar', new CrProgressbarComponent())
  .name;
