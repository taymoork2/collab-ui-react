import { CsGridComponent } from './csGrid.component';
import { CsGridCellComponent } from './cs-grid-cell/csGridCell.component';
import './cs-grid-cell/cs-grid-cell.scss';

// TODO: migrate to the toolkit (tech debt item)
export default angular
  .module('core.grid', [
    'ui.grid',
    require('scripts/app.templates'),
    require('collab-ui-ng').default,
  ])
  .component('csGrid', new CsGridComponent())
  .component('csGridCell', new CsGridCellComponent())
  .name;
