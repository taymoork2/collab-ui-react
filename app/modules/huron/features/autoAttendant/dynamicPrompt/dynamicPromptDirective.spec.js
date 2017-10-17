'use strict';

describe('Directive: dynamicPromptDirective', function () {
  var $window;
  var $compile;
  var $rootScope;
  var $scope;
  var $timeout;
  var element;
  var CONSTANTS = {};
  CONSTANTS.read = 'blur keyup change';
  CONSTANTS.defaultElementParentType = 'span';
  CONSTANTS.contentEditable = 'contentEditable';
  CONSTANTS.lastElement = '<br class="ng-scope">';
  CONSTANTS.placeHolderDataDiv = 'data-div-placeholder-content';
  CONSTANTS.textNode = 3;

  afterEach(function () {
    if (element) {
      element.remove();
    }
    element = undefined;
    $window = $compile = $rootScope = $timeout = undefined;
  });

  beforeEach(angular.mock.module('uc.autoattendant'));
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$timeout_, _$window_) {
    $window = _$window_;
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
  }));

  describe('basic', function () {
    beforeEach(function () {
      jasmine.clock().uninstall();
      jasmine.clock().install();
    });

    it('should set up the basic dynamic prompt without ngModel and fail', function () {
      setTimeout(function () {
        $scope = $rootScope.$new();
        $scope.mock = {};
        $scope.mock.modelValues = [];
        $scope.mock.dynamicTags = [];
        element = angular.element('<dynamic-prompt dynamic-tags="mock.dynamicTags" model-values="mock.modelValues" insert-element="insertElement" spellcheck="false"></dynamic-prompt>');
        $compile(element)($scope);
        $scope.$digest();
        $timeout.flush();
        $scope.$apply();
      }, 100);
      jasmine.clock().tick(101);
      expect(element.attr(CONSTANTS.placeHolderDataDiv)).toBe(undefined);
    });

    it('should set up the basic dynamic prompt', function () {
      setTimeout(function () {
        $scope = $rootScope.$new();
        $scope.mock = {};
        $scope.mock.ngModel = {};
        $scope.mock.modelValues = [];
        $scope.mock.dynamicTags = [];
        element = angular.element('<dynamic-prompt dynamic-tags="mock.dynamicTags" model-values="mock.modelValues" insert-element="insertElement" ng-model="mock.ngModel" spellcheck="false"></dynamic-prompt>');
        $('body').append(element); // attach to DOM for range manipulation
        $compile(element)($scope);
        $scope.$digest();
        $timeout.flush();
        $scope.$apply();
      }, 100);
      jasmine.clock().tick(101);
      expect(element.attr(CONSTANTS.contentEditable)).toBe('true');
      expect(element.attr('spellcheck')).toBe('false');
      expect(element.attr(CONSTANTS.placeHolderDataDiv)).toBe('true');
      expect(element.html()).toContain('br');
      expect(element.hasClass('dynamic-prompt')).toBe(true);
      expect(element.text()).toBe('');
      expect($scope.mock.modelValues.length).toBe(0);
    });

    it('should set up the basic dynamic prompt without prepopulation', function () {
      setTimeout(function () {
        $scope = $rootScope.$new();
        $scope.mock = {};
        $scope.mock.ngModel = {};
        $scope.mock.dynamicTags = [];
        element = angular.element('<dynamic-prompt dynamic-tags="mock.dynamicTags" model-values="mock.modelValues" insert-element="insertElement" ng-model="mock.ngModel" spellcheck="false"></dynamic-prompt>');
        $('body').append(element); // attach to DOM for range manipulation
        $compile(element)($scope);
        $scope.$digest();
        $timeout.flush();
        $scope.$apply();
      }, 100);
      jasmine.clock().tick(101);
      expect(element.attr(CONSTANTS.contentEditable)).toBe('true');
      expect(element.attr('spellcheck')).toBe('false');
      expect(element.attr(CONSTANTS.placeHolderDataDiv)).toBe('true');
      expect(element.html()).toContain('br');
      expect(element.hasClass('dynamic-prompt')).toBe(true);
      expect(element.text()).toBe('');
      expect($scope.mock.modelValues.length).toBe(0);
    });

    it('should set up the basic dynamic prompt with modelValue data', function () {
      setTimeout(function () {
        $scope = $rootScope.$new();
        $scope.mock = {};
        $scope.mock.ngModel = {};
        $scope.mock.modelValues = [{
          html: 'test-value',
          model: 'test-value',
        }];
        $scope.mock.dynamicTags = [];
        element = angular.element('<dynamic-prompt dynamic-tags="mock.dynamicTags" model-values="mock.modelValues" insert-element="insertElement" ng-model="mock.ngModel" spellcheck="false"></dynamic-prompt>');
        $('body').append(element); // attach to DOM for range manipulation
        $compile(element)($scope);
        $scope.$digest();
        $timeout.flush();
        $scope.$apply();
      }, 100);
      jasmine.clock().tick(101);
      expect(element.attr(CONSTANTS.contentEditable)).toBe('true');
      expect(element.attr('spellcheck')).toBe('false');
      expect(element.attr(CONSTANTS.placeHolderDataDiv)).toBe(undefined);
      expect(element.html()).toContain('br');
      expect(element.hasClass('dynamic-prompt')).toBe(true);
      expect(element.text()).toBe('test-value');
      expect($scope.mock.modelValues.length).toBe(1);
    });
  });

  describe('write', function () {
    beforeEach(function () {
      $scope = $rootScope.$new();
      $scope.mock = {};
      $scope.mock.ngModel = {};
      $scope.mock.modelValues = [];
      $scope.mock.dynamicTags = [];
      element = angular.element('<dynamic-prompt dynamic-tags="mock.dynamicTags" model-values="mock.modelValues" insert-element="insertElement" ng-model="mock.ngModel" spellcheck="false"></dynamic-prompt>');
    });

    describe('insert', function () {
      beforeEach(function () {
        var rangeGetter = function () {
          return {
            deleteContents: function () {
              return true;
            },
            insertNode: function () {
              return true;
            },
            cloneRange: function () {
              return true;
            },
            setStartAfter: function () {
              return true;
            },
            collapse: function () {
              return true;
            },
          };
        };
        spyOn($window, 'getSelection').and.returnValue({
          getRangeAt: rangeGetter,
          rangeCount: true,
          removeAllRanges: function () {
            return true;
          },
          addRange: function () {
            return true;
          },
        });
        $scope.mock.dynamicTags.push('DIV');
        $compile(element)($scope);
        $scope.$digest();
        $timeout.flush();
        $scope.$apply();
      });

      it('should test the basic formatted insert on function call', function () {
        var scope = element.scope();
        $(element).prepend('<div>value</div>');
        scope.insertElement(true);
        $(element).trigger('change');
        $scope.$digest();
        expect(element.attr(CONSTANTS.placeHolderDataDiv)).toEqual(undefined);
        expect($scope.mock.modelValues[0].model).toEqual('value');
      });

      it('should ensure the data place holder last element not br', function () {
        var scope = element.scope();
        $(element).append('<div>value</div>');
        scope.insertElement(true);
        $(element).trigger('change');
        $scope.$digest();
        expect(element.attr(CONSTANTS.placeHolderDataDiv)).toEqual(undefined);
      });
    });

    describe('read', function () {
      beforeEach(function () {
        $compile(element)($scope);
        $scope.$digest();
        $scope.$apply();
        $timeout.flush();
      });

      it('should test the basic plain text read on change', function () {
        $(element).prepend('value');
        $(element).trigger('change');
        $scope.$digest();
        expect(element.text()).toEqual('value');
        expect(element.attr(CONSTANTS.placeHolderDataDiv)).toEqual(undefined);
        expect($scope.mock.modelValues[0].model).toEqual('value');
      });

      it('should test the basic plain text read on keyup', function () {
        $(element).prepend('value');
        $(element).trigger('keyup');
        $scope.$digest();
        expect(element.text()).toEqual('value');
        expect(element.attr(CONSTANTS.placeHolderDataDiv)).toEqual(undefined);
        expect($scope.mock.modelValues[0].model).toEqual('value');
      });

      it('should test the basic plain text read on blur', function () {
        $(element).prepend('value');
        $(element).trigger('blur');
        $scope.$digest();
        expect(element.text()).toEqual('value');
        expect(element.attr(CONSTANTS.placeHolderDataDiv)).toEqual(undefined);
        expect($scope.mock.modelValues[0].model).toEqual('value');
      });

      it('should send an invalid character', function () {
        var event = jasmine.createSpyObj('event', ['preventDefault']);
        event.key = '>';
        event.type = 'change';
        element.triggerHandler(event);
        $scope.$digest();
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });
  });
});
