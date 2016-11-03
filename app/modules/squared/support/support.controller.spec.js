'use strict';

describe('Controller: SupportCtrl', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('Squared'));

  var controller, Authinfo, Userservice, currentUser, Config,
    $scope, $httpBackend, WindowLocation, UrlConfig, Notification;
  var roles = ["ciscouc.devsupport", "atlas-portal.support"];

  beforeEach(inject(function ($rootScope, $controller, _Userservice_, _Authinfo_, _Config_, _WindowLocation_, _UrlConfig_, _$httpBackend_, _Notification_) {
    Userservice = _Userservice_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    WindowLocation = _WindowLocation_;
    UrlConfig = _UrlConfig_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;

    currentUser = {
      success: true,
      roles: ['ciscouc.devops', 'ciscouc.devsupport']
    };

    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(currentUser, 200);
    });
    spyOn(Authinfo, 'isCiscoMock').and.returnValue(true);
    spyOn(Config, 'isProd').and.returnValue(false);
    $scope = $rootScope.$new();
    controller = $controller('SupportCtrl', {
      $scope: $scope,
      Authinfo: Authinfo,
      Userservice: Userservice,
      Config: Config
    });
  }));

  it('should be defined', function () {
    expect(controller).toBeDefined();
  });

  it('should show CdrCallFlowLink for user has devsupport or devops role', function () {
    $scope.initializeShowCdrCallFlowLink();
    expect($scope.showCdrCallFlowLink).toEqual(true);
  });

  it('should return cisdoDevRole true for user that has devsupport or devops role', function () {
    var isSupportRole = $scope.isCiscoDevRole(roles);
    expect(isSupportRole).toBe(true);
  });

  describe('getCallflowCharts', function () {

    var windowUrl, expectedUrl;

    beforeEach(function () {
      windowUrl = null;
      spyOn(WindowLocation, 'set').and.callFake(function (url) {
        windowUrl = url;
      });
      spyOn(Notification, 'notify');

      // something is requiring these urls to succeed
      $httpBackend.whenGET('https://ciscospark.statuspage.io/index.json').respond(200, {});
      $httpBackend.whenGET('https://identity.webex.com/organization/scim/v1/Orgs/null').respond(200, {});

      expectedUrl = UrlConfig.getCallflowServiceUrl() +
        'callflow/logs' +
        '?orgId=aa&userId=bb' +
        '&logfileFullName=logfilename';
    });

    it('should change WindowLocation on success', function () {

      var result = {
        resultsUrl: 'http://sample.org'
      };

      $httpBackend.expectGET(expectedUrl).respond(200, result);

      $scope.getCallflowCharts('aa', 'bb', '-NA-', '-NA-', 'logfilename', true);

      $httpBackend.flush();

      expect(WindowLocation.set).toHaveBeenCalled();
      expect(windowUrl).toEqual(result.resultsUrl);
      expect(Notification.notify).not.toHaveBeenCalled();

      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

    });

    it('should notify on error', function () {

      $httpBackend.expectGET(expectedUrl).respond(503, 'error');

      $scope.getCallflowCharts('aa', 'bb', '-NA-', '-NA-', 'logfilename', true);

      $httpBackend.flush();

      expect(WindowLocation.set).not.toHaveBeenCalled();
      expect(Notification.notify).toHaveBeenCalled();

      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();

    });

  });

});
