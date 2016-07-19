(function () {
  'use strict';
  var $q, $controller, Notification, CiService, SyncService;
  var $scope;
  var Authinfo = {};
  var ctrl;

  fdescribe('Controller: CiSyncCtrl', function () {
    beforeEach(module('Core'));
    beforeEach(module('Huron'));
    beforeEach(module('Sunlight'));
    beforeEach(module('Messenger'));

<<<<<<< HEAD
    beforeEach(function () {
      module('Huron');
      module('Sunlight');
      module('Messenger');
=======
    beforeEach(inject(function (_$controller_, _$q_, _Notification_, _CiService_, _SyncService_,_$rootScope_) {
      $scope = _$rootScope_.$new();
      $q = _$q_;
      Notification = _Notification_;
      CiService = _CiService_;
      SyncService = _SyncService_;
      $controller = _$controller_;
    }));
>>>>>>> 4b2e150... ci.sync refactori

    function initController(){
      ctrl = $controller('CiSyncCtrl', {Authinfo : Authinfo});
      $scope.$apply();
    }

    describe('Initialization Tests',function(){

      beforeEach(function () {
        Authinfo.isReadOnlyAdmin = function(){
          return true;
        }
        initController();
      });

      it('should initialize as viewed from an unknown user role', function () {
        expect(ctrl.adminType).toBe(ctrl.adminTypes.read);
      });
    });
  });
})();
