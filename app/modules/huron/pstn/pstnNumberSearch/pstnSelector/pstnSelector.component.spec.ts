import pstnSelector from './index';
import { NumberModel } from '../number.model';

describe('Component: PstnSelectorComponent', () => {
  const SEARCH_INPUT = '[name="search"]';
  const SEARCH_BUTTON = '.btn-primary';

  beforeEach(function () {
    this.initModules(pstnSelector);
    this.injectDependencies(
      '$scope',
      '$timeout',
    );
    this.$scope.model = new NumberModel();
    this.$scope.search = jasmine.createSpy('search');
    this.$scope.addToCart = jasmine.createSpy('addToCart');
    this.$scope.paginateOptions = {
      currentPage: 0,
      pageSize: 15,
      numberOfPages: function () {
        return Math.ceil(this.$scope.searchResults.length / this.pageSize);
      },
      previousPage: function () {
        this.currentPage--;
      },
      nextPage: function () {
        this.currentPage++;
      },
    };
    this.$scope.maxSelection = 10;
    this.$scope.errorMessage = 'Test: Error Message';
  });

  function initComponent() {
    this.compileComponent('ucPstnSelector', {
      model: 'model',
      search: 'search(value)',
      addToCart: 'addToCart(searchResultModel)',
      simple: 'true',
      errorMessage: 'errorMessage',
    });
  }

  describe('trial flow', () => {
    beforeEach(initComponent);

    it('should have search input', function () {
      expect(this.view.find(SEARCH_INPUT)).toExist();
      expect(this.controller.maxLength).toEqual('6');
    });

    it('should be disabled if the pattern is incorrect', function () {
      this.view.find(SEARCH_INPUT).val('2').change();
      expect(this.view.find(SEARCH_BUTTON).get(0)).toBeDisabled();
    });

    it('should be enabled if the pattern is correct', function () {
      this.view.find(SEARCH_INPUT).val('206').change();
      this.view.find(SEARCH_BUTTON).get(0).click();
      expect(this.$scope.search).toHaveBeenCalled();
    });

  });
});
