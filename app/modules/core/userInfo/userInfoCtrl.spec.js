'use strict';

describe('UserInfoController', function () {
  beforeEach(angular.mock.module('Core'));

  var $window, $scope, FeedbackService, Userservice, Utils, deferred, $rootScope;

  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function (_$rootScope_, $controller, $q) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    Userservice = {
      getUser: sinon.stub()
    };
    deferred = $q.defer();
    FeedbackService = {
      getFeedbackUrl: sinon.stub().returns(deferred.promise)
    };
    Utils = {
      getUUID: sinon.stub().returns('awesome uuid')
    };
    $window = {
      open: sinon.stub(),
      navigator: {
        userAgent: 'some useragent'
      }
    };

    $controller('UserInfoController', {
      Utils: Utils,
      $scope: $scope,
      $window: $window,
      Userservice: Userservice,
      FeedbackService: FeedbackService
    });
  }));

  it('fetches url and opens new window', function () {
    $scope.sendFeedback();

    expect(FeedbackService.getFeedbackUrl.callCount).toBe(1);
    expect(FeedbackService.getFeedbackUrl.args[0][0]).toBe('Atlas_some useragent');
    expect(FeedbackService.getFeedbackUrl.args[0][1]).toBe('awesome uuid');

    deferred.resolve({
      data: {
        url: 'some url'
      }
    });

    $rootScope.$apply();
    $rootScope.$apply();

    expect($window.open.callCount).toBe(1);
    expect($window.open.args[0][0]).toBe('some url');
    expect($window.open.args[0][1]).toBe('_blank');
  });

});

describe('UserInfoController WebEx logout', function () {
  var Auth, deferredLogout, WebExUtilsFact, $timeout;
  var $scope, $rootScope;

  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function (_$rootScope_, $controller, $q, _Auth_, _WebExUtilsFact_, _$timeout_) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();
    Auth = _Auth_;
    WebExUtilsFact = _WebExUtilsFact_;
    $timeout = _$timeout_;

    var Userservice = {
      getUser: sinon.stub()
    };

    deferredLogout = $q.defer();
    spyOn(WebExUtilsFact, "logoutSite").and.returnValue(deferredLogout.promise);
    spyOn(Auth, "logout");

    $controller('UserInfoController', {
      $scope: $scope,
      Userservice: Userservice,
      Auth: Auth,
      WebExUtilsFact: WebExUtilsFact
    });

  }));

  it("should continue logout if WebEx logout does not resolve", function () {
    $scope.logout();
    $timeout.flush(); //trigger $timeout
    expect(WebExUtilsFact.logoutSite).toHaveBeenCalled();
    expect(Auth.logout).toHaveBeenCalled();
  });

  it("should continue if WebEx logout resolves with success", function () {
    deferredLogout.resolve('OK');
    $scope.logout();
    $rootScope.$apply();
    expect(WebExUtilsFact.logoutSite).toHaveBeenCalled();
    expect(Auth.logout).toHaveBeenCalled();
  });

  it("should continue if WebEx logout resolves with error", function () {
    deferredLogout.reject('ERROR');
    $scope.logout();
    $rootScope.$apply();
    expect(WebExUtilsFact.logoutSite).toHaveBeenCalled();
    expect(Auth.logout).toHaveBeenCalled();
  });

  afterEach(function () {
    WebExUtilsFact.logoutSite.calls.reset();
    Auth.logout.calls.reset();
  });
});
