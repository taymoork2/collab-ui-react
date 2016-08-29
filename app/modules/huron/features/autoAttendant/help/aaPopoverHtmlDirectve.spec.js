'use strict';

describe('Directive: aaPopoverHtml', function () {
  var $compile, $rootScope, $scope;
  var element, divElement;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    $scope = $rootScope.$new();
    element = angular.element("<span aa-popover-html='This is a <strong>test</strong>.' popover-trigger='click' popover-animation='true' popover-placement='bottom'></span>");
    divElement = angular.element("<div></div>");
    element.appendTo(divElement);
    $compile(element)($scope);
    $scope.$digest();
  }));

  it('should process provided html and show popover', function () {
    expect(element.attr('aa-popover-html')).toContain("This is a <strong>test</strong>.");
    expect(divElement.children().length).toEqual(1);

    $(element).trigger('click');
    $scope.$digest();

    expect(divElement.children().length).toEqual(2);
    expect(divElement.children('.popover').attr('aa-popover-html-popup')).toBeDefined();
    expect(divElement.children('.popover').html()).toContain("This is a <strong>test</strong>."); // markup is retained
    expect(divElement.children('.popover').text()).toContain("This is a test.");
  });
});
