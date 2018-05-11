export class GridService {

  /* @ngInject */
  constructor(
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private uiGridSelectionService,
  ) {}

  public getDefaultSelectColumn(ariaLabel: string): uiGrid.IColumnDef {
    return {
      cellTemplate: `<cs-row-select-cell cs-aria-label="${ariaLabel}" grid="grid" row="row"></cs-row-select-cell>`,
      headerCellTemplate: `<cs-row-select-cell cs-aria-label="${this.$translate.instant('common.selectAll')}" grid="grid"></cs-row-select-cell>`,
      enableSorting: false,
      name: 'selectColumn',
      width: 50,
    };
  }

  public handleResize(gridApi: uiGrid.IGridApi, timeout?: number) {
    this.$timeout(gridApi.core.handleWindowResize, timeout);
  }

  // should match defaults for grids where multiSelect is false and rows are unselected by closing the side panel
  public selectRow(grid: uiGrid.IGridInstance, row: uiGrid.IGridRow, multiSelect: boolean = false, noUnselect: boolean = true): void {
    this.uiGridSelectionService.toggleRowSelection(grid, row, null, multiSelect, noUnselect);
  }

  public toggleSelectAll(gridApi: uiGrid.IGridApi) {
    const selectAllState = gridApi.selection.getSelectAllState();
    if (selectAllState) {
      gridApi.selection.clearSelectedRows();
    } else {
      gridApi.selection.selectAllVisibleRows();
    }
  }
}
