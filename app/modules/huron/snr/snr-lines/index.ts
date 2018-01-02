import './snr-lines.component.scss';

import { SnrLinesComponent } from './snr-lines.component';

export default angular
 .module('huron.snr.snr-lines', [
   require('@collabui/collab-ui-ng').default,
   require('angular-translate'),
 ])
 .component('ucSnrLines', new SnrLinesComponent())
 .name;
