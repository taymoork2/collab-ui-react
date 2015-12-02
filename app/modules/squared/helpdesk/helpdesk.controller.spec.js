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

  var validSearchString = "bill gates";
  var lessThanThreeCharacterSearchString = "bi";

  beforeEach(inject(function ($translateProvider, _$translate_, $httpBackend, _$rootScope_, _HelpdeskService_, _$controller_, _$q_) {
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
      var deferredUserResult = q.defer();
      deferredUserResult.resolve(userSearchResult);
      HelpdeskService.searchUsers.returns(deferredUserResult.promise);

      sinon.stub(HelpdeskService, 'searchOrgs');
      sinon.stub(HelpdeskService, 'getOrgDisplayName');
      var deferredOrgResult = q.defer();
      deferredOrgResult.resolve(orgSearchResult);
      HelpdeskService.searchOrgs.returns(deferredOrgResult.promise);
      HelpdeskService.getOrgDisplayName.returns(deferredOrgResult.promise);

      controller = $controller('HelpdeskController', {
        HelpdeskService: HelpdeskService,
        $translate: $translate,
        $scope: $scope
      });

      controller.setOrgFilter(null);

    });

    it('simple search with single hits', function () {
      controller.searchString = "bill gates";
      controller.search();
      expect(controller.searchingForUsers).toBeTruthy();
      expect(controller.searchingForOrgs).toBeTruthy();
      $scope.$apply();
      expect(controller.searchingForUsers).toBeFalsy();
      expect(controller.searchingForOrgs).toBeFalsy();
      expect(controller.currentSearch.userSearchResults[0].displayName).toEqual("Bill Gates");
      expect(controller.currentSearch.userSearchResults[0].organization.displayName[0].displayName).toEqual("Bill Gates Foundation");
      expect(controller.currentSearch.orgSearchResults[0].displayName).toEqual("Bill Gates Foundation");
    });

    it('simple search with less than three characters gives search failure directly', function () {
      controller.searchString = lessThanThreeCharacterSearchString;
      controller.search();
      expect(controller.searchingForUsers).toBeFalsy();
      expect(controller.searchingForOrgs).toBeFalsy();
      expect(controller.currentSearch.userSearchFailure).toEqual("helpdesk.badUserSearchInput");
      expect(controller.currentSearch.orgSearchFailure).toEqual("helpdesk.badOrgSearchInput");
    });

    it('multiple search results', function () {
      userSearchResult.push(createUserMockData("bill.gate", "11ac8f0b-6cea-492d-875d-8edf159a844c"));
      userSearchResult.push(createUserMockData("bill.gator", "22ac8f0b-6cea-492d-875d-8edf159a844c"));
      userSearchResult.push(createUserMockData("bill.gattar", "33ac8f0b-6cea-492d-875d-8edf159a844c"));
      userSearchResult.push(createUserMockData("bil.gattes", "44ac8f0b-6cea-492d-875d-8edf159a844c"));

      orgSearchResult.push(createOrgMockData("Bill Gate Foundation", "11ac8f0b-6cea-492d-875d-8edf159a844c"));
      orgSearchResult.push(createOrgMockData("Bill Gator Foundation", "22ac8f0b-6cea-492d-875d-8edf159a844c"));
      orgSearchResult.push(createOrgMockData("Bill Gat Helthcare", "66ac8f0b-6cea-492d-875d-8edf159a844c"));
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

    });

  });

});
