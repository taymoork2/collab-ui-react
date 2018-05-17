import testModule from 'modules/core/csgrid/index';

describe('Component: csGridCell', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$componentController', 'GridService');

    spyOn(this.GridService, 'selectRow');

    this.cellClickFunction = jasmine.createSpy('cellClickFunction');
    this.cellValue = 'dummy.string';
    this.row = {
      entity: {},
      isSelected: true,
    };

    this.controller = this.$componentController('csGridCell', { }, {
      cellClickFunction: this.cellClickFunction,
      cellValue: this.cellValue,
      row: this.row,
      grid: {},
    });
  });

  it('should call cellClickFunction on click() if cellClickFunction is defined', function () {
    this.controller.click(this.row.entity);
    expect(this.cellClickFunction).toHaveBeenCalledWith(this.row.entity);
    expect(this.GridService.selectRow).toHaveBeenCalled();
  });
});
