import moduleName from './index';

describe('CallServiceConnectPrerequisitesComponentController', () => {

  let controller, $componentController, $q, $scope, HybridServicesFlagService, ServiceDescriptorService;
  const flagPrefix = 'atlas.hybrid.setup.call.connect.';

  beforeEach(angular.mock.module(moduleName));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  afterEach(cleanup);

  function dependencies(_$rootScope_, _$componentController_, _$q_, _HybridServicesFlagService_, _ServiceDescriptorService_) {
    $scope = _$rootScope_.$new();
    $componentController = _$componentController_;
    $q = _$q_;
    HybridServicesFlagService = _HybridServicesFlagService_;
    ServiceDescriptorService = _ServiceDescriptorService_;
  }

  function initSpies() {
    spyOn(HybridServicesFlagService, 'raiseFlag');
    spyOn(HybridServicesFlagService, 'lowerFlag');
  }

  function cleanup() {
    controller = $componentController = $q = $scope = undefined;
  }

  function initController(callback = Function()) {
    controller = $componentController('callServiceConnectPrerequisites', {}, {
      onChange: callback,
    });
    controller.$onInit();
  }

  describe ('loading data from the server', () => {

    it('should consider all checkboxes as unchecked if the server fails to respond', () => {
      spyOn(HybridServicesFlagService, 'readFlags').and.returnValue($q.reject({}));
      initController();
      $scope.$apply();
      _.forEach(controller.checkboxes, (checkbox) => {
        expect(checkbox).toBeFalsy();
      });
    });

    it('should check a box if the server says it has been checked previously', () => {
      const raisedCheckboxName = 'welcomeToTheJungle';
      const loweredCheckboxName = 'ItsSoEasy';
      spyOn(HybridServicesFlagService, 'readFlags').and.returnValue($q.resolve([{
        name: `${flagPrefix}${raisedCheckboxName}`,
        raised: true,
      }, {
        name: `${flagPrefix}${loweredCheckboxName}`,
        raised: false,
      }]));
      initController();
      $scope.$apply();
      expect(controller.checkboxes[raisedCheckboxName]).toBeTruthy();
      expect(controller.checkboxes[loweredCheckboxName]).toBeFalsy();
    });

    it('should check with FMS if Call Service Aware has been setup', () => {
      spyOn(ServiceDescriptorService, 'isServiceEnabled').and.returnValue($q.resolve(true));
      initController();
      $scope.$apply();
      expect(controller.checkboxes['isAwareSetup']).toBeTruthy();
    });

    it('should assume that Call Service Aware has not been setup if FMS cannot be reached', () => {
      spyOn(ServiceDescriptorService, 'isServiceEnabled').and.returnValue($q.reject({}));
      initController();
      $scope.$apply();
      expect(controller.checkboxes['isAwareSetup']).toBeFalsy();
    });

  });

  describe('responding to checkbox changes', () => {

    beforeEach(function() {
      spyOn(HybridServicesFlagService, 'readFlags').and.returnValue($q.resolve({}));
    });

    it('should raise a flag when a box is checked', () => {
      const checkboxName = 'nightrain';
      initController();
      $scope.$apply();
      controller.processChange(checkboxName, true);
      expect(HybridServicesFlagService.raiseFlag).toHaveBeenCalledWith(`${flagPrefix}${checkboxName}`);
    });

    it('should lower a flag when a box is unchecked', () => {
      const checkboxName = 'outTaGetMe';
      initController();
      $scope.$apply();
      controller.processChange(checkboxName, false);
      expect(HybridServicesFlagService.lowerFlag).toHaveBeenCalledWith(`${flagPrefix}${checkboxName}`);
    });

    it('should call the provided callback function once on init, and again when one checkbox has changed', () => {
      const checkboxName = 'mrBrownstone';
      const callback = jasmine.createSpy('callback');
      initController(callback);
      $scope.$apply();
      expect(callback.calls.count()).toBe(1);

      controller.checkboxes[checkboxName] = true;
      controller.processChange(checkboxName, true);
      expect(callback.calls.count()).toBe(2);
      expect(callback.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
        options: {
          numberChecked: 1,
          totalNumber: 10,
        },
      }));
    });

    it('should call the provided callback function once on init, and with the correct arguments when two checkboxes have changed', () => {
      const checkboxName1 = 'paradiseCity';
      const checkboxName2 = 'myMichelle';
      const callback = jasmine.createSpy('callback');
      initController(callback);
      $scope.$apply();
      expect(callback.calls.count()).toBe(1);

      controller.checkboxes[checkboxName1] = true;
      controller.processChange(checkboxName1, true);
      controller.checkboxes[checkboxName2] = true;
      controller.processChange(checkboxName2, true);
      expect(callback.calls.count()).toBe(3);
      expect(callback.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({
        options: {
          numberChecked: 2,
          totalNumber: 11,
        },
      }));
    });
  });

});
