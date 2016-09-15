namespace globalsettings {

  describe('Controller: AuthenticationSettingController', ()=> {

    let $scope, $controller, controller, $q;
    let Orgservice;

    beforeEach(angular.mock.module('Core'));
    beforeEach(angular.mock.module('Huron'));

    beforeEach(inject(dependencies));
    beforeEach(initSpies);


    function dependencies($rootScope, _$controller_, _$q_, _Orgservice_) {
      $scope = $rootScope.$new();
      $controller = _$controller_;
      $q = _$q_;
      Orgservice = _Orgservice_;
    }

    function initSpies() {
      spyOn(Orgservice, 'getAdminOrg').and.callFake(function (callback) {
        callback({ success:true, ssoEnabled:false});
      });
    }

    function initController() {
      controller = $controller('AuthenticationSettingController', {
        $scope: $scope
      });
      $scope.$apply();
    }

    describe('contructor()', ()=> {

      describe('when getOrgSettings return failure', ()=> {
        beforeEach(inject(dependencies));
        beforeEach(initSpyFailure);
        beforeEach(initController);

        it('should not set sso status', () => {
          expect(controller.ssoStatusLoaded).toBeFalsy();
          expect(controller.ssoStatusText).toBeFalsy();
        });

        function initSpyFailure() {
          Orgservice.getAdminOrg.and.returnValue($q.reject({}));
        }
      });

      describe('when getOrgSettings sso status true', ()=> {
        beforeEach(inject(dependencies));
        beforeEach(initSpySSOEnabled);
        beforeEach(initController);

        it('should set sso status and sso loaded', () => {
          expect(controller.ssoStatusLoaded).toBeTruthy();
          expect(controller.ssoEnabled).toBeTruthy();
          expect(controller.ssoStatusText).toBeTruthy();
        });

        function initSpySSOEnabled() {
          Orgservice.getAdminOrg.and.callFake(function (callback) {
            callback({ success:true, ssoEnabled:true});
          });
        }
      });

      describe('when getOrgSettings sso status false', ()=> {
        beforeEach(inject(dependencies));
        beforeEach(initSpySSODisabled);
        beforeEach(initController);

        it('should set sso status and sso loaded', () => {
          expect(controller.ssoStatusLoaded).toBeTruthy();
          expect(controller.ssoEnabled).toBeFalsy();
          expect(controller.ssoStatusText).toBeTruthy();
        });

        function initSpySSODisabled() {
          Orgservice.getAdminOrg.and.callFake(function (callback) {
            callback({ success:true, ssoEnabled:false});
          });
        }
      });
    });
  });
}
