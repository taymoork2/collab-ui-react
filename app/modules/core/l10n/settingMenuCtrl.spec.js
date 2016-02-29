'use strict';

describe('settingsMenuCtrl', function () {
  beforeEach(module('Core'));

  var controller, $translate;

  beforeEach(inject(function ($rootScope, $controller, _$translate_) {
    $translate = _$translate_;
    $translate.use = sinon.stub().returns('no_NO');

    controller = $controller('SettingsMenuCtrl', {
      $scope: $rootScope.$new
    });
  }));

  it('should have injected the list of languages', function () {
    expect(controller.options.length).toEqual(21);
  });

  it('should set the current language', function () {
    expect(controller.selected.value).toBe('no_NO');
  });

});
