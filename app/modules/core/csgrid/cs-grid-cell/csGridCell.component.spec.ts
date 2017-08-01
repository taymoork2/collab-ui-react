import testModule from 'modules/core/csgrid/index';

describe('Component: csGrid', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('$componentController');

    this.cellFunction = jasmine.createSpy('cellFunction');
    this.cellString = 'dummy.string';
    this.row = {
      entity: {},
      isSelected: true,
    };

    this.controller = this.$componentController('csGridCell', { }, {
      cellFunction: this.cellFunction,
      cellString: this.cellString,
      row: this.row,
    });
  });

  it('should call cellFunction on click() if cellFunction is defined', function () {
    this.controller.click(this.row.entity);
    expect(this.cellFunction).toHaveBeenCalledWith(this.row.entity);
  });
});
