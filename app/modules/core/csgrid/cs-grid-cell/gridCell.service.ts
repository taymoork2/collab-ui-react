export class GridCellService {
  /* @ngInject */
  constructor(
    private uiGridSelectionService,
  ) {}
  public selectRow(grid: uiGrid.IGridInstance, row: uiGrid.IGridRow): void {
    this.uiGridSelectionService.toggleRowSelection(grid, row, null, false, true);
  }
}
