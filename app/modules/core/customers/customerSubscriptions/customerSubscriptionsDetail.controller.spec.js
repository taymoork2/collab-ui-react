'use strict';

describe('Controller: customerSubscriptionsDetailCtrl', function () {
  var customerResponseTest, partnerAdmins, customerFullAdmins;

  function _initController() {
    // controller
    this.initController('CustomerSubscriptionsDetailCtrl', {
      controllerLocals: {
        $stateParams: {
          currentCustomer: {
            customerOrgId: 12345,
          },
        },
      },
    });
  }

  function _initDefaultSpies() {
    // spies
    spyOn(this.Auth, 'getCustomerAccount').and.returnValue(this.$q.resolve({ data: customerResponseTest }));

    // notes:
    // - 'getCustomerAdmins()' is returning admins for a customer, but belonging to a partner org
    // - so the name is a bit misleading, we are actually fetching partner admins here
    spyOn(this.CustomerAdministratorService, 'getCustomerAdmins').and.returnValue(this.$q.resolve(partnerAdmins));

    spyOn(this.UserListService, 'listFullAdminUsers').and.returnValue(this.$q.resolve(customerFullAdmins));
  }

  beforeEach(function () {
    // modules
    this.initModules(
      'Core',
      'Huron'
    );

    // dependencies
    this.injectDependencies(
      '$http',
      '$q',
      'Auth',
      'CustomerAdministratorService',
      'UserListService',
      'Userservice'
    );

    // closured vars
    customerResponseTest = _.clone(getJSONFixture('core/json/customerSubscriptions/customerResponseTest.json'));
    partnerAdmins = {
      data: {
        Resources: [{
          name: {
            givenName: 'Jane',
            familyName: 'Doe',
          },
        }, {
          name: {
            givenName: 'John',
            familyName: 'Doe',
          },
        }],
      },
    };

    customerFullAdmins = {
      data: {
        Resources: [{
          name: {
            givenName: 'first-name-1',
            familyName: 'last-name-1',
          },
          emails: [{
            value: 'fake-admin-1@example.com',
            primary: true,
          }],
        }, {
          name: {
            givenName: 'first-name-2',
            familyName: 'last-name-2',
          },
          emails: [{
            value: 'fake-admin-2@example.com',
            primary: true,
          }],
        }, {
          name: {
            givenName: 'first-name-3',
            familyName: 'last-name-3',
          },
          emails: [{
            value: 'fake-admin-3@example.com',
            primary: true,
          }],
        }],
      },
    };

    _initDefaultSpies.call(this);
  });

  afterEach(function () {
    customerResponseTest = partnerAdmins = customerFullAdmins = undefined;
  });


  describe('primary behaviors:', function () {
    beforeEach(function () {
      spyOn(this.Userservice, 'getPrimaryEmailFromUser').and.returnValue('email@email.net');
      _initController.call(this);
    });

    describe('after init():', function () {
      it('must push customerSubscriptions into View-Model subscriptions array', function () {
        expect(this.controller).toBeDefined();
        expect(this.controller.getSubscriptions).toBeDefined();
        expect(this.controller.subscriptions).toBeDefined();
        expect(this.controller.subscriptions[0].siteUrl).toEqual('AtlasTestRitwchau05.webex.com');
        expect(this.controller.subscriptions[0].subscriptionId).toEqual('Test-Sub-08072016a');
      });
      it('must only put unique siteUrl/subscriptionID combinations array', function () {
        expect(this.controller.subscriptions.length).toEqual(2);
        expect(this.controller.subscriptions[1].subscriptionId).toEqual('Test-Sub-08072016b');
      });
      it('must return array of names and emails', function () {
        expect(this.controller.admins.partnerAdmins.length).toEqual(2);
        expect(this.controller.admins.partnerAdmins[1].email).toEqual('email@email.net');
      });
    });
  });

  describe('helpers:', function () {
    beforeEach(function () {
      _initController.call(this);
    });

    describe('flattenAndJoin():', function () {
      it('has a join array function that can join 1 level nested array', function () {
        var inner = ['inner1', 'inner2'];
        var arr = ['one', 'two', inner, 'three'];
        var result = this.controller._helpers.flattenAndJoin(arr, 'banana');
        expect(result).toEqual('onebananatwobananainner1bananainner2bananathree');
      });
    });

    describe('getCustomerFullAdmins():', function () {
      it('calls through to UserListService.listFullAdminUsers()', function () {
        this.controller._helpers.getCustomerFullAdmins();
        expect(this.UserListService.listFullAdminUsers).toHaveBeenCalledWith({
          orgId: 12345,
        });
      });
    });

    describe('getSimplifiedUserList():', function () {
      it('should return a list of objects with only "email", "displayName", and "emailAndName" properties', function () {
        var result = this.controller._helpers.getSimplifiedUserList(customerFullAdmins);
        expect(result.length).toBe(3);
        expect(result).toEqual([
          {
            email: 'fake-admin-1@example.com',
            displayName: 'first-name-1 last-name-1',
            emailAndName: 'fake-admin-1@example.com - first-name-1 last-name-1',
          },
          {
            email: 'fake-admin-2@example.com',
            displayName: 'first-name-2 last-name-2',
            emailAndName: 'fake-admin-2@example.com - first-name-2 last-name-2',
          },
          {
            email: 'fake-admin-3@example.com',
            displayName: 'first-name-3 last-name-3',
            emailAndName: 'fake-admin-3@example.com - first-name-3 last-name-3',
          },
        ]);
      });
    });
  });
});
