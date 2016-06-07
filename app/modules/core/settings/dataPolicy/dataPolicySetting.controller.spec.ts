/// <reference path="dataPolicySetting.controller.ts"/>
namespace globalsettings {

  describe('Controller: DataPolicySettingController', ()=> {

    let controller:DataPolicySettingController;
    let $scope, $controller, $q;
    let AccountOrgService, Authinfo;
    let secondRetentionTimeOption:string;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));

    beforeEach(inject(dependencies));
    beforeEach(initSpies);


    function dependencies($rootScope, _$controller_, _$q_, _AccountOrgService_, _Authinfo_) {
      $scope = $rootScope.$new();
      $controller = _$controller_;
      $q = _$q_;
      AccountOrgService = _AccountOrgService_;
      Authinfo = _Authinfo_;
    }

    function initSpies() {
      spyOn(AccountOrgService, 'getOrgSettings');
      spyOn(AccountOrgService, 'modifyOrgDataRetentionPeriodDays');
    }

    function initController() {
      controller = $controller('DataPolicySettingController', {
        $scope: $scope
      });
      $scope.$apply();

      secondRetentionTimeOption = controller.retentionTimeOptions[2].value;
    }

    describe('contructor()', ()=> {

      describe('when getOrgSettings return empty', ()=> {
        beforeEach(initSpyFailure);
        beforeEach(initController);

        it('should set dataloaded but no value for retentiontime', () => {
          expect(controller.dataLoaded).toBeFalsy();
          expect(controller.retentionTimeSelected).toBeFalsy();
        });

        function initSpyFailure() {
          AccountOrgService.getOrgSettings.and.returnValue($q.reject({}));
        }
      });

      describe('when getOrgSettings return a value from the predefined options', ()=> {
        beforeEach(initSpyWithRetentionTime);
        beforeEach(initController);

        it('should set data loaded and retention time', () => {
          expect(controller.dataLoaded).toBeTruthy();
          expect(controller.retentionTimeSelected).toBeTruthy();
          expect(controller.retentionTimeSelected.value).toBe(secondRetentionTimeOption);
        });

        function initSpyWithRetentionTime() {
          AccountOrgService.getOrgSettings.and.returnValue($q.when({
            data:{
              settings:[{ key: 'dataRetentionPeriodDays', value:secondRetentionTimeOption, label:"yag"}]
            }
          }));
        }
      });

      describe('when getOrgSettings return a value outside the predefined options', ()=> {
        beforeEach(initSpyWithRetentionTime);
        beforeEach(initController);

        it('should set data loaded but not retention time', () => {
          expect(controller.dataLoaded).toBeTruthy();
          expect(controller.retentionTimeSelected).toBeFalsy();
        });

        function initSpyWithRetentionTime() {
          AccountOrgService.getOrgSettings.and.returnValue($q.when({
            data:{
              settings:[{ key: 'dataRetentionPeriodDays', value:45444, label:"yag"}]
            }
          }));
        }
      });

      describe('when getOrgSettings return incomplete data', ()=> {
        beforeEach(initSpyIncompleteResponse);
        beforeEach(initController);

        it('should set data loaded but no value for retentiontime', () => {
          expect(controller.dataLoaded).toBeTruthy();
          expect(controller.retentionTimeSelected).toBeFalsy();
        });

        function initSpyIncompleteResponse() {
          AccountOrgService.getOrgSettings.and.returnValue($q.when({}));
        }
      });
    });

    describe('retentionTimeUpdate', ()=> {
      beforeEach(initSpyIncompleteResponse);
      beforeEach(initController);

      it('should call AccountOrgService to save the value', () => {
        controller.retentionTimeSelected = controller.retentionTimeOptions[0];
        controller.retentionTimeSelected.value = '455';

        controller.retentionTimeUpdate();

        expect(AccountOrgService.modifyOrgDataRetentionPeriodDays)
          .toHaveBeenCalledWith(Authinfo.getOrgId(), '455');
      });

      function initSpyIncompleteResponse() {
        AccountOrgService.getOrgSettings.and.returnValue($q.when({}));
        AccountOrgService.modifyOrgDataRetentionPeriodDays.and.returnValue($q.when({}));
      }
    });
  });
}
