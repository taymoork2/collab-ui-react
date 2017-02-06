'use strict';

describe('New button component', function () {
  beforeEach(angular.mock.module('Context'));

  var $compile, $rootScope, element;

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;

    element = $compile('<new-button></new-button>')($rootScope);
    $rootScope.$digest();
  }));

  it('should create new button with the text is right', function () {
    expect(element.text().trim()).toEqual('common.new');
  });

  it('should be able to click new button', function () {
    var controller = element.controller('newButton');
    expect(controller).toBeDefined();

    element.click();
    spyOn(controller, 'openNewModal');
  });
});
