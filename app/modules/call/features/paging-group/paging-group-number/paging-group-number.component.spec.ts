import pagingGroupNumberModule from './index';

describe('Component: ucPagingGroupNumber', () => {
  const PG_NUMBER_SELECT = '.csSelect-container[name="pagingGroupNumber"]';
  const DROPDOWN_OPTIONS = '.dropdown-menu ul li';
  const DROPDOWN_FILTER = '.dropdown-menu input.select-filter';
  const internalNumberOptions = ['1000', '1001', '1002'];

  beforeEach(function () {
    this.initModules(pagingGroupNumberModule);
    this.injectDependencies(
      '$scope',
      '$timeout',
    );

    this.$scope.onChangeFn = jasmine.createSpy('onChangeFn');
    this.$scope.onNumberFilter = jasmine.createSpy('onNumberFilter');

    this.compileComponent('ucPagingGroupNumber', {
      extension: 'extension',
      internalNumberOptions: internalNumberOptions,
      onNumberFilter: 'onNumberFilter(filter)',
      onChangeFn: 'onChangeFn(extension)',
    });
  });

  describe('Edit Mode: ', () => {
    it('should have a drop down select box', function () {
      expect(this.view).toContainElement(PG_NUMBER_SELECT);
    });

    it('should have list of internal numbers', function () {
      expect(this.view.find(PG_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0)).toHaveText('1000');
      expect(this.view.find(PG_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(1)).toHaveText('1001');
      expect(this.view.find(PG_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(2)).toHaveText('1002');
    });

    it('should call onNumberFilter when filtering numbers list', function() {
      this.view.find(PG_NUMBER_SELECT).find(DROPDOWN_FILTER).val('search value').change();
      this.$timeout.flush(); // for cs-select
      expect(this.$scope.onNumberFilter).toHaveBeenCalledWith('search value');
    });

    it('should call onChangeFn when an internal number is chosen', function() {
      this.view.find(PG_NUMBER_SELECT).find(DROPDOWN_OPTIONS).get(0).click();
      expect(this.$scope.onChangeFn).toHaveBeenCalledWith('1000');
    });
  });

});
