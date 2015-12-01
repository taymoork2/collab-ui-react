'use strict';

// TODO : These test cases are not complete... 

//Below is the Test Suit written for mediafusionConnectorCtrl.
describe('Controller: MediaServiceController', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));
  //Initialize variables
  var Authinfo, controller, $scope, $state, MediaServiceActivation, $httpBackend, authinfo, $q, Notification, XhrNotificationService;
  var mediaAgentOrgIds = ['squared'];
  var serviceId = "squared-fusion-media";

  beforeEach(function () {
    module(function ($provide) {
      Authinfo = {
        getOrgId: sinon.stub()
      };
      Authinfo.getOrgId.returns("12345");
      $provide.value('Authinfo', Authinfo);
    });
  });

  beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _MediaServiceActivation_, _$q_, _Notification_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    MediaServiceActivation = _MediaServiceActivation_;
    Notification = _Notification_;
    //XhrNotificationService = _XhrNotificationService_;
    controller = $controller('MediaServiceController', {
      //Authinfo: Authinfo,
      $scope: $scope,
      $state: $state,
      MediaServiceActivation: MediaServiceActivation
    });
    $httpBackend.when('GET', 'l10n/en_US.json').respond({});
    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');
    //$scope.$apply();
  }));

  /*
    afterEach(function () {
      $httpBackend.verifyNoOutstandingRequest();
    });*/

  it('controller should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('scope should not be null', function () {
    expect($scope).not.toBeNull();
  });

  it('scope should be defined', function () {
    expect($scope).toBeDefined();
  });

  it('should enable media service', function () {
    spyOn(MediaServiceActivation, 'setServiceEnabled').and.returnValue($q.when());
    spyOn(MediaServiceActivation, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when(
      [{
        statusCode: 0,
        identityOrgId: "1eb65fdf-9643-417f-9974-ad72cae0eaaa",
        mediaAgentOrgIds: ["mediafusion"]
      }]
    ));
    spyOn(MediaServiceActivation, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());

    //$scope.enableMediaService(serviceId);
    //$scope.$apply();
    //expect(MediaServiceActivation.setServiceEnabled).toHaveBeenCalled();
    //expect(Service.getUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Service.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });

  it('should check if orpheus for mediafusion org is enabled', function () {
    spyOn(MediaServiceActivation, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when(
      [{
        statusCode: 0,
        identityOrgId: "1eb65fdf-9643-417f-9974-ad72cae0eaaa",
        mediaAgentOrgIds: ["mediafusion"]
      }]
    ));
    spyOn(MediaServiceActivation, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());
    //$scope.enableOrpheusForMediaFusion();
    //$scope.$apply();
    //expect(MediaServiceActivation.getUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Service.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });

  it('should enable orpheus for mediafusion org', function () {
    spyOn(MediaServiceActivation, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());
    //$scope.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIds);
    //$scope.$apply();
    //expect(MediaServiceActivation.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });

  it('should notify error while enabling orpheus for mediafusion', function () {
    spyOn(MediaServiceActivation, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.reject());
    //$scope.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIds);
    //$scope.$apply();

    //expect(MediaServiceActivation.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
  });

});
