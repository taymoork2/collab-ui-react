'use strict';
describe('Controller: HelpdeskController', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var HelpdeskService, $controller, q, $translate, $scope, httpBackend, controller;

  var createUserMockData = function (name, orgId) {
    return {
      "active": true,
      "id": "dcba4321_" + name,
      "organization": {
        id: orgId
      },
      "userName": name,
      "displayName": name.replace(".", " ")
    };
  };

  var createOrgMockData = function (name, orgId) {
    return {
      "id": orgId,
      "displayName": name,
      "isPartner": false,
      "isTestOrg": false
    };
  };

  var expectToShowOnlyUserAndOrgsResult = function () {
    expect(controller.showUsersResultPane()).toBeTruthy();
    expect(controller.showOrgsResultPane()).toBeTruthy();
    expect(controller.showDeviceResultPane()).toBeFalsy();
  };

  var validSearchString = "bill gates";
  var lessThanThreeCharacterSearchString = "bi";

  beforeEach(inject(function (_$translate_, $httpBackend, _$rootScope_, _HelpdeskService_, _$controller_, _$q_) {
    HelpdeskService = _HelpdeskService_;
    q = _$q_;
    $scope = _$rootScope_.$new();
    $controller = _$controller_;
    httpBackend = $httpBackend;
    $translate = _$translate_;

    httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});
  }));

  afterEach(function () {
    httpBackend.flush();
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe("user and org searches", function () {

    var userSearchResult = [{
      "active": true,
      "id": "ddb4dd78-26a2-45a2-8ad8-4c181c5b3f0a",
      "organization": {
        id: "e6ac8f0b-6cea-492d-875d-8edf159a844c"
      },
      "userName": "bill.gates",
      "displayName": "Bill Gates",
      "phoneNumbers": [{
        "type": "work",
        "value": "+47 67 51 14 67"
      }, {
        "type": "mobile",
        "value": "+47 92 01 30 30"
      }],
      "url": "whatever.com"
    }];

    var orgSearchResult = [{
      "url": "https://atlas-integration.wbx2.com/admin/api/v1/helpdesk/organizations/e6ac8f0b-6cea-492d-875d-8edf159a844c",
      "id": "e6ac8f0b-6cea-492d-875d-8edf159a844c",
      "displayName": "Bill Gates Foundation",
      "isPartner": false,
      "isTestOrg": false
    }];

    beforeEach(function () {
      sinon.stub(HelpdeskService, 'searchUsers');
      sinon.stub(HelpdeskService, 'searchOrgs');
      sinon.stub(HelpdeskService, 'searchCloudberryDevices');
      sinon.stub(HelpdeskService, 'findAndResolveOrgsForUserResults');

      var deferredUserResult = q.defer();
      deferredUserResult.resolve(userSearchResult);
      HelpdeskService.searchUsers.returns(deferredUserResult.promise);

      var deferredOrgsResult = q.defer();
      deferredOrgsResult.resolve(orgSearchResult);
      HelpdeskService.searchOrgs.returns(deferredOrgsResult.promise);

      var deferredDeviceResult = q.defer();
      deferredDeviceResult.resolve([{}]);
      HelpdeskService.searchCloudberryDevices.returns(deferredDeviceResult.promise);

      HelpdeskService.findAndResolveOrgsForUserResults.returns(deferredUserResult.promise);

      controller = $controller('HelpdeskController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope
      });

      controller.initSearchWithoutOrgFilter();

    });

    it('simple search with single hits shows search result for users and orgs', function () {

      expect(controller.showUsersResultPane()).toBeFalsy();
      expect(controller.showOrgsResultPane()).toBeFalsy();
      expect(controller.showDeviceResultPane()).toBeFalsy();

      expect(controller.searchingForUsers).toBeFalsy();
      expect(controller.searchingForOrgs).toBeFalsy();

      controller.searchString = "bill gates";
      controller.search();

      expect(controller.searchingForUsers).toBeTruthy();
      expect(controller.searchingForOrgs).toBeTruthy();
      $scope.$apply();
      expect(controller.searchingForUsers).toBeFalsy();
      expect(controller.searchingForOrgs).toBeFalsy();
      expect(controller.currentSearch.userSearchResults[0].displayName).toEqual("Bill Gates");
      expect(controller.currentSearch.orgSearchResults[0].displayName).toEqual("Bill Gates Foundation");

      expectToShowOnlyUserAndOrgsResult();
    });

    it('only a search within org searches for devices and shows device result', function () {
      controller.initSearchWithoutOrgFilter();
      expect(controller.showDeviceResultPane()).toBeFalsy();
      controller.searchString = "Whatever";
      controller.search();
      expect(controller.searchingForDevices).toBeFalsy();
      expect(controller.showDeviceResultPane()).toBeFalsy();

      $scope.$apply();
      expect(controller.searchingForDevices).toBeFalsy();
      expect(controller.showDeviceResultPane()).toBeFalsy();

      controller.initSearchWithOrgFilter({
        "id": "1276387"
      });

      expect(controller.showDeviceResultPane()).toBeFalsy();
      controller.searchString = "Whatever";
      controller.search();
      expect(controller.searchingForDevices).toBeTruthy();
      expect(controller.showDeviceResultPane()).toBeTruthy();

      $scope.$apply();
      expect(controller.searchingForDevices).toBeFalsy();
      expect(controller.showDeviceResultPane()).toBeTruthy();
      expect(controller.currentSearch.orgFilter.id).toEqual("1276387");
    });

    it('simple search with less than three characters shows search failure directly', function () {
      controller.searchString = lessThanThreeCharacterSearchString;
      controller.search();
      expect(controller.searchingForUsers).toBeFalsy();
      expect(controller.searchingForOrgs).toBeFalsy();

      expect(controller.showUsersResultPane()).toBeTruthy();
      expect(controller.showOrgsResultPane()).toBeTruthy();
      expect(controller.showDeviceResultPane()).toBeFalsy();

      expect(controller.currentSearch.userSearchFailure).toEqual("helpdesk.badUserSearchInput");
      expect(controller.currentSearch.orgSearchFailure).toEqual("helpdesk.badOrgSearchInput");

      expectToShowOnlyUserAndOrgsResult();
    });

    it('multiple search results are shown', function () {
      userSearchResult.push(createUserMockData("bill.gate", "11ac8f0b-6cea-492d-875d-8edf159a844c"));
      userSearchResult.push(createUserMockData("bill.gator", "22ac8f0b-6cea-492d-875d-8edf159a844c"));
      userSearchResult.push(createUserMockData("bill.gattar", "33ac8f0b-6cea-492d-875d-8edf159a844c"));
      userSearchResult.push(createUserMockData("bil.gattes", "44ac8f0b-6cea-492d-875d-8edf159a844c"));

      orgSearchResult.push(createOrgMockData("Bill Gate Foundation", "11ac8f0b-6cea-492d-875d-8edf159a844c"));
      orgSearchResult.push(createOrgMockData("Bill Gator Foundation", "22ac8f0b-6cea-492d-875d-8edf159a844c"));
      orgSearchResult.push(createOrgMockData("Bill Gat Healthcare", "66ac8f0b-6cea-492d-875d-8edf159a844c"));
      controller.searchString = validSearchString;
      controller.search();

      expect(controller.searchingForUsers).toBeTruthy();
      expect(controller.searchingForOrgs).toBeTruthy();
      $scope.$apply();
      expect(controller.searchingForUsers).toBeFalsy();
      expect(controller.searchingForOrgs).toBeFalsy();

      expect(controller.currentSearch.userSearchResults.length).toEqual(5);
      expect(controller.currentSearch.orgSearchResults.length).toEqual(4);
    });
  });

  describe("backend http error", function () {

    it('400 gives badUserSearchInput message', function () {
      sinon.stub(HelpdeskService, 'searchUsers');
      sinon.stub(HelpdeskService, 'searchOrgs');
      var deferred = q.defer();
      deferred.reject({
        "status": 400
      });
      HelpdeskService.searchUsers.returns(deferred.promise);
      HelpdeskService.searchOrgs.returns(deferred.promise);

      controller = $controller('HelpdeskController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope
      });

      controller.searchString = validSearchString;
      controller.search();
      expect(controller.searchingForUsers).toBeTruthy();
      expect(controller.searchingForOrgs).toBeTruthy();
      $scope.$apply();
      expect(controller.currentSearch.userSearchFailure).toEqual("helpdesk.badUserSearchInput");
      expect(controller.searchingForUsers).toBeFalsy();
      expect(controller.searchingForOrgs).toBeFalsy();
      expectToShowOnlyUserAndOrgsResult();
    });

    it('error codes other that 400 gives unexpectedError message', function () {
      sinon.stub(HelpdeskService, 'searchUsers');
      sinon.stub(HelpdeskService, 'searchOrgs');

      var deferred = q.defer();
      deferred.reject({
        "status": 401
      });
      HelpdeskService.searchUsers.returns(deferred.promise);
      HelpdeskService.searchOrgs.returns(deferred.promise);

      controller = $controller('HelpdeskController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope
      });

      controller.searchString = validSearchString;
      controller.search();
      expect(controller.searchingForUsers).toBeTruthy();
      expect(controller.searchingForOrgs).toBeTruthy();
      $scope.$apply();
      expect(controller.currentSearch.userSearchFailure).toEqual("helpdesk.unexpectedError");
      expect(controller.searchingForUsers).toBeFalsy();
      expect(controller.searchingForOrgs).toBeFalsy();
      expectToShowOnlyUserAndOrgsResult();
    });

  });

});
