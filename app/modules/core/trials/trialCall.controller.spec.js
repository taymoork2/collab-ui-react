'use strict';

describe('Controller: TrialCallCtrl', function () {
  var controller, $scope, $translate;

  beforeEach(module('Core'));
  beforeEach(module('core.trial'));

  beforeEach(inject(function ($rootScope, $controller, _$translate_) {
    $scope = $rootScope.$new();
    $translate = _$translate_;

    controller = $controller('TrialCallCtrl', {
      $scope: $scope,
      $translate: $translate,
    });
    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('should have nothing enabled', function () {
    var roomSystems = _.find(controller.details.roomSystems, {enabled:true});
    var phones = _.filter(controller.details.phones, {enabled:true});

    expect(roomSystems).toBeUndefined();
    expect(phones.length).toBe(0);
  });

  // the back end expects this as an enum and enums cant start with numbers
  it('should have all devices starting with \'CISCO_\'',function () {
    for(var i = 0; i < controller.details.roomSystems.length; i++){
        var model = controller.details.roomSystems[i].model;
        expect(model.indexOf('CISCO_')).toBe(0);
    }
    for(var i = 0; i < controller.details.phones.length; i++){
        var model = controller.details.phones[i].model;
        expect(model.indexOf('CISCO_')).toBe(0);
    }
  });

  it('should always have a recipientType === PARTNER || CUSTOMER', function(){
    expect(controller.details.shippingInfo.recipientType).toBeDefined();
    expect(controller.details.shippingInfo.recipientType).toBe('CUSTOMER' || 'PARTNER');
  });
});
