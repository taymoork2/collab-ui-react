import testModule from './index';

describe('Component: csGrid', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$componentController',
      '$q',
      '$scope',
      '$timeout',
      'GridCellService',
      'uiGridConstants',
    );

    this.getGridApi = (direction?: string) => {
      return {
        grid: {
          columns: [{
            sort: {
              direction: direction,
            },
          }],
          sortColumn: jasmine.createSpy('sortColumn').and.returnValue(this.$q.resolve(true)),
          notifyDataChange: jasmine.createSpy('notifyDataChange'),
        },
      };
    };

    this.defaultGridOptions = {
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableHorizontalScrollbar: 0,
      enableRowHeaderSelection: false,
      enableRowSelection: false,
      enableSorting: true,
      multiSelect: false,
    };

    this.gridOptions = {};

    this.$element = {
      find: jasmine.createSpy('find').and.returnValue({
        each: (callback: Function): void => {
          callback(0, {
            addEventListener: (eventType: string, eventCallback: Function): void => {
              expect(eventType).toEqual('keypress');
              eventCallback({
                keyCode: this.keyCode,
              });
            },
          });
        },
      }),
    };

    this.initController = (): void => {
      this.controller = this.$componentController('csGrid', {
        $element: this.$element,
        $timeout: this.$timeout,
        uiGridConstants: this.uiGridConstants,
      }, {
        gridApi: this.gridApi,
        gridOptions: this.gridOptions,
        name: 'GridID',
        spinner: this.spinner,
      });
      this.controller.$onInit();
    };
  });

  it('should initialize with keyboard shortcuts added when gridAPI is provided', function () {
    this.gridApi = this.getGridApi(this.uiGridConstants.DESC);
    this.keyCode = this.GridCellService.ENTER;
    this.spinner = true;
    this.gridOptions.onRegisterApi = jasmine.any(Function);
    const allOptions = _.defaults(this.gridOptions, this.defaultGridOptions);

    this.initController();
    this.$timeout.flush();
    this.$scope.$apply();

    expect(this.controller.gridOptions).toEqual(allOptions);
    expect(this.$element.find).toHaveBeenCalledTimes(1);
    expect(this.gridApi.grid.sortColumn).toHaveBeenCalledWith(this.gridApi.grid.columns[0]);
    expect(this.gridApi.grid.notifyDataChange).toHaveBeenCalledTimes(1);
  });

  it('should initialize with keyboard shortcuts added when gridAPI is not provided', function () {
    const gridApi = this.getGridApi(this.uiGridConstants.ASC);
    this.keyCode = this.GridCellService.ENTER;
    this.spinner = true;
    this.initController();
    this.controller.gridOptions.onRegisterApi(gridApi);
    this.$timeout.flush();
    this.$scope.$apply();

    this.defaultGridOptions.onRegisterApi = jasmine.any(Function);

    expect(this.controller.gridOptions).toEqual(this.defaultGridOptions);
    expect(this.$element.find).toHaveBeenCalledTimes(1);
    expect(gridApi.grid.sortColumn).toHaveBeenCalledWith(gridApi.grid.columns[0], this.uiGridConstants.DESC);
    expect(gridApi.grid.notifyDataChange).toHaveBeenCalledTimes(1);
  });

  it('should not create sorting shortcuts when sorting is false', function () {
    const gridApi = this.getGridApi();
    this.keyCode = this.GridCellService.ENTER;
    this.spinner = true;
    this.gridOptions.enableSorting = false;

    const allOptions = _.defaults(this.gridOptions, this.defaultGridOptions);
    this.initController();
    this.controller.gridOptions.onRegisterApi(gridApi);
    this.$timeout.flush();
    this.$scope.$apply();

    expect(this.controller.gridOptions).toEqual(allOptions);
    expect(this.$element.find).not.toHaveBeenCalled();
    expect(gridApi.grid.sortColumn).not.toHaveBeenCalled();
    expect(gridApi.grid.notifyDataChange).not.toHaveBeenCalled();
  });
});
