'use strict';

describe('UserInfoController', function () {
  beforeEach(module('Core'));

  var controller, $window, $scope, FeedbackService, Userservice, Utils, deferred, $rootScope;

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
    controller = $controller('UserInfoController', {
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
