import { KeyCodes } from 'modules/core/accessibility';
import { CoreEvent } from 'modules/core/shared/event.constants';

class CsGridCtrl {
  public gridOptions: uiGrid.IGridOptions;
  public gridApi?: uiGrid.IGridApi;
  public name: string;
  public spinner?: boolean;
  public state?: string;
  public stateChangeFunction?: Function;

  /* @ngInject */
  constructor(
    private $element: ng.IRootElementService,
    private $rootScope: ng.IRootScopeService,
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
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
    const resizeGridEvent = this.$rootScope.$on(CoreEvent.SIDENAV_RESIZED, () => {
      this.$timeout(() => {
        if (this.gridApi) {
          this.gridApi.core.handleWindowResize();
        }
      }, 500);
    });
    this.$scope.$on('$destroy', resizeGridEvent);

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

    if (this.state) {
      const stateChangeEvent = this.$rootScope.$on('$stateChangeSuccess', (): void => {
        if (this.state && this.$state.includes(this.state)) {
          if (this.stateChangeFunction) {
            this.stateChangeFunction();
          }

          if (this.gridApi) {
            this.gridApi.selection.clearSelectedRows();
          }
        }
      });
      this.$scope.$on('$destroy', stateChangeEvent);
    }
  }

  private setSortableHeaders(): void {
    this.$element.find('.ui-grid-header-cell-primary-focus').each((index: number, elem: Element) => {
      elem.addEventListener('keypress', (event: JQueryEventObject): void => {
        const column = _.get(this.gridApi, `grid.columns[${index}]`, undefined);
        if (_.get(column, 'enableSorting', false)) { // sorting is true by default and must be set false in the columnDef
          const columnDirection = _.get(column, 'sort.direction', undefined);

          if (this.gridApi && column && (event.keyCode === KeyCodes.ENTER || event.keyCode === KeyCodes.SPACE)) {
            if (columnDirection === this.uiGridConstants.ASC) {
              this.gridApi.grid.sortColumn(column, this.uiGridConstants.DESC).then((): void => {
                this.gridApi!.grid.notifyDataChange(this.uiGridConstants.dataChange.ALL);
              });
            } else if (columnDirection === this.uiGridConstants.DESC) {
              this.gridApi.grid.sortColumn(column).then((): void => {
                this.gridApi!.grid.notifyDataChange(this.uiGridConstants.dataChange.ALL);
              });
            } else {
              this.gridApi.grid.sortColumn(column, this.uiGridConstants.ASC).then((): void => {
                this.gridApi!.grid.notifyDataChange(this.uiGridConstants.dataChange.ALL);
              });
            }
          }
        }
      });
    });
  }
}

export class CsGridComponent implements ng.IComponentOptions {
  public template = require('modules/core/csgrid/csGrid.tpl.html');
  public controller = CsGridCtrl;
  public bindings = {
    gridApi: '<?',
    gridOptions: '=',
    name: '@?',
    spinner: '<?',
    state: '@?',
    stateChangeFunction: '&?',
  };
}
