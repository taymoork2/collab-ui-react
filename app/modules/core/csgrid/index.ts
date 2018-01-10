import { CsGridComponent } from './csGrid.component';
import { CsGridCellComponent } from './cs-grid-cell/csGridCell.component';
import { GridCellService } from './cs-grid-cell/gridCell.service';
import './cs-grid.scss';
import './cs-grid-cell/cs-grid-cell.scss';

export { GridCellService };

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
  ])
  .component('csGrid', new CsGridComponent())
  .component('csGridCell', new CsGridCellComponent())
  .service('GridCellService', GridCellService)
  .name;
