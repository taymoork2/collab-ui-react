'use strict';

describe('Controller: HelpdeskController', function () {
  beforeEach(function () {
    this.initModules('Squared');
    this.injectDependencies('$controller',
      '$httpBackend',
      '$q',
      '$scope',
      '$state',
      '$translate',
      'AccessibilityService',
      'Authinfo',
      'Config',
      'HelpdeskService',
      'HelpdeskHuronService',
      'HelpdeskSearchHistoryService',
      'LicenseService',
      'FeatureToggleService');

    this.jsonData = getJSONFixture('squared/json/helpdesk.json');
    this.$httpBackend.whenGET('https://ciscospark.statuspage.io/index.json').respond({});

    this.validSearchString = 'bill gates';
    this.lessThanThreeCharacterSearchString = 'bi';
    this.whatever = 'Whatever';
    this.userSearchResult = _.cloneDeep(this.jsonData.userSearchResult);
    this.orgSearchResult = _.cloneDeep(this.jsonData.orgSearchResult);

    spyOn(this.FeatureToggleService, 'atlasHelpDeskOrderSearchGetStatus').and.returnValue(this.$q.resolve(true));
    spyOn(this.AccessibilityService, 'setFocus');
    spyOn(this.Authinfo, 'isInDelegatedAdministrationOrg').and.returnValue(true);
    spyOn(this.HelpdeskService, 'searchUsers');
    spyOn(this.HelpdeskService, 'searchOrgs');

    this.$element = {
      find: function () {
        return {
          blur: _.noop,
          focus: function () {
            return {
              select: _.noop,
            };
          },
        };
      },
    };

    this.initController = function () {
      this.controller = this.$controller('HelpdeskController', {
        HelpdeskService: this.HelpdeskService,
        $element: this.$element,
        $translate: this.$translate,
        $scope: this.$scope,
        HelpdeskSearchHistoryService: this.HelpdeskSearchHistoryService,
        HelpdeskHuronService: this.HelpdeskHuronService,
        LicenseService: this.LicenseService,
        Config: this.Config,
      });
      this.$scope.$apply();
    };

    this.expectToShowOnlyUserAndOrgsResult = function () {
      expect(this.controller.showUsersResultPane()).toBeTruthy();
      expect(this.controller.showOrgsResultPane()).toBeTruthy();
      expect(this.controller.showDeviceResultPane()).toBeFalsy();
    };
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('user and org searches', function () {
    beforeEach(function () {
      this.orgId = 'e6ac8f0b-6cea-492d-875d-8edf159a844c';
      this.foundation = 'Bill Gates Foundation';

      this.HelpdeskService.searchUsers.and.returnValue(this.$q.resolve(this.userSearchResult));
      this.HelpdeskService.searchOrgs.and.returnValue(this.$q.resolve(this.orgSearchResult));
      spyOn(this.HelpdeskService, 'searchOrders');
      spyOn(this.HelpdeskService, 'findAndResolveOrgsForUserResults').and.returnValue(this.$q.resolve(this.userSearchResult));
      spyOn(this.HelpdeskService, 'searchCloudberryDevices').and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData.cloudberryDevices)));
      spyOn(this.HelpdeskHuronService, 'searchDevices').and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData.huronDevices)));
      spyOn(this.HelpdeskHuronService, 'findDevicesMatchingNumber').and.returnValue(this.$q.resolve([]));
      spyOn(this.HelpdeskService, 'getOrg').and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData.orgLookupResult)));

      spyOn(this.Authinfo, 'getOrgId').and.returnValue(this.orgId);
      spyOn(this.Authinfo, 'getOrgName').and.returnValue(this.foundation);

      this.initController();
      this.controller.initSearchWithoutOrgFilter();
    });

    it('simple search with single hits shows search result for users and orgs', function () {
      expect(this.controller.showUsersResultPane()).toBeFalsy();
      expect(this.controller.showOrgsResultPane()).toBeFalsy();
      expect(this.controller.showDeviceResultPane()).toBeFalsy();

      expect(this.controller.searchingForUsers).toBeFalsy();
      expect(this.controller.searchingForOrgs).toBeFalsy();

      this.controller.searchString = this.validSearchString;
      this.controller.search();

      expect(this.controller.searchingForUsers).toBeTruthy();
      expect(this.controller.searchingForOrgs).toBeTruthy();
      this.$scope.$apply();
      expect(this.controller.searchingForUsers).toBeFalsy();
      expect(this.controller.searchingForOrgs).toBeFalsy();
      expect(this.controller.currentSearch.userSearchResults[0].displayName.toLowerCase()).toEqual(this.validSearchString);
      expect(this.controller.currentSearch.orgSearchResults[0].displayName).toEqual(this.foundation);

      this.expectToShowOnlyUserAndOrgsResult();
    });

    it('only a search within org searches for devices and shows device result (cloudberry only)', function () {
      this.controller.initSearchWithoutOrgFilter();
      expect(this.controller.showDeviceResultPane()).toBeFalsy();
      this.controller.searchString = this.whatever;
      this.controller.search();
      expect(this.controller.searchingForDevices).toBeFalsy();
      expect(this.controller.showDeviceResultPane()).toBeFalsy();

      this.$scope.$apply();
      expect(this.controller.searchingForDevices).toBeFalsy();
      expect(this.controller.showDeviceResultPane()).toBeFalsy();

      this.controller.initSearchWithOrgFilter({
        id: this.orgId,
      });
      expect(this.controller.lookingUpOrgFilter).toBeTruthy();
      this.$scope.$apply();
      expect(this.controller.lookingUpOrgFilter).toBeFalsy();
      expect(this.controller.showDeviceResultPane()).toBeFalsy();
      this.controller.searchString = this.whatever;
      this.controller.search();
      expect(this.controller.searchingForDevices).toBeTruthy();
      expect(this.controller.showDeviceResultPane()).toBeTruthy();

      this.$scope.$apply();
      expect(this.controller.searchingForDevices).toBeFalsy();
      expect(this.controller.showDeviceResultPane()).toBeTruthy();
      expect(this.controller.currentSearch.orgFilter.id).toEqual(this.orgId);
      expect(this.controller.currentSearch.deviceSearchResults.length).toEqual(2);
    });

    it('search within org searches for devices should mix cloudberry and huron devices', function () {
      this.HelpdeskService.getOrg.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData.orgLookupResult2)));

      this.controller.initSearchWithOrgFilter({
        id: this.orgId,
      });
      expect(this.controller.lookingUpOrgFilter).toBeTruthy();
      this.$scope.$apply();
      expect(this.controller.lookingUpOrgFilter).toBeFalsy();
      expect(this.controller.showDeviceResultPane()).toBeFalsy();
      this.controller.searchString = this.whatever;
      this.controller.search();
      expect(this.controller.searchingForDevices).toBeTruthy();
      expect(this.controller.showDeviceResultPane()).toBeTruthy();

      this.$scope.$apply();
      expect(this.controller.searchingForDevices).toBeFalsy();
      expect(this.controller.showDeviceResultPane()).toBeTruthy();
      expect(this.controller.currentSearch.orgFilter.id).toEqual(this.orgId);
      expect(this.controller.currentSearch.deviceSearchResults.length).toEqual(4);
    });

    it('simple search with less than three characters shows search failure directly', function () {
      this.controller.searchString = this.lessThanThreeCharacterSearchString;
      this.controller.search();
      expect(this.controller.searchingForUsers).toBeFalsy();
      expect(this.controller.searchingForOrgs).toBeFalsy();

      expect(this.controller.showUsersResultPane()).toBeTruthy();
      expect(this.controller.showOrgsResultPane()).toBeTruthy();
      expect(this.controller.showDeviceResultPane()).toBeFalsy();

      expect(this.controller.currentSearch.userSearchFailure).toEqual('helpdesk.badUserSearchInput');
      expect(this.controller.currentSearch.orgSearchFailure).toEqual('helpdesk.badOrgSearchInput');

      this.expectToShowOnlyUserAndOrgsResult();
    });

    it('multiple search results are shown', function () {
      var createUserMockData = function (name, orgId) {
        return {
          active: true,
          id: 'dcba4321_' + name,
          organization: {
            id: orgId,
          },
          userName: name,
          displayName: name.replace('.', ' '),
        };
      };

      var createOrgMockData = function (name, orgId) {
        return {
          id: orgId,
          displayName: name,
          isPartner: false,
          isTestOrg: false,
        };
      };

      this.userSearchResult.push(createUserMockData('bill.gate', '11ac8f0b-6cea-492d-875d-8edf159a844c'));
      this.userSearchResult.push(createUserMockData('bill.gator', '22ac8f0b-6cea-492d-875d-8edf159a844c'));
      this.userSearchResult.push(createUserMockData('bill.gattar', '33ac8f0b-6cea-492d-875d-8edf159a844c'));
      this.userSearchResult.push(createUserMockData('bil.gattes', '44ac8f0b-6cea-492d-875d-8edf159a844c'));

      this.orgSearchResult.push(createOrgMockData('Bill Gate Foundation', '11ac8f0b-6cea-492d-875d-8edf159a844c'));
      this.orgSearchResult.push(createOrgMockData('Bill Gator Foundation', '22ac8f0b-6cea-492d-875d-8edf159a844c'));
      this.orgSearchResult.push(createOrgMockData('Bill Gat Healthcare', '66ac8f0b-6cea-492d-875d-8edf159a844c'));
      this.controller.searchString = this.validSearchString;
      this.controller.search();

      expect(this.controller.searchingForUsers).toBeTruthy();
      expect(this.controller.searchingForOrgs).toBeTruthy();
      this.$scope.$apply();
      expect(this.controller.searchingForUsers).toBeFalsy();
      expect(this.controller.searchingForOrgs).toBeFalsy();

      expect(this.controller.currentSearch.userSearchResults.length).toEqual(5);
      expect(this.controller.currentSearch.orgSearchResults.length).toEqual(4);
    });

    it('customer help desk gets the orgFiltered search set', function () {
      this.Authinfo.isInDelegatedAdministrationOrg.and.returnValue(false);
      this.initController();

      expect(this.controller.isCustomerHelpDesk).toBeTruthy();
      expect(this.controller.currentSearch.orgFilter.id).toEqual(this.orgId);
      expect(this.controller.currentSearch.orgFilter.displayName).toEqual(this.foundation);

      this.controller.searchString = this.whatever;
      this.controller.search();
      expect(this.controller.searchingForUsers).toBeTruthy();
      expect(this.controller.searchingForOrgs).toBeFalsy();
    });

    it('simple search with single hit shows search result for order', function () {
      this.HelpdeskService.searchOrders.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData.orderSearchResult)));
      this.controller.isOrderSearchEnabled = true;

      expect(this.controller.showOrdersResultPane()).toBeFalsy();
      expect(this.controller.searchingForOrders).toBeFalsy();
      this.controller.searchString = '67891234';
      this.controller.search();
      this.$scope.$apply();
      expect(this.controller.searchingForOrders).toBeFalsy();
      expect(this.controller.currentSearch.orderSearchResults[0].externalOrderId).toEqual('67891234');
    });

    it('simple search with multiple hits shows only latest for each subscriptionId', function () {
      this.HelpdeskService.searchOrders.and.returnValue(this.$q.resolve(_.cloneDeep(this.jsonData.orderSearchMultiResults)));
      this.controller.isOrderSearchEnabled = true;
      this.controller.searchString = '67891234';
      this.controller.search();
      this.$scope.$apply();
      expect(this.controller.currentSearch.orderSearchResults.length).toBe(2);
      expect(this.controller.currentSearch.orderSearchResults[0].lastModified).toBe('2017-09-19T22:58:28.959Z');
      expect(this.controller.currentSearch.orderSearchResults[0].serviceId).toBe('Atlas_Test-testSearch002-dummy-sub');
      expect(this.controller.currentSearch.orderSearchResults[1].serviceId).toBe('Atlas_Test-testSearch002-dummy-sub2');
      expect(this.controller.currentSearch.orderSearchResults[1].lastModified).toBe('2017-08-24T22:58:28.959Z');
    });
  });

  describe('backend http error', function () {
    it('400 gives badUserSearchInput message', function () {
      this.HelpdeskService.searchUsers.and.returnValue(this.$q.reject({ status: 400 }));
      this.HelpdeskService.searchOrgs.and.returnValue(this.$q.reject({ status: 400 }));
      this.initController();

      this.controller.searchString = this.validSearchString;
      this.controller.search();
      expect(this.controller.searchingForUsers).toBeTruthy();
      expect(this.controller.searchingForOrgs).toBeTruthy();
      this.$scope.$apply();
      expect(this.controller.currentSearch.userSearchFailure).toEqual('helpdesk.badUserSearchInput');
      expect(this.controller.searchingForUsers).toBeFalsy();
      expect(this.controller.searchingForOrgs).toBeFalsy();
      this.expectToShowOnlyUserAndOrgsResult();
    });

    it('error codes other that 400 gives unexpectedError message', function () {
      this.HelpdeskService.searchUsers.and.returnValue(this.$q.reject({ status: 401 }));
      this.HelpdeskService.searchOrgs.and.returnValue(this.$q.reject({ status: 401 }));
      this.initController();

      this.controller.searchString = this.validSearchString;
      this.controller.search();
      expect(this.controller.searchingForUsers).toBeTruthy();
      expect(this.controller.searchingForOrgs).toBeTruthy();
      this.$scope.$apply();
      expect(this.controller.currentSearch.userSearchFailure).toEqual('helpdesk.unexpectedError');
      expect(this.controller.searchingForUsers).toBeFalsy();
      expect(this.controller.searchingForOrgs).toBeFalsy();
      this.expectToShowOnlyUserAndOrgsResult();
    });
  });
});
