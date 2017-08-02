import { CsGridComponent } from './csGrid.component';

// TODO: migrate to the toolkit (tech debt item)
export default angular
  .module('core.grid', [
    'ui.grid',
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
  ])
  .component('csGrid', new CsGridComponent())
  .name;
