import testModule from './index';
import { KeyCodes } from 'modules/core/accessibility';

describe('Component: csGrid', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies(
      '$componentController',
      '$q',
      '$rootScope',
      '$scope',
      '$state',
      '$timeout',
      'uiGridConstants',
    );

    this.getGridApi = (direction?: string) => {
      return {
        grid: {
          columns: [{
            enableSorting: true,
            sort: {
              direction: direction,
            },
          }],
          sortColumn: jasmine.createSpy('sortColumn').and.returnValue(this.$q.resolve(true)),
          notifyDataChange: jasmine.createSpy('notifyDataChange'),
        },
        selection: {
          clearSelectedRows: jasmine.createSpy('clearSelectedRows'),
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

    this.stateChangeFunction = jasmine.createSpy('stateChangeFunction');
    this.gridOptions = {};
    this.stateChangeSuccess = '$stateChangeSuccess';

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
        state: this.state,
        stateChangeFunction: this.stateChangeFunction,
      });
      this.controller.$onInit();
    };
  });

  it('should initialize with keyboard shortcuts added when gridAPI is provided', function () {
    this.gridApi = this.getGridApi(this.uiGridConstants.DESC);
    this.keyCode = KeyCodes.ENTER;
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
    this.keyCode = KeyCodes.ENTER;
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
    this.keyCode = KeyCodes.ENTER;
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

  it('should not call stateChangeFunction when state is not set and the $stateChangeSuccess event is fired', function () {
    this.gridApi = this.getGridApi(this.uiGridConstants.DESC);
    spyOn(this.$state, 'includes').and.returnValue(false);
    this.initController();
    this.$timeout.flush();
    this.$scope.$apply();

    this.$rootScope.$broadcast(this.stateChangeSuccess);
    expect(this.stateChangeFunction).not.toHaveBeenCalled();
    expect(this.gridApi.selection.clearSelectedRows).not.toHaveBeenCalled();
  });

  it('should call stateChangeFunction when state is set and the $stateChangeSuccess event is fired', function () {
    this.gridApi = this.getGridApi(this.uiGridConstants.DESC);
    this.state = 'places';
    spyOn(this.$state, 'includes').and.returnValue(true);
    this.initController();
    this.$timeout.flush();
    this.$scope.$apply();

    this.$rootScope.$broadcast(this.stateChangeSuccess);
    expect(this.stateChangeFunction).toHaveBeenCalled();
    expect(this.gridApi.selection.clearSelectedRows).toHaveBeenCalled();
  });
});
