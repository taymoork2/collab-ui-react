'use strict';

//Below is the Test Suit written for mediafusionConnectorCtrl.
describe('Controller: mediafusionConnectorCtrl', function () {

  // load the controller's module
  beforeEach(module('wx2AdminWebClientApp'));
  //Initialize variables
  var Authinfo, controller, $scope, $state, MediaServiceDescriptor, $httpBackend, authinfo, $q, Notification, XhrNotificationService;
  var mediaAgentOrgIds = ['mediafusion'];
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

  beforeEach(inject(function ($controller, $rootScope, _$state_, _$httpBackend_, _MediaServiceDescriptor_, _$q_, _Notification_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    MediaServiceDescriptor = _MediaServiceDescriptor_;
    Notification = _Notification_;
    //XhrNotificationService = _XhrNotificationService_;
    controller = $controller('mediafusionConnectorCtrl', {
      //Authinfo: Authinfo,
      $scope: $scope,
      $state: $state,
      MediaServiceDescriptor: MediaServiceDescriptor
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

  it('grid oprions should be defined', function () {
    //expect(scope.gridOptions).toBeDefined();
  });

  it('should enable media service', function () {
    spyOn(MediaServiceDescriptor, 'setServiceEnabled').and.returnValue($q.when());
    spyOn(MediaServiceDescriptor, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when(
      [{
        statusCode: 0,
        identityOrgId: "1eb65fdf-9643-417f-9974-ad72cae0eaaa",
        mediaAgentOrgIds: ["mediafusion"]
      }]
    ));
    spyOn(MediaServiceDescriptor, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());

    $scope.enableMediaService(serviceId);
    //$scope.$apply();
    expect(MediaServiceDescriptor.setServiceEnabled).toHaveBeenCalled();
    //expect(Service.getUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Service.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });

  it('should check if orpheus for mediafusion org is enabled', function () {
    spyOn(MediaServiceDescriptor, 'getUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when(
      [{
        statusCode: 0,
        identityOrgId: "1eb65fdf-9643-417f-9974-ad72cae0eaaa",
        mediaAgentOrgIds: ["mediafusion"]
      }]
    ));
    spyOn(MediaServiceDescriptor, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());
    $scope.enableOrpheusForMediaFusion();
    //$scope.$apply();
    expect(MediaServiceDescriptor.getUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Service.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });

  it('should enable orpheus for mediafusion org', function () {
    spyOn(MediaServiceDescriptor, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.when());
    $scope.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIds);
    //$scope.$apply();
    expect(MediaServiceDescriptor.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
  });

  it('should notify error while enabling orpheus for mediafusion', function () {
    spyOn(MediaServiceDescriptor, 'setUserIdentityOrgToMediaAgentOrgMapping').and.returnValue($q.reject());
    $scope.addUserIdentityToMediaAgentOrgMapping(mediaAgentOrgIds);
    //$scope.$apply();

    expect(MediaServiceDescriptor.setUserIdentityOrgToMediaAgentOrgMapping).toHaveBeenCalled();
    //expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
  });

});
