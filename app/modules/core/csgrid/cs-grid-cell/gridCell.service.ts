export class GridCellService {
  /* @ngInject */
  constructor(
    private uiGridSelectionService,
  ) {}

  public readonly ENTER: number = 13;
  public readonly SPACE: number = 32;

  public selectRow(grid: uiGrid.IGridInstance, row: uiGrid.IGridRow): void {
    this.uiGridSelectionService.toggleRowSelection(grid, row, null, false, true);
  }
}
