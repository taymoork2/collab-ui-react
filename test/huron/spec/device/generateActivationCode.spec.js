'use strict';

xdescribe('Controller: GenerateActivationCodeCtrl', function () {
	var controller, scope;

	beforeEach(module('uc.device'));
  beforeEach(module('ui.bootstrap'));
  beforeEach(module('ui.router'));
  beforeEach(module('dialogs'));
  beforeEach(module('Huron'));

  var DeviceService = {
  	getQrCodeUrl: sinon.stub()
  };

  var HuronUser = {
  	acquireOTP: sinon.stub().returns('0001000200030004')
  };

  beforeEach(inject(function ($rootScope, $controller, $state) {
    scope = $rootScope.$new();
    controller = $controller('GenerateActivationCodeCtrl as vm', {
      $scope: scope,
      userName: 'jeffisawesome@awesomedude.com',
      DeviceService: DeviceService,
      HuronUser: HuronUser
    });
    $rootScope.$apply();
  }));

  describe('GenerateActivationCodeCtrl controller', function () {
	  it('should be created successfully', function () {
	    expect(controller).toBeDefined;
	  });

  });

});