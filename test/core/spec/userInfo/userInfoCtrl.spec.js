'use strict';

describe('UserInfoController', function () {
  beforeEach(module('Core'));

  var controller, $window, $scope, $translate, Log, FeedbackService, Userservice, Utils;

  beforeEach(inject(function($rootScope, $controller, _$translate_){
    $translate = _$translate_;
    $scope = $rootScope.$new();
    Log = {
      debug: sinon.stub()
    };
    Userservice = {
      getUser: sinon.stub()
    };
    FeedbackService = {
      getFeedbackUrl: sinon.stub()
    };
    Utils = {
      getUUID: sinon.stub()
    };
    $window = {
      open: sinon.stub(),
      navigator: { userAgent: sinon.stub() }
    }
    controller = $controller('UserInfoController', {
      $scope: $scope,
      $window: $window,
      $translate: $translate,
      Log: Log,
      Utils: Utils,
      Userservice: Userservice,
      FeedbackService: FeedbackService,
    });
  }));

  describe('sendFeedback', function () {

    it('fetches url and opens new window', function() {
      $window.navigator.userAgent = 'some useragent';
      Utils.getUUID = function() { return 'awesome uuid'; };

      $scope.sendFeedback();

      expect(FeedbackService.getFeedbackUrl.callCount).toBe(1);
      expect(FeedbackService.getFeedbackUrl.args[0][0]).toBe('Atlas_some useragent');
      expect(FeedbackService.getFeedbackUrl.args[0][1]).toBe('awesome uuid');

      FeedbackService.getFeedbackUrl.callArgWith(2, {success: true, url: 'some url'}, 'some status');

      expect(Log.debug.callCount).toBe(1);
      expect(Log.debug.args[0][0]).toBe('feedback status: some status');
      expect($window.open.callCount).toBe(1);
      expect($window.open.args[0][0]).toBe('some url');
      expect($window.open.args[0][1]).toBe('_blank');
    });

    it('logs if FeedbackService fails', function() {
      $scope.sendFeedback();

      FeedbackService.getFeedbackUrl.callArgWith(2, { success: false }, 'another status');

      expect(Log.debug.callCount).toBe(2);
      expect(Log.debug.args[1][0]).toBe('Cannot load feedback url: another status');
    });

  });

});
