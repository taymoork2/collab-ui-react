describe('Component: directoryNumber', () => {
  const SEARCH_INPUT = '[name="search"]';
  const SEARCH_BUTTON = '.btn-primary';
  const ADD_BUTTON = '.btn--people';
  const CHECKBOX = 'cs-checkbox label';

  beforeEach(function () {
    this.initModules('Huron');
    this.injectDependencies(
      '$scope',
      '$timeout',
    );
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
    this.$scope.searchResults = ['+1817-932-1111', '+1817-932-1112'];
  });

  function initComponent() {
    this.compileComponent('pstnSelector', {
      search: 'search(value)',
      addToCart: 'addToCart(searchResultModel)',
      searchResults: 'searchResults',
      paginateOptions: 'paginateOptions',
      showNoResult: 'showNoResult',
      maxSelection: 'maxSelection',
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
      expect(this.view.find(ADD_BUTTON).get(0)).toBeDisabled();
    });

    it('add button should be enabled if a number is checked', function () {
      this.view.find(CHECKBOX).get(0).click();
      this.view.find(ADD_BUTTON).get(0).click();
      this.controller.addCart();
      expect(this.$scope.addToCart).toHaveBeenCalled();
    });

  });
});
