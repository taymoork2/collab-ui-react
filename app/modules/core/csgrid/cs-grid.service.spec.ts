import testModule from 'modules/core/csgrid/index';

describe('Service: GridService -', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$timeout', 'GridService', 'uiGridSelectionService');

    spyOn(this.uiGridSelectionService, 'toggleRowSelection');
  });

  it('getDefaultSelectColumn should create a selectAll column', function () {
    const selectAllColumn = this.GridService.getDefaultSelectColumn('row-aria-label');
    expect(selectAllColumn).toEqual({
      cellTemplate: `<cs-row-select-cell cs-aria-label="row-aria-label" grid="grid" row="row"></cs-row-select-cell>`,
      headerCellTemplate: `<cs-row-select-cell cs-aria-label="common.selectAll" grid="grid"></cs-row-select-cell>`,
      enableSorting: false,
      name: 'selectColumn',
      width: 50,
    });
  });

  it('handleResize should force the grid to resize', function () {
    const gridApi = {
      core: {
        handleWindowResize: jasmine.createSpy('handleWindowResize'),
      },
    };

    this.GridService.handleResize(gridApi);
    this.$timeout.flush();
    expect(gridApi.core.handleWindowResize).toHaveBeenCalled();
  });

  it('selectRow should call toggleRowSelection', function () {
    this.GridService.selectRow({}, {});
    expect(this.uiGridSelectionService.toggleRowSelection).toHaveBeenCalled();
  });

  it('toggleSelectAll should call clearSelectedRows or selectAllVisibleRows depending on the true/false response from getSelectAllState', function () {
    const gridApi = {
      selection: {
        clearSelectedRows: jasmine.createSpy('clearSelectedRows'),
        getSelectAllState: jasmine.createSpy('getSelectAllState').and.returnValue(true),
        selectAllVisibleRows: jasmine.createSpy('selectAllVisibleRows'),
      },
    };

    this.GridService.toggleSelectAll(gridApi);
    expect(gridApi.selection.getSelectAllState).toHaveBeenCalledTimes(1);
    expect(gridApi.selection.clearSelectedRows).toHaveBeenCalledTimes(1);
    expect(gridApi.selection.selectAllVisibleRows).not.toHaveBeenCalled();

    gridApi.selection.getSelectAllState.and.returnValue(false);
    this.GridService.toggleSelectAll(gridApi);
    expect(gridApi.selection.getSelectAllState).toHaveBeenCalledTimes(2);
    expect(gridApi.selection.clearSelectedRows).toHaveBeenCalledTimes(1);
    expect(gridApi.selection.selectAllVisibleRows).toHaveBeenCalledTimes(1);
  });

  describe('enforceSelectAllState should call getSelectAllState', function () {
    it('and should not call selectAllVisibleRows when getSelectAllState returns false', function () {
      const gridApi = {
        selection: {
          getSelectAllState: jasmine.createSpy('getSelectAllState').and.returnValue(false),
          selectAllVisibleRows: jasmine.createSpy('selectAllVisibleRows'),
        },
      };

      this.GridService.enforceSelectAllState(gridApi);

      expect(gridApi.selection.getSelectAllState).toHaveBeenCalledTimes(1);
      this.$timeout.flush();
      expect(gridApi.selection.selectAllVisibleRows).not.toHaveBeenCalled();
    });

    it('and should also call selectAllVisibleRows when getSelectAllState returns true', function () {
      const gridApi = {
        selection: {
          getSelectAllState: jasmine.createSpy('getSelectAllState').and.returnValue(true),
          selectAllVisibleRows: jasmine.createSpy('selectAllVisibleRows'),
        },
      };

      this.GridService.enforceSelectAllState(gridApi);

      expect(gridApi.selection.getSelectAllState).toHaveBeenCalledTimes(1);
      this.$timeout.flush();
      expect(gridApi.selection.selectAllVisibleRows).toHaveBeenCalledTimes(1);
    });
  });
});
