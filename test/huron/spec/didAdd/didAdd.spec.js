'use strict';

describe('Controller: DidAddCtrl', function () {
  var controller, $scope, $state, $httpBackend, HuronConfig, Notification;

  beforeEach(module('ui.bootstrap'));
  beforeEach(module('ui.router'));
  beforeEach(module('ngResource'));
  beforeEach(module('Huron'));
  beforeEach(module('uc.didadd'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1'),
    getOrgName: sinon.stub().returns('awesomeco')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function (Notification) {
    sinon.spy(Notification, "notify");
  }));

  var state = {
    modal: {
      close: sinon.stub()
    },
  };

  var stateParams = {
    currentOrg: {
      customerOrgId: '1',
      customerName: 'JEFFCO',
      customerEmail: 'jeffcoiscoolio@jeffco.com'
    }
  };

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _HuronConfig_, _Notification_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $state = state;
    HuronConfig = _HuronConfig_;
    Notification = _Notification_;
    controller = $controller('DidAddCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: stateParams
    });
    controller.tokens = '+9999999999,+8888888888,+7777777777,+6666666666,+5555555555';
    controller.successCount = 0;
    controller.failCount = 0;
    controller.invalidcount = 0;
    controller.submitBtnStatus = false;
    $rootScope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('DidAddCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined;
    });

    describe('after initialization', function () {
      it('should have checkForInvalidTokens method', function () {
        expect(controller.checkForInvalidTokens).toBeDefined;
      });

      it('should have tokenmethods object', function () {
        expect(controller.tokenmethods).toBeDefined;
      });

      describe('tokenmethods.createtoken function', function () {
        it('should exist', function () {
          expect(controller.tokenmethods.createtoken).toBeDefined;
        });

        it('should format the token properly and add a +1 to the number +1 (123) 456-7890', function () {
          var element = {
            attrs: {
              value: '1234567890',
              label: ''
            }
          };
          controller.tokenmethods.createtoken(element)
          expect(element.attrs.value).toEqual('+11234567890');
          expect(element.attrs.label).toEqual('1 (123) 456-7890');
        });

        it('should format the token properly and add a + to the number +5 (123) 456-7890', function () {
          var element = {
            attrs: {
              value: '51234567890',
              label: ''
            }
          };
          controller.tokenmethods.createtoken(element)
          expect(element.attrs.value).toEqual('+51234567890');
          expect(element.attrs.label).toEqual('5 (123) 456-7890');
        });
      });

      describe('tokenmethods.createdtoken function', function () {
        it('should exist', function () {
          expect(controller.tokenmethods.createdtoken).toBeDefined;
        });

        it('should increment invalidcount when an invalid DID is passed in', function () {
          var element = {
            attrs: {
              value: '51234DUDE567890'
            }
          };
          controller.tokenmethods.createdtoken(element);
          expect(controller.invalidcount).toBeGreaterThan(0);
        });
      });

      describe('tokenmethods.removedtoken function', function () {
        it('should exist', function () {
          expect(controller.tokenmethods.removedtoken).toBeDefined;
        });

        it('submit button should be enabled when token count is > 1', function () {
          var element = {
            attrs: {
              value: '+4444444444'
            }
          };
          controller.tokenmethods.removedtoken(element);
          expect(controller.submitBtnStatus).toBeTruthy;
        });
      });

      describe('tokenmethods.editedtoken function', function () {
        it('should exist', function () {
          expect(controller.tokenmethods.editedtoken).toBeDefined;
        });

        it('should update the invalidcount when editedtoken is called', function () {
          var element = {
            attrs: {
              value: '+44444DUDE44444'
            }
          };
          controller.tokenmethods.createdtoken(element)
          expect(controller.invalidcount).toEqual(1);

          element.attrs.value = '4444444444';
          controller.tokenmethods.editedtoken(element);
          expect(controller.invalidcount).toEqual(0);
        });
      });

      describe('submit function', function () {
        it('should exist', function () {
          expect(controller.submit).toBeDefined;
        });

        describe('submit DIDs', function () {
          beforeEach(function () {
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+9999999999'
            }).respond(201);
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+8888888888'
            }).respond(201);
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+7777777777'
            }).respond(201);
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+6666666666'
            }).respond(201);
            $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools', {
              'pattern': '+5555555555'
            }).respond(500);
            controller.submit();
            $httpBackend.flush();
          });

          it('should have a successCount of 4', function () {
            expect(controller.successCount).toEqual(4);
          });

          it('should have a failCount of 1', function () {
            expect(controller.failCount).toEqual(1);
          });
        });
      });

      describe('sendEmail function', function () {
        it('should exist', function () {
          expect(controller.sendEmail).toBeDefined;
        });

        it('should send email and report success notification', function () {
          $httpBackend.whenPOST(HuronConfig.getEmailUrl() + '/email/didadd').respond(200);
          controller.sendEmail();
          $httpBackend.flush();
          expect(Notification.notify.calledOnce).toBe(true);
        });

        it('should report error notification when email cannot be sent', function () {
          $httpBackend.whenPOST(HuronConfig.getEmailUrl() + '/email/didadd').respond(500);
          controller.sendEmail();
          $httpBackend.flush();
          expect(Notification.notify.calledOnce).toBe(true);
        });
      });

    });
  });
});
