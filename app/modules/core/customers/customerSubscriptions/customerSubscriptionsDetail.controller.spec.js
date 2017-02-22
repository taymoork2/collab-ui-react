'use strict';

describe('Controller: customerSubscriptionsDetailCtrl', function () {
  var customerResponseTest, customerAdmins;

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
      'Userservice'
    );

    // closured vars
    customerResponseTest = _.clone(getJSONFixture('core/json/customerSubscriptions/customerResponseTest.json'));
    customerAdmins = {
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

    // spies
    spyOn(this.Auth, 'getCustomerAccount').and.returnValue(this.$q.resolve({ data: customerResponseTest }));
    spyOn(this.CustomerAdministratorService, 'getCustomerAdmins').and.returnValue(this.$q.resolve(customerAdmins));
    spyOn(this.Userservice, 'getPrimaryEmailFromUser').and.returnValue('email@email.net');

    // controller
    this.initController('CustomerSubscriptionsDetailCtrl', {
      controllerLocals: {
        $stateParams: {
          currentCustomer: {},
        },
      },
    });
  });

  afterEach(function () {
    customerResponseTest = customerAdmins = undefined;
  });


  describe('getSubscriptions', function () {
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
      expect(this.controller.partnerAdmins.length).toEqual(2);
      expect(this.controller.partnerAdmins[1].email).toEqual('email@email.net');
    });
    it('has a join array function that can join 1 level nested array', function () {
      var inner = ['inner1', 'inner2'];
      var arr = ['one', 'two', inner, 'three'];
      var result = this.controller._helpers.flattenAndJoin(arr, 'banana');
      expect(result).toEqual('onebananatwobananainner1bananainner2bananathree');
    });
  });
});
