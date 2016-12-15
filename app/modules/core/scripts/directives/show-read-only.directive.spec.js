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
    sinon.stub(Authinfo, 'isReadOnlyAdmin');
    Authinfo.isReadOnlyAdmin.returns(true);
    directiveElem = getCompiledElement();
  }));

  function getCompiledElement() {
    var element = angular.element('<div show-read-only></div>');
    var compiledElement = compile(element)(scope);
    scope.$digest();
    return compiledElement;
  }

  it('should be wrapped in div element', function () {
    expect(Authinfo.isReadOnlyAdmin.callCount).toBe(1);
    var divElement = directiveElem.find('div');
    expect(divElement).toBeDefined();
    expect(divElement.text()).toEqual(translate.instant('readOnlyModal.banner'));
  });

});
