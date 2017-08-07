'use strict';

/* eslint angular/interval-service: 0 */

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
    spyOn(Authinfo, 'isReadOnlyAdmin');
    Authinfo.isReadOnlyAdmin.and.returnValue(true);
    directiveElem = getCompiledElement();
  }));

  function getCompiledElement() {
    var element = angular.element('<div show-read-only></div>');
    var compiledElement = compile(element)(scope);
    scope.$digest();
    return compiledElement;
  }

  it('should be wrapped in div element', function () {
    expect(Authinfo.isReadOnlyAdmin.calls.count()).toBe(1);
    var divElement = directiveElem.find('div');
    expect(divElement).toBeDefined();
    expect(divElement.text()).toEqual(translate.instant('readOnlyModal.banner'));
  });

  it('should css correct the side-panel', function (done) {
    var observableTriggered = false;
    var sidePanel = angular.element('<div class="side-panel"></div>');
    $('body').append(sidePanel);
    var observableInterval = setInterval(function () {
      observableTriggered = sidePanel.hasClass('side-panel-correction');
      if (observableTriggered) {
        clearInterval(observableInterval);
        expect(sidePanel).toHaveClass('side-panel-correction');
        sidePanel.remove();
        done();
      }
    }, 100);
  });

  it('should css correct the side-panel-full-height', function (done) {
    var observableTriggered = false;
    var sidePanel = angular.element('<div class="side-panel side-panel-full-height"></div>');
    $('body').append(sidePanel);
    var observableInterval = setInterval(function () {
      observableTriggered = sidePanel.hasClass('side-panel-correction-full-height');
      if (observableTriggered) {
        clearInterval(observableInterval);
        expect(sidePanel).toHaveClass('side-panel-correction-full-height');
        sidePanel.remove();
        done();
      }
    }, 100);
  });
});
