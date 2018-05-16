import { GridService } from 'modules/core/csgrid';

class CsGridCellCtrl {
  public cellClickFunction?: Function;
  public cellIconCss: string;
  public cellValue: string;
  public centerText: boolean;
  public grid: uiGrid.IGridInstance;
  public row: uiGrid.IGridRow;

  /* @ngInject */
  constructor(
    private GridService: GridService,
  ) {}

  public click(): void {
    this.GridService.selectRow(this.grid, this.row);

    if (_.isFunction(this.cellClickFunction)) {
      this.cellClickFunction(this.row.entity);
    }
  }
}

export class CsGridCellComponent implements ng.IComponentOptions {
  public template = require('modules/core/csgrid/cs-grid-cell/csGridCell.tpl.html');
  public controller = CsGridCellCtrl;
  public bindings = {
    cellClickFunction: '&',
    cellIconCss: '@',
    cellValue: '<',
    centerText: '<',
    grid: '<',
    row: '<',
  };
}
