'use strict';

describe('UserInfoDirective', function () {
  var $compile, $rootScope, Authinfo, Userservice;
  var view, scope;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));
  beforeEach(module('WebExApp'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies(_$compile_, _$rootScope_, _Authinfo_, _Userservice_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    Authinfo = _Authinfo_;
    Userservice = _Userservice_;
  }

  function initSpies() {
    spyOn(Authinfo, 'isPartnerAdmin').and.returnValue(false);
    spyOn(Authinfo, 'isPartnerSalesAdmin').and.returnValue(false);
    spyOn(Userservice, 'getUser');
  }

  function compileTemplate() {
    view = $compile("<cr-user-info/>")($rootScope);
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
