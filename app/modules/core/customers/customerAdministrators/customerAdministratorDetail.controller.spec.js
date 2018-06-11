'use strict';

describe('Controller: customerAdministratorDetailCtrl', function () {
  beforeEach(angular.mock.module('Core'));

  // TODO: decouple 'Userservice' from 'HuronUser', or relocate 'Userservice.get*FromUser()'
  beforeEach(angular.mock.module('Huron'));

  var controller, $controller, $scope, $q, $stateParams, Analytics, CustomerAdministratorService, ModalService, Notification, Orgservice, Userservice;
  var modalDefer, testUsers = [];

  afterAll(function () {
    modalDefer = testUsers = undefined;
  });

  afterEach(function () {
    controller = $controller = $scope = $q = $stateParams = Analytics = CustomerAdministratorService = ModalService = Notification = Orgservice = Userservice = undefined;
  });

  beforeEach(inject(function (_$controller_, $rootScope, _$q_, _$stateParams_, _Analytics_, _Notification_, _CustomerAdministratorService_, _ModalService_, _Orgservice_, _Userservice_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $stateParams = _$stateParams_;
    Analytics = _Analytics_;
    CustomerAdministratorService = _CustomerAdministratorService_;
    ModalService = _ModalService_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
    Userservice = _Userservice_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666',
    };

    modalDefer = $q.defer();
    testUsers = [{
      fullName: 'Frank Sinatra',
      uuid: 'd3434d78-26452-445a2-845d8-4c1816565b3f0a',
    }];
    spyOn(CustomerAdministratorService, 'removeCustomerAdmin').and.returnValue($q.resolve({}));
    spyOn(CustomerAdministratorService, 'getCustomerAdmins').and.returnValue($q.resolve({
      data: {
        Resources: [{
          name: {
            givenName: 'Jane',
            familyName: 'Doe',
          },
          id: '1',
          avatarSyncEnabled: false,
        }, {
          name: {
            givenName: 'John',
            familyName: 'Doe',
          },
          id: '2',
          avatarSyncEnabled: true,
        }],
      },
    }));
    spyOn(ModalService, 'open').and.returnValue({
      result: modalDefer.promise,
    });
    spyOn(Analytics, 'trackEvent').and.returnValue($q.resolve({}));
    spyOn(Notification, 'errorResponse');
    spyOn(Notification, 'success');

    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(getJSONFixture('core/json/organizations/Orgservice.json').getOrg, 200);
    });

    spyOn(Userservice, 'getPrimaryEmailFromUser');
  }));

  function initController() {
    controller = $controller('CustomerAdministratorDetailCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
    });
    $scope.$apply();
  }

  function rejectGetPartnerUsers() {
    spyOn(CustomerAdministratorService, 'getPartnerUsers').and.returnValue($q.reject({
      data: {
        Errors: [{
          code: '403',
          description: 'Organization has too many users.',
          errorCode: '200046',
        }],
      },
      status: 403,
    }));
  }

  describe('getCustomerAdmins():', function () {
    beforeEach(initController);

    it('must push administrator into View-Model assignedAdmins array', function () {
      expect(controller.assignedAdmins[0].uuid).toEqual('1');
      expect(controller.assignedAdmins[0].fullName).toEqual('Jane Doe');
      expect(controller.assignedAdmins[0].avatarSyncEnabled).toEqual(false);
      expect(controller.assignedAdmins[1].uuid).toEqual('2');
      expect(controller.assignedAdmins[1].fullName).toEqual('John Doe');
      expect(controller.assignedAdmins[1].avatarSyncEnabled).toEqual(true);
    });
  });

  describe('getPartnerUsers():', function () {
    beforeEach(initController);

    it('must display too many results error message', function () {
      rejectGetPartnerUsers();
      controller.getPartnerUsers('a');
      $scope.$apply();

      expect(controller.resultsError).toEqual(true);
      expect(controller.resultsErrorMessage).toEqual('customerAdminPanel.tooManyResultsError');
    });
  });

  describe('removeCustomerAdmin():', function () {
    beforeEach(initController);

    it('must splice administrator from View-Model assignedAdmins array', function () {
      controller.removeCustomerAdmin('Jane Doe');
      modalDefer.resolve();
      $scope.$apply();

      expect(controller.assignedAdmins[0].uuid).toEqual('2');
      expect(controller.assignedAdmins[0].fullName).toEqual('John Doe');
      expect(controller.assignedAdmins[0].avatarSyncEnabled).toEqual(true);
    });
  });

  describe('removeCustomerAdmin', function () {
    beforeEach(initController);

    it('must not delete on Modal dismiss', function () {
      controller.removeCustomerAdmin('1', 'Jane Doe');
      modalDefer.reject();
      $scope.$apply();

      expect(controller.assignedAdmins.length).toEqual(2);
    });
  });

  describe('addCustomerAdmin when admin does not have full-admin or sales-admin role: ', function () {
    beforeEach(function () {
      CustomerAdministratorService.addCustomerAdmin = jasmine.createSpy('CustomerAdministratorService').and.returnValue($q.resolve({
        userName: 'frank.sinatra+sinatrahelpdesk@gmail.com',
        emails: [{
          primary: true,
          type: 'work',
          value: 'frank.sinatra+sinatrahelpdesk@gmail.com',
        }],
        name: {
          givenName: 'Frank',
          familyName: 'Sinatra',
        },
        roles: ['sinatras_bank_admin'],
        displayName: 'Frank Sinatra',
        id: 'd3434d78-26452-445a2-845d8-4c1816565b3f0a',
        avatarSyncEnabled: false,
      }));
      initController();
    });

    it('must push administrator into View-Model assignedAdmins array', function () {
      controller.users = testUsers;
      controller.assignedAdmins = [];
      controller.addCustomerAdmin('Frank Sinatra').then(function () {
        expect(controller.assignedAdmins[0].uuid).toEqual('d3434d78-26452-445a2-845d8-4c1816565b3f0a');
        expect(controller.assignedAdmins[0].fullName).toEqual('Frank Sinatra');
        expect(controller.assignedAdmins[0].avatarSyncEnabled).toEqual(false);
      });
    });

    it('should patch Sales_admin role if user does not have full-admin and sales-admin', function () {
      controller.users = testUsers;
      controller.assignedAdmins = [];
      controller.addCustomerAdmin('Frank Sinatra').then(function () {
        expect(controller.assignedAdmins[0].uuid).toEqual('d3434d78-26452-445a2-845d8-4c1816565b3f0a');
        expect(Analytics.trackEvent()).toHaveBeenCalled();
      });
    });
  });

  describe('Upon addCustomerAdmin : ', function () {
    beforeEach(function () {
      CustomerAdministratorService.addCustomerAdmin = jasmine.createSpy('CustomerAdministratorService').and.returnValue($q.resolve({
        userName: 'frank.sinatra+sinatrahelpdesk@gmail.com',
        emails: [{
          primary: true,
          type: 'work',
          value: 'frank.sinatra+sinatrahelpdesk@gmail.com',
        }],
        name: {
          givenName: 'Frank',
          familyName: 'Sinatra',
        },
        displayName: 'Frank Sinatra',
        id: 'd3434d78-26452-445a2-845d8-4c1816565b3f0a',
        avatarSyncEnabled: false,
      }));
      initController();
    });

    it('should patch Sales_admin role if user does not have roles from CI', function () {
      // TODO: revisit and add unit-tests after fixing karma + webpack performance problems
    });
  });

  describe('addCustomerAdmin when admin has full-admin or sales-admin role: ', function () {
    beforeEach(function () {
      CustomerAdministratorService.addCustomerAdmin = jasmine.createSpy('CustomerAdministratorService').and.returnValue($q.resolve({
        userName: 'frank.sinatra+sinatrahelpdesk@gmail.com',
        emails: [{
          primary: true,
          type: 'work',
          value: 'frank.sinatra+sinatrahelpdesk@gmail.com',
        }],
        name: {
          givenName: 'Frank',
          familyName: 'Sinatra',
        },
        roles: ['atlas-portal.partner.salesadmin', 'id_full_admin'],
        displayName: 'Frank Sinatra',
        id: 'd3434d78-26452-445a2-845d8-4c1816565b3f0a',
        avatarSyncEnabled: false,
      }));
      initController();
    });

    it('must push administrator into View-Model assignedAdmins array', function () {
      controller.users = testUsers;
      controller.assignedAdmins = [];
      controller.addCustomerAdmin('Frank Sinatra').then(function () {
        expect(controller.assignedAdmins[0].uuid).toEqual('d3434d78-26452-445a2-845d8-4c1816565b3f0a');
        expect(controller.assignedAdmins[0].fullName).toEqual('Frank Sinatra');
        expect(controller.assignedAdmins[0].avatarSyncEnabled).toEqual(false);
      });
    });

    it('should not patch sales-admin role if user has full-admin and sales-admin role', function () {
      controller.users = testUsers;
      controller.assignedAdmins = [];
      controller.addCustomerAdmin('Frank Sinatra').then(function () {
        expect(controller.assignedAdmins[0].uuid).toEqual('d3434d78-26452-445a2-845d8-4c1816565b3f0a');
        expect(Analytics.trackEvent()).toHaveBeenCalled();
      });
    });
  });

  describe('addCustomerAdmin call failed', function () {
    it('must throw Notification.errorResponse', function () {
      initController();
      spyOn(CustomerAdministratorService, 'addCustomerAdmin').and.returnValue($q.reject());
      controller.users = testUsers;
      controller.assignedAdmins = [];
      controller.addCustomerAdmin('Frank Sinatra').then(function () {
        expect(Notification.errorResponse).toHaveBeenCalled();
      });
      $scope.$apply();
    });
  });

  describe('helper functions:', function () {
    beforeEach(initController);
    describe('getFoundUsers():', function () {
      // TODO: revisit and add unit-tests after fixing karma + webpack performance problems
    });

    describe('getAdminProfileFromUser():', function () {
      // TODO: revisit and add unit-tests after fixing karma + webpack performance problems
    });

    describe('canAddUser():', function () {
      it('should early out if "selected" property is false-y', function () {
        controller.selected = undefined;
        expect(controller._helpers.canAddUser()).toBe(undefined);
        controller.selected = '';
        expect(controller._helpers.canAddUser()).toBe('');
      });

      it('should call through to "isUserAlreadyAssigned()" and return the negated result if "selected" is truthy', function () {
        controller.selected = 'fake-user-1';
        controller.foundUsers = [{ fullName: 'fake-user-1' }, { fullName: 'fake-user-2' }];
        spyOn(controller._helpers, 'isUserAlreadyAssigned').and.returnValue(true);
        expect(controller._helpers.canAddUser()).toBe(false);
        expect(controller._helpers.isUserAlreadyAssigned).toHaveBeenCalledWith('fake-user-1');
      });
      it('should return false is selected user does not match any of the found users', function () {
        controller.selected = 'typed-in-gibberish';
        controller.foundUsers = [{ fullName: 'fake-user-1' }, { fullName: 'fake-user-2' }];
        expect(controller._helpers.canAddUser()).toBe(false);
      });
      it('should return true is selected user matches one of the found users and has not yet been assigned', function () {
        controller.selected = 'fake-user-2';
        controller.foundUsers = [{ fullName: 'fake-user-1' }, { fullName: 'fake-user-2' }];
        spyOn(controller._helpers, 'isUserAlreadyAssigned').and.returnValue(false);
        expect(controller._helpers.canAddUser()).toBe(true);
      });
    });

    describe('isUserAlreadyAssigned():', function () {
      it('should search "assignedAdmins" list for an exact match on "fullName", and return true if found, false otherwise', function () {
        controller.assignedAdmins = [{ fullName: 'fake-user-1' }];
        expect(controller._helpers.isUserAlreadyAssigned('fake-user-1')).toBe(true);
        expect(controller._helpers.isUserAlreadyAssigned('fake-user-2')).toBe(false);
      });
    });

    describe('resetResultsError():', function () {
      it('should set "resultsError" property to false', function () {
        controller._helpers.resetResultsError();
        expect(controller.resultsError).toBe(false);
      });

      it('should set "resultsErrorMessage" property to empty string', function () {
        controller._helpers.resetResultsError();
        expect(controller.resultsErrorMessage).toBe('');
      });
    });

    describe('setResultsError():', function () {
      it('should set "resultsError" property to true', function () {
        controller._helpers.setResultsError('fake-translate-key');
        expect(controller.resultsError).toBe(true);
      });

      it('should set "resultsErrorMessage" property to the translated string', function () {
        controller._helpers.setResultsError('fake-translate-key');
        expect(controller.resultsErrorMessage).toBe('fake-translate-key');
      });
    });
  });
});
