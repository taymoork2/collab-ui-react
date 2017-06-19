import { RetentionSettingController } from './retentionSetting.controller';
import testModule from './index';

describe('Controller: RetentionSettingController', () => {

  let controller: RetentionSettingController;
  let $scope, $controller, $q;
  let RetentionService, Authinfo, ITProPackService;
  let secondRetentionOption: string;

  beforeEach(angular.mock.module(testModule));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$q_, _RetentionService_, _ITProPackService_, _Authinfo_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    RetentionService = _RetentionService_;
    Authinfo = _Authinfo_;
    ITProPackService = _ITProPackService_;
  }

  function initSpies() {
    spyOn(RetentionService, 'getRetention').and.returnValue($q.resolve({
      sparkDataRetentionDays: secondRetentionOption,
    }));
    spyOn(RetentionService, 'setRetention').and.returnValue($q.resolve());
    spyOn(ITProPackService, 'hasITProPackPurchasedOrNotEnabled').and.returnValue($q.resolve(false));
  }

  function initController() {
    controller = $controller(RetentionSettingController, {
      $scope: $scope,
    });
    $scope.$apply();
    secondRetentionOption = controller.retentionOptions[0].value; // We just pick one of them
  }

  describe('contructor()', () => {

    describe('when getRetention is not provided with parameters', () => {
      beforeEach(initFailureSpy);
      beforeEach(initController);

      it('should set dataloaded and no value for selected retention policy', () => {
        expect(controller.dataLoaded).toBeTruthy();
        expect(controller.initialRetention).toBe('');
      });

      function initFailureSpy() {
        RetentionService.getRetention.and.returnValue($q.reject(''));
      }
    });

    describe('when getRetention returns a value from the pre-defined options', () => {
      beforeEach(initSpyWithRetention);
      beforeEach(initController);

      it('should set data loaded and retention policy to that option', () => {
        expect(controller.dataLoaded).toBeTruthy();
        expect(controller.initialRetention).toBe(secondRetentionOption);
        expect(controller.selectedRetentionDefault.value).toBe(secondRetentionOption);
        expect(controller.selectedRetentionMonths).toBe(undefined);
        expect(controller.selectedRetentionType).toBe(controller.RETENTION_TYPES.DEFAULT);
      });

      function initSpyWithRetention() {
        RetentionService.getRetention.and.returnValue($q.resolve({
          sparkDataRetentionDays: secondRetentionOption,
        }));
      }
    });

    describe('when getRetention returns a value outside the pre-defined options', () => {
      beforeEach(initSpyWithRetention);
      beforeEach(initController);

      it('should set data loaded but should round renetion policy to months', () => {
        expect(controller.dataLoaded).toBeTruthy();
        expect(controller.initialRetention).toBe('45444');
        expect(controller.selectedRetentionMonths).toBe(1514);
        expect(controller.selectedRetentionDefault).toEqual({ value: '', label: '' });
        expect(controller.selectedRetentionType).toBe(controller.RETENTION_TYPES.CUSTOM_MONTH);
      });

      function initSpyWithRetention() {
        RetentionService.getRetention.and.returnValue($q.resolve({
          sparkDataRetentionDays: '45444',
        }));
      }
    });

    describe('when getRetention returns a value \'indefnite\'', () => {
      beforeEach(initSpyWithRetention);
      beforeEach(initController);

      it('should set data loaded with retentionType == indefinite and blank values selectionRetenitonMonths and ...Default', () => {
        expect(controller.dataLoaded).toBeTruthy();
        expect(controller.initialRetention).toBe('-1');
        expect(controller.selectedRetentionMonths).toBe(undefined);
        expect(controller.selectedRetentionDefault).toEqual({ value: '', label: '' });
        expect(controller.selectedRetentionType).toBe(controller.RETENTION_TYPES.INDEFINITE);
      });

      function initSpyWithRetention() {
        RetentionService.getRetention.and.returnValue($q.resolve({
          sparkDataRetentionDays: '-1',
        }));
      }
    });

    describe('when getRetention returns insufficient data', () => {
      beforeEach(initSpyInsufficientResponse);
      beforeEach(initController);

      //algendel: I don't think it's a right behavior. This way incorrect value will not get updated.
      it('should set data loaded and default value for the retention policy', () => {
        expect(controller.selectedRetentionDefault).toEqual({ value: '', label: '' });
        expect(controller.selectedRetentionMonths).toEqual(undefined);
        expect(controller.initialRetention).toBe(controller.RETENTION_DEFAULT);
        expect(controller.selectedRetentionType).toBe(controller.RETENTION_TYPES.INDEFINITE);
      });

      function initSpyInsufficientResponse() {
        RetentionService.getRetention.and.returnValue($q.resolve({}));
      }
    });

    describe('updateRetention', () => {
      beforeEach(initSpyIncompleteResponse);
      beforeEach(initController);

      it('should call RetentionService to save the value', () => {
        controller.initialRetention = controller.retentionOptions[1].value;
        controller.selectedRetentionDefault = controller.retentionOptions[1];
        controller.selectedRetentionType = controller.RETENTION_TYPES.DEFAULT;
        controller.updateRetention();

        expect(RetentionService.setRetention)
          .toHaveBeenCalledWith(Authinfo.getOrgId(), '180');
        expect(true).toBe(true);
      });

      function initSpyIncompleteResponse() {
        RetentionService.getRetention.and.returnValue($q.resolve({}));
        RetentionService.setRetention.and.returnValue($q.resolve({}));
      }
    });
  });
});
