'use strict';

describe('Directive: aaRouteToUser', function () {
  var $compile, $rootScope, $scope, $q;
  var AAUiModelService, AutoAttendantCeMenuModelService, UserListService;

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'aa'
    }
  };

  var userListCmiResponse = {
    "totalResults": "2213",
    "itemsPerPage": "10",
    "startIndex": "1",
    "schemas": [
      "urn:scim:schemas:core:1.0",
      "urn:scim:schemas:extension:cisco:commonidentity:1.0"
    ],
    "Resources": [{
      "userName": "dudette@gmail.com",
      "name": {
        "givenName": "some",
        "familyName": "user"
      },
      "entitlements": [
        "ciscouc",
        "squared-call-initiation",
        "spark",
        "webex-squared"
      ],
      "id": "47026507-4F83-0B5B-9C1D-8DBA89F2E01C",
      "meta": {
        "created": "2015-11-16T16:40:54.084Z",
        "lastModified": "2016-01-06T18:06:47.999Z",
        "version": "19382735439",
        "location": "https://identity.webex.com/identity/scim/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/v1/Users/9ba7b358-6795-41d7-8b0a-c07b34d6715b",
        "organizationID": "7e88d491-d6ca-4786-82ed-cbe9efb02ad2"
      },
      "displayName": "some user",
      "active": true,
      "licenseID": [
        "CO_6a0254d2-37b7-4b01-a81b-41cd2cb91a32"
      ],
      "avatarSyncEnabled": false
    }],
    "success": true
  };

  var schedule = 'openHours';
  var index = '0';
  var keyIndex = '0';
  var menuId = 'menu1';

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

  beforeEach(inject(function (_$compile_, _$rootScope_, _$q_, _UserListService_, _AAUiModelService_, _AutoAttendantCeMenuModelService_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
    $scope = _$rootScope_;
    $q = _$q_;

    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    UserListService = _UserListService_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.aaKey = keyIndex;
    $scope.menuId = menuId;

    spyOn(UserListService, 'listUsers').and.returnValue($q.when(userListCmiResponse));

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    AutoAttendantCeMenuModelService.clearCeMenuMap();
    aaUiModel.openHours = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());

  }));

  it('replaces the element with the appropriate content', function () {
    var element = $compile("<aa-route-to-user aa-schedule='openHours' aa-menu-id='menu1' aa-index='0' aa-key-index='0'></aa-route-to-user>")($rootScope);
    $rootScope.$digest();

    expect(element.html()).toContain("aaRouteUser");
  });
});
