import { GridCellService } from './cs-grid-cell/gridCell.service';

class CsGridCtrl {
  public gridOptions: uiGrid.IGridOptions;
  public gridApi: uiGrid.IGridApi;
  public name: string;
  public spinner: boolean;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $timeout: ng.ITimeoutService,
    private GridCellService: GridCellService,
    private uiGridConstants: uiGrid.IUiGridConstants,
  ) {}

  public $onInit() {
    const defaultGridOptions: uiGrid.IGridOptions = {
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableHorizontalScrollbar: 0,
      enableRowHeaderSelection: false,
      enableRowSelection: false,
      enableSorting: true,
      multiSelect: false,
    };

    this.gridOptions = _.defaults(this.gridOptions, defaultGridOptions);

    if (_.isUndefined(this.gridOptions.onRegisterApi)) {
      this.gridOptions.onRegisterApi = (gridApi: uiGrid.IGridApi): void => {
        this.gridApi = gridApi;
      };
    }

    if (this.gridOptions.enableSorting) {
      this.$timeout((): void => {
        this.setSortableHeaders();
      });
    }
  }

  private setSortableHeaders(): void {
    this.$element.find('.ui-grid-header-cell-primary-focus').each((index: number, elem: Element) => {
      elem.addEventListener('keypress', (event: JQueryEventObject): void => {
        const column = _.get(this.gridApi, `grid.columns[${index}]`, undefined);
        const columnDirection = _.get(column, 'sort.direction', undefined);

        if (this.gridApi && column && (event.keyCode === this.GridCellService.ENTER || event.keyCode === this.GridCellService.SPACE)) {
          if (columnDirection === this.uiGridConstants.ASC) {
            this.gridApi.grid.sortColumn(column, this.uiGridConstants.DESC).then((): void => {
              this.gridApi.grid.notifyDataChange(this.uiGridConstants.dataChange.ALL);
            });
          } else if (columnDirection === this.uiGridConstants.DESC) {
            this.gridApi.grid.sortColumn(column).then((): void => {
              this.gridApi.grid.notifyDataChange(this.uiGridConstants.dataChange.ALL);
            });
          } else {
            this.gridApi.grid.sortColumn(column, this.uiGridConstants.ASC).then((): void => {
              this.gridApi.grid.notifyDataChange(this.uiGridConstants.dataChange.ALL);
            });
          }
        }
      });
    });
  }
}

export class CsGridComponent implements ng.IComponentOptions {
  public templateUrl = 'modules/core/csgrid/csGrid.tpl.html';
  public controller = CsGridCtrl;
  public bindings = {
    gridApi: '<',
    gridOptions: '=',
    name: '@',
    spinner: '<',
  };
}
