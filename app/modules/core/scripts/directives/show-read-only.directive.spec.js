'use strict';

describe('Directive: ShowReadOnly', function () {
  var compile, scope, directiveElem, Authinfo, translate;

  afterEach(function () {
    if (directiveElem) {
      directiveElem.remove();
    }
    directiveElem = undefined;
  });

  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function (_$rootScope_, _$compile_, _$translate_, _Authinfo_) {
    compile = _$compile_;
    scope = _$rootScope_.$new();
    Authinfo = _Authinfo_;
    translate = _$translate_;
    spyOn(Authinfo, 'isReadOnlyAdmin').and.returnValue(false);
    spyOn(Authinfo, 'isPartnerReadOnlyAdmin').and.returnValue(false);
  }));

  function getCompiledElement() {
    var element = angular.element('<div show-read-only></div>');
    var compiledElement = compile(element)(scope);
    scope.$digest();
    return compiledElement;
  }

  describe('with a read-only admin', function () {
    beforeEach(function () {
      Authinfo.isReadOnlyAdmin.and.returnValue(true);
      Authinfo.isPartnerReadOnlyAdmin.and.returnValue(false);
      directiveElem = getCompiledElement();
    });

    it('should be wrapped in div element', function () {
      expect(Authinfo.isReadOnlyAdmin.calls.count()).toBe(1);
      var divElement = directiveElem.find('div');
      expect(divElement).toBeDefined();
      expect(divElement.text()).toEqual(translate.instant('readOnlyModal.banner'));
    });

    it('should add .is-read-only-admin to body element when active', function () {
      var body = angular.element('body');
      expect(body).toHaveClass('is-read-only-admin');

      directiveElem.remove();
      directiveElem = undefined;

      expect(body).not.toHaveClass('is-read-only-admin');
    });
  });

  describe('with a read-only partner admin', function () {
    beforeEach(function () {
      Authinfo.isReadOnlyAdmin.and.returnValue(false);
      Authinfo.isPartnerReadOnlyAdmin.and.returnValue(true);
      directiveElem = getCompiledElement();
    });

    it('should be wrapped in div element', function () {
      expect(Authinfo.isPartnerReadOnlyAdmin.calls.count()).toBe(1);
      var divElement = directiveElem.find('div');
      expect(divElement).toBeDefined();
      expect(divElement.text()).toEqual(translate.instant('readOnlyModal.banner'));
    });

    it('should add .is-read-only-admin to body element when active', function () {
      var body = angular.element('body');
      expect(body).toHaveClass('is-read-only-admin');

      directiveElem.remove();
      directiveElem = undefined;

      expect(body).not.toHaveClass('is-read-only-admin');
    });
  });

  describe('without read-only admin or a read-only partner admin', function () {
    beforeEach(function () {
      Authinfo.isReadOnlyAdmin.and.returnValue(false);
      Authinfo.isPartnerReadOnlyAdmin.and.returnValue(false);
      directiveElem = getCompiledElement();
    });

    it('should not show read-only-banner', function () {
      expect(Authinfo.isReadOnlyAdmin.calls.count()).toBe(1);
      expect(Authinfo.isPartnerReadOnlyAdmin.calls.count()).toBe(1);
      var bannerElement = directiveElem.find('.read-only-banner');
      expect(bannerElement).not.toExist();
    });

    it('should not add .is-read-only-admin to body element when active', function () {
      var body = angular.element('body');
      expect(body).not.toHaveClass('is-read-only-admin');

      directiveElem.remove();
      directiveElem = undefined;
    });
  });
});
