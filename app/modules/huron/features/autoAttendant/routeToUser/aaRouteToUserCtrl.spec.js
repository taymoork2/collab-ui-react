'use strict';

describe('Controller: AARouteToUserCtrl', function () {
  var $controller;
  var AAUiModelService, AutoAttendantCeInfoModelService, AutoAttendantCeMenuModelService, AAModelService, $q, $httpBackend, Authinfo, Config, HuronConfig, Userservice, UserListService, UserServiceVoice;
  var $rootScope, $scope, $translate;

  var aaModel = {

  };

  var aaUiModel = {
    openHours: {},
    ceInfo: {
      name: 'AA2'
    }
  };

  var userCisResponse = {
    "userName": "admin@int1.huron-alpha.com",
    "name": {
      "givenName": "Super",
      "familyName": "Admin"
    },
    "userStatus": "active",
    "id": "47026507-4F83-0B5B-9C1D-8DBA89F2E01C",
    "displayName": "Super Admin",
    "success": true
  };

  var directoryCmiResponse = {
    "firstName": "firstName",
    "middleName": "middleName",
    "lastName": "lastName",
    "nickName": "nickName",
    "userId": "dudette@gmail.com",
    "userName": "dudette@gmail.com",
    "mailId": "dudette@gmail.com",
    "associatedDevices": {
      "associatedDevice": [{
        "uuid": "236f9531-e4ee-42f0-9f52-249480b42927",
        "name": "SEP74A02FC0F752"
      }]
    },
    "primaryDirectoryNumber": {
      "uuid": "51d41da5-31ba-49ce-8540-ea103c33bc49",
      "pattern": "2252",
      "routePartition": {
        "uuid": "cd2002a3-9de4-4a5f-96e3-a74ab658aac9",
        "name": "7e88d491-d6ca-4786-82ed-cbe9efb02ad2_000001_EXT_RP"
      }
    },
    "directoryUri": "",
    "telephoneNumber": "",
    "title": "",
    "mobileNumber": "",
    "homeNumber": "",
    "pagerNumber": "",
    "selfService": "2252",
    "userProfile": null,
    "customer": {
      "uuid": "7e88d491-d6ca-4786-82ed-cbe9efb02ad2",
      "name": "Huron Int Test 1"
    },
    "uuid": "7f86555a-165f-412b-b31e-1cc6b1431bca",
    "url": "https://cmi.huron-int.com/api/v1/voice/customers/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/users/7f86555a-165f-412b-b31e-1cc6b1431bca",
    "links": [{
      "rel": "voice",
      "href": "/api/v1/voice/customers/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/users/7f86555a-165f-412b-b31e-1cc6b1431bca"
    }]
  };

  var noDirectoryCmiResponse = {
    "firstName": "firstName",
    "middleName": "middleName",
    "lastName": "lastName",
    "nickName": "nickName",
    "userId": "dudette@gmail.com",
    "userName": "dudette@gmail.com",
    "mailId": "dudette@gmail.com",
    "associatedDevices": {
      "associatedDevice": [{
        "uuid": "236f9531-e4ee-42f0-9f52-249480b42927",
        "name": "SEP74A02FC0F752"
      }]
    },
    "directoryUri": "",
    "telephoneNumber": "",
    "title": "",
    "mobileNumber": "",
    "homeNumber": "",
    "pagerNumber": "",
    "selfService": "2252",
    "userProfile": null,
    "customer": {
      "uuid": "7e88d491-d6ca-4786-82ed-cbe9efb02ad2",
      "name": "Huron Int Test 1"
    },
    "uuid": "7f86555a-165f-412b-b31e-1cc6b1431bca",
    "url": "https://cmi.huron-int.com/api/v1/voice/customers/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/users/7f86555a-165f-412b-b31e-1cc6b1431bca",
    "links": [{
      "rel": "voice",
      "href": "/api/v1/voice/customers/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/users/7f86555a-165f-412b-b31e-1cc6b1431bca"
    }]
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
    }, {
      "userName": "dude@gmail.com",
      "name": {
        "givenName": "inferior",
        "familyName": "user"
      },
      "entitlements": [
        "ciscouc",
        "squared-call-initiation",
        "spark",
        "webex-squared"
      ],
      "id": "5FCF9B4A-4A44-943B-4A4A-A397974E97D4",
      "meta": {
        "created": "2015-11-16T16:40:54.084Z",
        "lastModified": "2016-01-06T18:06:47.999Z",
        "version": "19382735439",
        "location": "https://identity.webex.com/identity/scim/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/v1/Users/9ba7b358-6795-41d7-8b0a-c07b34d6715b",
        "organizationID": "7e88d491-d6ca-4786-82ed-cbe9efb02ad2"
      },
      "active": true,
      "licenseID": [
        "CO_6a0254d2-37b7-4b01-a81b-41cd2cb91a32"
      ],
      "avatarSyncEnabled": false
    }],
    "success": true
  };

  var listUsersProps = {
    "attributes": "attributes=name,userName,userStatus,entitlements,displayName,photos,roles,active,trainSiteNames,licenseID",
    "filter": "filter=active%20eq%20true%20or%20displayName%20sw%20%22xz%22",
    "startIndex": 0,
    "count": 10,
    "sortBy": "name",
    "sortOrder": "ascending",
  };

  var users = [{
    description: 'some user',
    id: '47026507-4F83-0B5B-9C1D-8DBA89F2E01C'
  }];

  var schedule = 'openHours';
  var index = 0;
  var keyIndex = 0;

  var rawCeInfos = getJSONFixture('huron/json/autoAttendant/callExperiencesWithNumber.json');

  function raw2CeInfos(rawCeInfos) {
    var _ceInfos = [];
    for (var i = 0; i < rawCeInfos.length; i++) {
      var _ceInfo = AutoAttendantCeInfoModelService.newCeInfo();
      for (var j = 0; j < rawCeInfos[i].assignedResources.length; j++) {
        var _resource = AutoAttendantCeInfoModelService.newResource();
        _resource.setId(rawCeInfos[i].assignedResources[j].id);
        _resource.setTrigger(rawCeInfos[i].assignedResources[j].trigger);
        _resource.setType(rawCeInfos[i].assignedResources[j].type);
        _resource.setNumber(rawCeInfos[i].assignedResources[j].number);
        _ceInfo.addResource(_resource);
      }
      _ceInfo.setName(rawCeInfos[i].callExperienceName);
      _ceInfo.setCeUrl(rawCeInfos[i].callExperienceURL);
      _ceInfos[i] = _ceInfo;
    }
    return _ceInfos;
  }

  beforeEach(module('uc.autoattendant'));
  beforeEach(module('Huron'));

  beforeEach(inject(function (_$controller_, _$q_, _$translate_, _$rootScope_, _AAUiModelService_, _AutoAttendantCeInfoModelService_, _AutoAttendantCeMenuModelService_, _AAModelService_, _$httpBackend_, _Authinfo_, _Config_, _HuronConfig_, _Userservice_, _UserListService_, _UserServiceVoice_) {
    $translate = _$translate_;
    $rootScope = _$rootScope_;
    $scope = $rootScope;

    $controller = _$controller_;
    AAModelService = _AAModelService_;
    AAUiModelService = _AAUiModelService_;
    AutoAttendantCeInfoModelService = _AutoAttendantCeInfoModelService_;
    AutoAttendantCeMenuModelService = _AutoAttendantCeMenuModelService_;

    $httpBackend = _$httpBackend_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    Config = _Config_;
    HuronConfig = _HuronConfig_;
    Userservice = _Userservice_;
    UserListService = _UserListService_;
    UserServiceVoice = _UserServiceVoice_;

    $scope.schedule = schedule;
    $scope.index = index;
    $scope.keyIndex = keyIndex;

    spyOn(AAModelService, 'getAAModel').and.returnValue(aaModel);
    aaModel.ceInfos = raw2CeInfos(rawCeInfos);

    spyOn(AAUiModelService, 'getUiModel').and.returnValue(aaUiModel);
    aaUiModel[schedule] = AutoAttendantCeMenuModelService.newCeMenu();
    aaUiModel[schedule].addEntryAt(index, AutoAttendantCeMenuModelService.newCeMenu());

    var listUsersUrl = Config.getScimUrl(Authinfo.getOrgId()) +
      '?' + '&' + listUsersProps.attributes +
      '&' + listUsersProps.filter +
      '&count=' + listUsersProps.count +
      '&sortBy=' + listUsersProps.sortBy +
      '&sortOrder=' + listUsersProps.sortOrder;
    $httpBackend.whenGET(listUsersUrl).respond(200, userListCmiResponse);

    var userCisUrl = Config.getScimUrl(Authinfo.getOrgId()) + '/47026507-4F83-0B5B-9C1D-8DBA89F2E01C';
    $httpBackend.whenGET(userCisUrl).respond(200, userCisResponse);

    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/users/47026507-4F83-0B5B-9C1D-8DBA89F2E01C').respond(200, directoryCmiResponse);
    $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/users/5FCF9B4A-4A44-943B-4A4A-A397974E97D4').respond(200, noDirectoryCmiResponse);

  }));

  describe('AARouteToUser', function () {

    it('should be able to create new user entry', function () {
      var controller = $controller('AARouteToUserCtrl', {
        $scope: $scope
      });

      expect(controller).toBeDefined();
      expect(controller.menuKeyEntry.actions[0].name).toEqual('routeToUser');
      expect(controller.menuKeyEntry.actions[0].value).toEqual('');

    });

    it('should initialize the options list', function () {
      var controller = $controller('AARouteToUserCtrl', {
        $scope: $scope
      });

      var nameNumber = users[0].description.concat(' (')
        .concat('2252').concat(')');

      $httpBackend.flush();

      $scope.$apply();

      expect(controller.users.length).toEqual(2);

      expect(controller.users[0].description).toEqual(nameNumber);

    });

    describe('activate', function () {
      it('should read and display an existing entry', function () {
        var actionEntry = AutoAttendantCeMenuModelService.newCeActionEntry('Some user', '47026507-4F83-0B5B-9C1D-8DBA89F2E01C');

        var menuEntry = AutoAttendantCeMenuModelService.newCeMenuEntry();
        menuEntry.addAction(actionEntry);
        aaUiModel[schedule].entries[0].addEntry(menuEntry);
        var controller = $controller('AARouteToUserCtrl', {
          $scope: $scope
        });

        $httpBackend.flush();

        $scope.$apply();

        expect(controller.userSelected.id).toEqual(users[0].id);
      });
    });

    describe('saveUiModel', function () {
      it('should write UI entry back into UI model', function () {

        var controller = $controller('AARouteToUserCtrl', {
          $scope: $scope
        });

        controller.userSelected = {
          name: "Some user",
          id: "47026507-4F83-0B5B-9C1D-8DBA89F2E01C"
        };
        controller.saveUiModel();

        $scope.$apply();

        expect(controller.menuKeyEntry.actions[0].value).toEqual('47026507-4F83-0B5B-9C1D-8DBA89F2E01C');
      });
    });

  });
});
