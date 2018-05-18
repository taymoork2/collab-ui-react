import { GridService } from '../index';
import { KeyCodes } from 'modules/core/accessibility';

interface IGridInstance extends uiGrid.IGridInstance {
  api: uiGrid.IGridApi;
  selection: ISelection;
}

interface ISelection {
  selectAll: boolean;
}

class RowSelectCellController implements ng.IComponentController {
  public csAriaLabel: string;
  public grid: IGridInstance;
  public row?: uiGrid.IGridRow;

  /* @ngInject */
  constructor(
    private GridService: GridService,
  ) {}

  public isAllSelected(): boolean {
    return this.grid.selection.selectAll;
  }

  public isRowSelected(): boolean {
    return _.get(this.row, 'isSelected', false);
  }

  public isHeader(): boolean {
    return _.isUndefined(this.row);
  }

  public selectAll(): void {
    this.GridService.toggleSelectAll(this.grid.api);
  }

  public selectRowKeypress($event: KeyboardEvent): void {
    switch ($event.which) {
      case KeyCodes.ENTER:
      case KeyCodes.SPACE:
        if (this.row) {
          this.GridService.selectRow(this.grid, this.row, true, false);
        }
        break;
    }
  }
}

export class RowSelectCellComponent implements ng.IComponentOptions {
  public template = require('./cs-row-select-cell.tpl.html');
  public controller = RowSelectCellController;
  public bindings = {
    csAriaLabel: '@',
    grid: '<',
    row: '<?',
  };
}
