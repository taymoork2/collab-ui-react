'use strict';

describe('UserInfoDirective', function () {
  var $compile, $rootScope, $provide, $q, Authinfo, Userservice;
  var view, scope;
  var featureToggleService = {
    supports: function () {},
  };

  afterEach(function () {
    if (view) {
      view.remove();
    }
    $compile = $rootScope = Authinfo = Userservice = undefined;
    view = scope = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('WebExApp'));
  beforeEach(angular.mock.module(function (_$provide_) {
    $provide = _$provide_;
    $provide.value('FeatureToggleService', featureToggleService);
  }));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$compile_, _$rootScope_, _$q_, _Authinfo_, _Userservice_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    Userservice = _Userservice_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isPartnerAdmin').and.returnValue(false);
    spyOn(Authinfo, 'isPartnerSalesAdmin').and.returnValue(false);
    spyOn(Userservice, 'getUser');
    spyOn(featureToggleService, 'supports').and.returnValue($q.resolve(false));
  }

  function compileTemplate() {
    view = $compile('<cr-user-info/>')($rootScope);
    $rootScope.$apply();
    scope = view.scope();
  }

  describe('Feedback Link', function () {
    var FEEDBACK_LINK = '#feedback-lnk';
    it('should send feedback on click', function () {
      compileTemplate();
      spyOn(scope, 'sendFeedback');

      view.find(FEEDBACK_LINK).click();
      expect(scope.sendFeedback).toHaveBeenCalled();
    });
  });

  describe('Video Tutorial Link', function () {
    var VIDEO_TUTORIAL_LINK = '#videoTutorial-lnk';

    it('should not exist for regular admin', function () {
      compileTemplate();
      expect(view.find(VIDEO_TUTORIAL_LINK).length).toBe(0);
    });

    describe('should exist', function () {
      afterEach(clickAndVerifyOpenVideo);

      it('for a partner admin', function () {
        Authinfo.isPartnerAdmin.and.returnValue(true);
      });

      it('for a partner sales admin', function () {
        Authinfo.isPartnerSalesAdmin.and.returnValue(true);
      });

      function clickAndVerifyOpenVideo() {
        compileTemplate();
        spyOn(scope, 'openVideo');

        view.find(VIDEO_TUTORIAL_LINK).click();
        expect(scope.openVideo).toHaveBeenCalled();
      }
    });
  });
});
