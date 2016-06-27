/// <reference path="retentionSetting.controller.ts"/>
namespace globalsettings {

  describe('Controller: RetentionSettingController', ()=> {

    let controller:RetentionSettingController;
    let $scope, $controller, $q;
    let RetentionService, Authinfo;
    let secondRetentionOption:string;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));

    beforeEach(inject(dependencies));
    beforeEach(initSpies);


    function dependencies($rootScope, _$controller_, _$q_, _RetentionService_, _Authinfo_) {
      $scope = $rootScope.$new();
      $controller = _$controller_;
      $q = _$q_;
      RetentionService = _RetentionService_;
      Authinfo = _Authinfo_;
    }

    function initSpies() {
      spyOn(RetentionService, 'getRetention');
      spyOn(RetentionService, 'setRetention');
    }

    function initController() {
      controller = $controller('RetentionSettingController', {
        $scope: $scope
      });
      $scope.$apply();

      secondRetentionOption = controller.retentionOptions[0].value; // We just pick one of them
    }

    describe('contructor()', ()=> {

      describe('when getRetention is not provided with parameters', ()=> {
        beforeEach(initFailureSpy);
        beforeEach(initController);

        it('should set dataloaded and no value for selected retention policy', () => {
          expect(controller.dataLoaded).toBeTruthy();
          expect(controller.selectedRetention).toBeFalsy();
        });

        function initFailureSpy() {
          RetentionService.getRetention.and.returnValue($q.reject(""));
        }
      });

      describe('when getRetention returns a value from the pre-defined options', ()=> {
        beforeEach(initSpyWithRetention);
        beforeEach(initController);

        it('should set data loaded and retention policy to that option', () => {
          expect(controller.dataLoaded).toBeTruthy();
          expect(controller.selectedRetention).toBeTruthy();
          expect(controller.selectedRetention.value).toBe(secondRetentionOption);
        });

        function initSpyWithRetention() {
          RetentionService.getRetention.and.returnValue($q.when({
            msgDataRetention:secondRetentionOption
          }));
        }
      });

      describe('when getRetention returns a value outside the pre-defined options', ()=> {
        beforeEach(initSpyWithRetention);
        beforeEach(initController);

        it('should set data loaded but should not set the retention policy', () => {
          expect(controller.dataLoaded).toBeTruthy();
          expect(controller.selectedRetention).toBeFalsy();
        });

        function initSpyWithRetention() {
          RetentionService.getRetention.and.returnValue($q.when({
            msgDataRetention:45444
          }));
        }
      });

      describe('when getRetention returns insufficient data', ()=> {
        beforeEach(initSpyInsufficientResponse);
        beforeEach(initController);

        it('should set data loaded but no value for the retention policy', () => {
          expect(controller.dataLoaded).toBeTruthy();
          expect(controller.selectedRetention).toBeFalsy();
        });

        function initSpyInsufficientResponse() {
          RetentionService.getRetention.and.returnValue($q.when({}));
        }
      });
    });

    describe('updateRetention', ()=> {
      beforeEach(initSpyIncompleteResponse);
      beforeEach(initController);

      it('should call RetentionService to save the value', () => {
        controller.initialRetention = controller.retentionOptions[1];
        controller.initialRetention.value = '180';
        controller.selectedRetention = controller.retentionOptions[1];
        controller.selectedRetention.value = '180';

        controller.updateRetention();

        expect(RetentionService.setRetention)
          .toHaveBeenCalledWith(Authinfo.getOrgId(), '180');
      });

      function initSpyIncompleteResponse() {
        RetentionService.getRetention.and.returnValue($q.when({}));
        RetentionService.setRetention.and.returnValue($q.when({}));
      }
    });
  });
}
