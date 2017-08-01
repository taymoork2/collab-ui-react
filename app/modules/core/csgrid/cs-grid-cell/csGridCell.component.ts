class CsGridCellCtrl {
  public cellFunction: Function;
  public cellString: string;
  public row: any;

  /* @ngInject */
  constructor() {}

  public click(entity): void {
    if (_.isFunction(this.cellFunction)) {
      this.cellFunction(entity);
    }
  }
}

export class CsGridCellComponent implements ng.IComponentOptions {
  public templateUrl = 'modules/core/csgrid/cs-grid-cell/csGridCell.tpl.html';
  public controller = CsGridCellCtrl;
  public bindings = {
    cellFunction: '&',
    cellString: '@',
    row: '<',
  };
}
