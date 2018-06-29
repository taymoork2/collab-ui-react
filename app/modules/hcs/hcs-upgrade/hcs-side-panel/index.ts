import { HcsSidePanelComponent } from './hcs-side-panel.component';
import './_hcs-side-panel.scss';

export default angular
  .module('hcs.side-panel', [
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('hcsSidePanel', new HcsSidePanelComponent())
  .name;
