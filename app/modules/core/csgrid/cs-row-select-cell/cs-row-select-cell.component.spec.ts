import testModule from 'modules/core/csgrid/index';
import { KeyCodes } from 'modules/core/accessibility';

describe('Component: csRowSelectCell', () => {
  const CHECKBOX = '.ui-grid-icon-ok';

  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$scope', 'GridService');

    this.gridApi = {
      api: {},
      selection: {
        selectAll: false,
      },
    };
  });

  it('should create a header cell when row is undefined', function () {
    spyOn(this.GridService, 'toggleSelectAll').and.callFake(() => {
      this.gridApi.selection.selectAll = !this.gridApi.selection.selectAll;
    });
    const selectAllClass = 'ui-grid-all-selected';

    this.compileComponent('csRowSelectCell', {
      csAriaLabel: 'common.selectAll',
      grid: this.gridApi,
    });

    expect(this.view.find(CHECKBOX)[0].classList.contains(selectAllClass)).toBe(false);
    expect(this.controller.isAllSelected()).toBe(false);
    expect(this.controller.isHeader()).toBe(true);

    this.view.find(CHECKBOX).click();
    this.$scope.$apply();
    expect(this.GridService.toggleSelectAll).toHaveBeenCalledTimes(1);
    expect(this.controller.isAllSelected()).toBe(true);
    expect(this.view.find(CHECKBOX)[0].classList.contains(selectAllClass)).toBe(true);
  });

  it('should create a row cell when row is defined', function () {
    const rowSelectedClass = 'ui-grid-row-selected';
    const row = {
      entity: {},
      isSelected: false,
    };
    spyOn(this.GridService, 'selectRow').and.callFake(() => {
      row.isSelected = !row.isSelected;
    });

    this.compileComponent('csRowSelectCell', {
      csAriaLabel: 'common.selectAll',
      grid: this.gridApi,
      row: row,
    });

    expect(this.view.find(CHECKBOX)[0].classList.contains(rowSelectedClass)).toBe(false);
    expect(this.controller.isRowSelected()).toBe(false);
    expect(this.controller.isHeader()).toBe(false);

    // because this grid column type only works with multi-select, the mouse click event is taken care of by
    // ui-grid's row selection but the keyboard event is not
    this.view.find(CHECKBOX)[0].triggerHandler({
      type: 'keypress',
      which: KeyCodes.ENTER,
    });
    this.$scope.$apply();
    expect(this.GridService.selectRow).toHaveBeenCalledTimes(1);
    expect(this.view.find(CHECKBOX)[0].classList.contains(rowSelectedClass)).toBe(true);
    expect(this.controller.isRowSelected()).toBe(true);
  });
});
