import { DeviceMatcher } from 'modules/squared/devices/device-matcher';
import { FilteredView } from 'modules/squared/common/filtered-view/filtered-view';
import { FilteredDeviceViewDataSource } from './filtered-deviceview-datasource';

describe('Class: DevicesController', () => {

  let test: {
    controller?: FilteredView<csdm.IDevice> | null,
    $rootScope?: ng.IScope,
  } | any = {};

  let serverSideSearchRes = {
    'url1': { displayName: 'abc', isOnline: true },
    'url2': { displayName: 'abcd' },
    'url3': { displayName: 'abcde', isOnline: true },
    'url4': { displayName: 'abcdef' },
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

    test.controller = new FilteredView<csdm.IDevice>(new FilteredDeviceViewDataSource(test.CsdmDataModelService, test.$q),
      new DeviceMatcher(),
      test.$timeout,
      test.$q);
  };

  describe('big org', () => {
    beforeEach(() => {
      initController(true);
    });

    describe('with no server side result', () => {
      beforeEach(() => {
        spyOn(test.CsdmDataModelService, 'getDevicesMap').and.returnValue(test.$q.resolve({}));
      });

      it('should be in initializing state and then in emptyresult', () => {
        expect(test.controller.isInState(test.controller.initializing));

        test.$timeout.flush(10000);
        test.$rootScope.$digest();

        expect(test.controller.isInState(test.controller.emptyresult));
      });
    });

    describe('with server side result', () => {
      beforeEach(() => {
        spyOn(test.CsdmDataModelService, 'getDevicesMap').and.returnValue(test.$q.resolve(serverSideSearchRes));
      });

      it('should be in initializing state and then in showresult', () => {
        expect(test.controller.isInState(test.controller.searching));

        test.$timeout.flush(10000);
        test.$rootScope.$digest();

        expect(test.controller.isInState(test.controller.showresult));
      });
    });
  });

  describe('not bigOrg', () => {

    beforeEach(() => {
      initController(false);
    });

    describe('with no server side result', () => {
      beforeEach(() => {
        spyOn(test.CsdmDataModelService, 'getDevicesMap').and.returnValue(test.$q.resolve({}));
      });

      it('should be in emptyresult state', () => {
        test.$timeout.flush(10000);
        test.$rootScope.$digest();
        expect(test.controller.isInState(test.controller.emptyresult));
      });
    });

    describe('with server side result', () => {
      beforeEach(() => {
        spyOn(test.CsdmDataModelService, 'getDevicesMap').and.returnValue(test.$q.resolve(serverSideSearchRes));
      });

      describe('before web request has returned', () => {
        it('should be in searching state and then in showresult', () => {
          expect(test.controller.isInState(test.controller.searching));

          test.$timeout.flush(10000);
          test.$rootScope.$digest();

          expect(test.controller.isInState(test.controller.showresult));
        });
      });

      describe('without filter', () => {
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

      describe('with online device filter', () => {

        beforeEach(() => {
          test.controller.setFilters([{
            count: 0,
            filterValue: 'online',
            passes: function (item: csdm.IDevice) {
              return item.isOnline;
            },
          }]);
          test.controller.setCurrentFilterValue('online');
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
