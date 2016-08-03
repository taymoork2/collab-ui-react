'use strict';

describe('Directive: aaBuilderLane', function () {
  var $compile, $rootScope, scope;
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    scope = $rootScope.$new();
  }));

  it('should set element focus if aa-name-focus is "true"', function () {
    scope.name = 'AA Test';
    scope.aaNameFocus = 'false';
    var element = $compile("<aa-builder-name-edit aa-max-length='64' aa-name-focus='aaNameFocus' ng-model='name'></aa-name-focus>")(scope);
    spyOn(element[0], 'focus');
    scope.$digest();

    scope.aaNameFocus = true;
    scope.$digest();

    expect(element[0].focus).toHaveBeenCalled();
  });

  it('should filter out enter key on name input', function () {
    var keyCode_enter = 13;
    var event = {
      type: 'keydown',
      keyCode: keyCode_enter,
      preventDefault: function () {}
    };

    scope.name = 'AA Test';
    scope.aaNameFocus = 'true';
    var element = $compile("<aa-builder-name-edit aa-max-length='64' aa-name-focus='aaNameFocus' ng-model='name'></aa-name-focus>")(scope);
    spyOn(event, 'preventDefault');
    scope.$digest();

    element.triggerHandler(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should stop accepting character when aa-max-length is reached', function () {
    var event = {
      type: 'keydown',
      keyCode: 65,
      preventDefault: function () {}
    };

    scope.name = '';
    scope.aaNameFocus = 'true';
    var element = $compile("<aa-builder-name-edit aa-max-length='2' aa-name-focus='aaNameFocus' ng-model='name'></aa-name-focus>")(scope);
    spyOn(event, 'preventDefault');
    scope.$digest();

    element.text('A');
    element.triggerHandler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();

    element.text('AA');
    element.triggerHandler(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should still accept arrow keys and delete key when aa-max-length is reached', function () {
    var keyCode_backspace = 8;
    var keyCode_delete = 46;
    var keyCode_leftarrow = 37;
    var keyCode_uparrow = 38;
    var keyCode_rightarrow = 39;
    var keyCode_downarrow = 49;
    var event = {
      type: 'keydown',
      keyCode: 65,
      preventDefault: function () {}
    };

    scope.name = 'AA';
    scope.aaNameFocus = 'true';
    var element = $compile("<aa-builder-name-edit aa-max-length='2' aa-name-focus='aaNameFocus' ng-model='name'></aa-name-focus>")(scope);
    spyOn(event, 'preventDefault');
    scope.$digest();

    event.keyCode = keyCode_backspace;
    element.triggerHandler(event);
    scope.$digest();
    expect(event.preventDefault).not.toHaveBeenCalled();

    event.keyCode = keyCode_delete;
    element.triggerHandler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();

    event.keyCode = keyCode_leftarrow;
    element.triggerHandler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();

    event.keyCode = keyCode_uparrow;
    element.triggerHandler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();

    event.keyCode = keyCode_rightarrow;
    element.triggerHandler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();

    event.keyCode = keyCode_downarrow;
    element.triggerHandler(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should update name via ngModel on keyup event', function () {
    var event = {
      type: 'keyup',
      keyCode: 65
    };

    scope.name = '';
    scope.aaNameFocus = 'true';
    var element = $compile("<aa-builder-name-edit aa-max-length='64' aa-name-focus='aaNameFocus' ng-model='name'></aa-name-focus>")(scope);
    scope.$digest();

    element.text('A');
    element.triggerHandler(event);
    scope.$digest();

    expect(scope.name).toEqual('A');
  });

  it('should update name via ngModel and set focus to false on blur event', function () {
    var event = {
      type: 'blur'
    };

    scope.name = '';
    scope.aaNameFocus = 'true';
    var element = $compile("<aa-builder-name-edit aa-max-length='64' aa-name-focus='aaNameFocus' ng-model='name'></aa-name-focus>")(scope);
    scope.$digest();

    element.text('A');
    element.triggerHandler(event);
    scope.$digest();

    expect(scope.name).toEqual('A');
    expect(scope.aaNameFocus).toEqual(false);
  });
});
