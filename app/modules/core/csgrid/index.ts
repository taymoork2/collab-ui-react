import { CsGridComponent } from './csGrid.component';
import { CsGridCellComponent } from './cs-grid-cell/csGridCell.component';
import { GridService } from 'modules/core/csgrid/cs-grid.service';
import { RowSelectCellComponent } from './cs-row-select-cell/cs-row-select-cell.component';
import './cs-grid.scss';
import './cs-grid-cell/cs-grid-cell.scss';

export { GridService };
require('angular-ui-grid/ui-grid.js');

// TODO: migrate to the toolkit (tech debt item)
export default angular
  .module('core.grid', [
    'ui.grid',
    'ui.grid.selection',
    'ui.grid.saveState',
    'ui.grid.infiniteScroll',
    'ui.grid.pagination',
    'ui.grid.resizeColumns',
    require('@collabui/collab-ui-ng').default,
    require('angular-translate'),
  ])
  .component('csGrid', new CsGridComponent())
  .component('csRowSelectCell', new RowSelectCellComponent())
  .component('csGridCell', new CsGridCellComponent())
  .service('GridService', GridService)
  .name;
