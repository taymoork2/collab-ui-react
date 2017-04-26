import { FilteredView } from 'modules/squared/common/filtered-view/filtered-view';
describe('Class: FilteredView', () => {

  let test: any = {};

  let serverSideSearchRes = {
    'url1': { displayName: 'abc', devices: [{}, {}] },
    'url2': { displayName: 'abcd' },
    'url3': { displayName: 'abcde', devices: [{}, {}] },
    'url4': { displayName: 'abcdef' },
  };

  beforeEach(function () {
    this.initModules('Squared');
    this.injectDependencies(
      '$q',
      '$timeout',
      '$rootScope',
    );
    test = this;
  });

  afterEach(function () {
    test.controller = null;
    test.$rootScope.$digest();
    test.$rootScope = undefined;
  });

  let initController = (searchOnly: boolean) => {
    test.mockDataSource = {
      getAll: () => {
        throw Error('getAll should only be called when mocked in tests');
      },
      search: () => {
        throw Error('search should only be called when mocked in tests');
      },
      isSearchOnly: () => {
        return test.$q.resolve(searchOnly);
      },
    };
    test.mockMatcher = {
      matchesSearch: () => {
        throw Error('matchesSearch should only be called when mocked in tests');
      },
    };
    test.controller = new FilteredView(test.mockDataSource,
      test.mockMatcher,
      test.$timeout,
      test.$q);
  };

  describe('searchOnly', () => {

    beforeEach(() => {
      initController(true);
    });

    it('should be in searchOnly state', () => {
      expect(test.controller.isInState(test.controller.searchonly));
    });

    describe('with server side search result', () => {
      beforeEach(() => {
        spyOn(test.mockDataSource, 'search').and.returnValue(test.$q.resolve(serverSideSearchRes));
      });

      it('with client side search not matching terms', () => {
        spyOn(test.mockMatcher, 'matchesSearch').and.returnValue(false);
        let searchResult;
        test.controller.setCurrentSearch('abc').then(res => {
          searchResult = res;
        });

        test.$timeout.flush(10000);
        test.$rootScope.$digest();
        expect(searchResult.length).toBe(0);
      });

      describe('with client side search matching terms', () => {
        beforeEach(() => {
          spyOn(test.mockMatcher, 'matchesSearch').and.returnValue(true);
        });

        describe('without filter', () => {
          it('should return result for abc', () => {
            let searchResult;
            test.controller.setCurrentSearch('abc').then(res => {
              searchResult = res;
            });

            test.$timeout.flush(10000);
            test.$rootScope.$digest();
            expect(searchResult.length).toBe(4);
          });

          it('should do a single search when refining search', () => {
            test.controller.setCurrentSearch('abc').then(() => {
              test.controller.setCurrentSearch('abcd').then(() => {
              });
            });

            test.$timeout.flush(10000);
            test.$rootScope.$digest();
            test.$timeout.flush(10000);
            test.$rootScope.$digest();
            expect(test.mockDataSource.search.calls.count()).toBe(1);
          });

          it('should do a new search when changing search', () => {
            test.controller.setCurrentSearch('abc').then(() => {
              test.controller.setCurrentSearch('def').then(() => {
              });
            });

            test.$timeout.flush(10000);
            test.$rootScope.$digest();
            test.$timeout.flush(10000);
            test.$rootScope.$digest();
            expect(test.mockDataSource.search.calls.count()).toBe(2);
          });

          it('should do a new search when broadening search', () => {
            test.controller.setCurrentSearch('abcde').then(() => {
              test.controller.setCurrentSearch('abcd').then(() => {
              });
            });

            test.$timeout.flush(10000);
            test.$rootScope.$digest();
            test.$timeout.flush(10000);
            test.$rootScope.$digest();
            expect(test.mockDataSource.search.calls.count()).toBe(2);
          });

          it('should not do a new search when broadening an already refined search', () => {
            test.controller.setCurrentSearch('abc').then(() => {
              test.controller.setCurrentSearch('abcde').then(() => {
                test.controller.setCurrentSearch('abcd').then(() => {
                });
              });
            });

            test.$timeout.flush(10000);
            test.$rootScope.$digest();
            test.$timeout.flush(10000);
            test.$rootScope.$digest();
            test.$timeout.flush(10000);
            test.$rootScope.$digest();
            expect(test.mockDataSource.search.calls.count()).toBe(1);
          });
        });

        describe('with filter', () => {
          let filter;

          beforeEach(() => {
            filter = {
              count: 0,
              filterValue: 'displayName',
              passes: () => {
                throw Error('passes should only be called when mocked in tests');
              },
            };
            test.controller.setFilters([filter]);
            test.controller.setCurrentFilterValue('displayName');
          });

          it('should return only results that pass the filter', () => {
            spyOn(filter, 'passes').and.callFake((item) => {
              return item.displayName.length === 3;
            });
            test.controller.setCurrentSearch('abc').then(res => {
              expect(res.length).toBe(1);
            });

            test.$timeout.flush(10000);
            test.$rootScope.$digest();
          });
        });
      });
    });
  });
});
