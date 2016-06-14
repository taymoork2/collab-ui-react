/// <reference path="privacySettings.component.ts"/>
namespace globalsettings {

  fdescribe('Controller: PrivacySettingController', ()=> {
    let Authinfo, $controller, controller:PrivacySettingController, $q, $scope;
    let Notification, Orgservice;
    let orgId = 'superOrg';
    beforeEach(angular.mock.module('Core'));
    // beforeEach(angular.mock.module('Huron'));
    // beforeEach(angular.mock.module('WebExApp'));
    beforeEach(inject(dependencies));
    beforeEach(initSpies);
    // beforeEach(initController);

    function dependencies($rootScope,
                          _Authinfo_,
                          _$controller_,
                          _$q_,
                          _Notification_,
                          _Orgservice_
                          // _UserListService_, _BrandService_, _FeatureToggleService_, _WebexClientVersion_
    ) {
      $scope = $rootScope.$new();
      Authinfo = _Authinfo_;
      $controller = _$controller_;
      $q = _$q_;
      Notification = _Notification_;
      Orgservice = _Orgservice_;
      // UserListService = _UserListService_;
      // BrandService = _BrandService_;
      // FeatureToggleService = _FeatureToggleService_;
      // WebexClientVersion = _WebexClientVersion_;
    }

    function initSpies() {
      spyOn(Authinfo, 'getOrgId').and.returnValue(orgId);
      spyOn(Notification, 'success');
      spyOn(Notification, 'error');
      spyOn(Notification, 'errorResponse');
      // spyOn(Orgservice, 'setOrgSettings').and.returnValue($q.when());
      spyOn(Orgservice, 'setOrgSettings').and.returnValue($q.when());
    }

    function initController(orgData) {
      spyOn(Orgservice, 'getOrg').and.callFake((callback, orgid, cache)=> {
        callback(orgData, 200);
      });

      controller = $controller('PrivacySettingController'
        , {
          $scope: $scope
        });
      $scope.$apply();
    }


    describe('init', ()=> {

      it('should query org service and set allowReadOnlyAccess to true from orgData', ()=> {
        initController({success: true, orgSettings: {allowReadOnlyAccess: true}});

        expect(Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), orgId, jasmine.any(Boolean));
        // expect(Orgservice.getOrg).toHaveBeenCalledWith('partnerProfile.orgSettingsError');
        expect(controller.allowReadOnlyAccess).toBeTruthy();
      });

      it('should query org service and set allowReadOnlyAccess to false from orgData', ()=> {
        initController({success: true, orgSettings: {allowReadOnlyAccess: false}});

        expect(Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), orgId, jasmine.any(Boolean));
        // expect(Orgservice.getOrg).toHaveBeenCalledWith('partnerProfile.orgSettingsError');
        expect(controller.allowReadOnlyAccess).toBeFalsy();
        expect(controller.allowReadOnlyAccess).toBeDefined();
      });

      it('should query org service and keep allowReadOnlyAccess undefined if not set in orgData', ()=> {
        initController({success: true, orgSettings: {}});

        expect(Orgservice.getOrg).toHaveBeenCalledWith(jasmine.any(Function), orgId, jasmine.any(Boolean));
        expect(controller.allowReadOnlyAccess).toBeUndefined()
      });
    });

    describe('saving allowReadOnlyAccess', ()=> {
      beforeEach(()=>initController({}));

      it('should call setOrgSetting on orgService with only one setting specified', ()=> {
        controller.allowReadOnlyAccess = true;
        $scope.$digest();
        expect(Orgservice.setOrgSettings).toHaveBeenCalledWith(orgId,{allowReadOnlyAccess: true});
      });
    });
  });
}
