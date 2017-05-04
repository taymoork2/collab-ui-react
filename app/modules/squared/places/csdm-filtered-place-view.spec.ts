import IPlace = csdm.IPlace;
import { FilteredPlaceViewDataSource } from './FilteredPlaceViewDataSource';
import { PlaceMatcher } from 'modules/squared/places/place-matcher';
import { FilteredView } from 'modules/squared/common/filtered-view/filtered-view';
describe('Class: FilteredView', () => {

  let test: any = {};

  let serverSideSearchRes = {
    url1: { displayName: 'abc', devices: [{}, {}] },
    url2: { displayName: 'abcd' },
    url3: { displayName: 'abcde', devices: [{}, {}] },
    url4: { displayName: 'abcdef' },
  };

  beforeEach(function () {
    this.initModules('Squared');
    this.injectDependencies(
      'CsdmDataModelService',
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

  let initController = (bigOrg: boolean) => {
    spyOn(test.CsdmDataModelService, 'isBigOrg').and.returnValue(test.$q.resolve(bigOrg));
    test.controller = new FilteredView(new FilteredPlaceViewDataSource(test.CsdmDataModelService),
      new PlaceMatcher(),
      test.$timeout,
      test.$q);
  };

  describe('bigOrg', () => {

    beforeEach(() => {
      initController(true);
    });

    it('should be in searchOnly state', () => {
      expect(test.controller.isInState(test.controller.searchonly));
    });

    describe(' with server side search result', () => {
      beforeEach(() => {
        spyOn(test.CsdmDataModelService, 'getSearchPlacesMap').and.returnValue(test.$q.resolve(serverSideSearchRes));
      });

      describe(' without filter', () => {
        it('should return result for abc', () => {
          test.controller.setCurrentSearch('abc').then(res => {
            expect(res.length).toBe(4);
          });

          test.$timeout.flush(10000);
          test.$rootScope.$digest();
        });

        it('should return result for abcd', () => {
          test.controller.setCurrentSearch('abcd').then(res => {
            expect(res.length).toBe(3);
          });

          test.$timeout.flush(10000);
          test.$rootScope.$digest();
        });

        it('should return result for abcde', () => {
          test.controller.setCurrentSearch('abcde').then(res => {
            expect(res.length).toBe(2);
          });

          test.$timeout.flush(10000);
          test.$rootScope.$digest();
        });

        it('should return result for abcdef', () => {
          test.controller.setCurrentSearch('abcdef').then(res => {
            expect(res.length).toBe(1);
          });

          test.$timeout.flush(10000);
          test.$rootScope.$digest();
        });

        it('should return no result when too specific', () => {
          test.controller.setCurrentSearch('abcdefg').then(res => {
            expect(res.length).toBe(0);
          });

          test.$timeout.flush(10000);
          test.$rootScope.$digest();
        });
      });

      describe(' with device filter', () => {

        beforeEach(() => {
          test.controller.setFilters([{
            count: 0,
            //   name: 'CsdmStatus.WithDevices',
            filterValue: 'devices',
            passes: function (place: IPlace) {
              return _.size(place.devices) > 0;
            },
          }]);
          test.controller.setCurrentFilterValue('devices');
        });

        it('should return result abc', () => {
          test.controller.setCurrentSearch('abc').then(res => {
            expect(res.length).toBe(2);
          });

          test.$timeout.flush(10000);
          test.$rootScope.$digest();
        });

        it('should return result abcd', () => {
          test.controller.setCurrentSearch('abcd').then(res => {
            expect(res.length).toBe(1);
          });

          test.$timeout.flush(10000);
          test.$rootScope.$digest();
        });

        it('should return result abcde', () => {
          test.controller.setCurrentSearch('abcde').then(res => {
            expect(res.length).toBe(1);
          });

          test.$timeout.flush(10000);
          test.$rootScope.$digest();
        });

        it('should return result abcdef', () => {
          test.controller.setCurrentSearch('abcdef').then(res => {
            expect(res.length).toBe(0);
          });

          test.$timeout.flush(10000);
          test.$rootScope.$digest();
        });

        it('should return no result when too specific', () => {
          test.controller.setCurrentSearch('abcdefg').then(res => {
            expect(res.length).toBe(0);
          });

          test.$timeout.flush(10000);
          test.$rootScope.$digest();
        });
      });
    });
  });
});
