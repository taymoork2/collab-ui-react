import testModule from 'modules/core/csgrid/index';

describe('Service: GridCellService -', () => {
  beforeEach(function () {
    this.initModules(testModule);
    this.injectDependencies('GridCellService', 'uiGridSelectionService');

    spyOn(this.uiGridSelectionService, 'toggleRowSelection');
  });

  it('selectRow should call toggleRowSelection', function () {
    this.GridCellService.selectRow({}, {});
    expect(this.uiGridSelectionService.toggleRowSelection).toHaveBeenCalled();
  });
});
