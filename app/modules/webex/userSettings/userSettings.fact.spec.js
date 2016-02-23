'use strict';

describe('WebExUserSettingsFact Test', function () {
  // var deferredOrgLicenses;

  var fakeStateParams = {
    "currentUser": {
      "schemas": ["urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0"],
      "userName": "wesleyzhu7+78695@gmail.com",
      "emails": [{
        "primary": true,
        "type": "work",
        "value": "wesleyzhu7+78695@gmail.com"
      }],
      "entitlements": ["cloudmeetings", "squared-call-initiation", "spark", "webex-squared"],
      "id": "9eba1b0d-176c-43ac-a22c-2232a74e9e5e",
      "meta": {
        "created": "2016-02-08T23:22:04.789Z",
        "lastModified": "2016-02-08T23:30:14.853Z",
        "version": "29814623198",
        "location": "https://identity.webex.com/identity/scim/7a9204db-af2d-4fb1-bf84-6576800da161/v1/Users/9eba1b0d-176c-43ac-a22c-2232a74e9e5e",
        "organizationID": "7a9204db-af2d-4fb1-bf84-6576800da161"
      },
      "displayName": "wesleyzhu7+78695@gmail.com",
      "active": true,
      "licenseID": [
        "EC_4c6e5366-2e44-4886-9b91-f2d2c90ebcff_200_t30citestprov13.webex.com",
        "MC_61d4e4eb-ecbc-4bac-8f6b-b8030128e1b7_200_junk.webex.com",
        "CMR_aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa_10_t30citestprov13.webex.com",
      ],
      "trainSiteNames": ["t30citestprov13.webex.com"],
      "avatarSyncEnabled": false
    },
    "site": "t30citestprov13.webex.com"
  }; // fakeStateParams

  var fakeOrgLicenses = [{
    "licenseId": "MS_3e3cd067-4cee-4a89-9941-0c4ae920ebe6",
    "licenseType": "MESSAGING",
    "volume": 10,
    "usage": 0
  }, {
    "licenseId": "ST_9d89488a-6017-4d21-945f-111df325585e_5",
    "licenseType": "STORAGE",
    "volume": 0,
    "capacity": 5,
    "usage": 0
  }, {
    "licenseId": "CMR_d5736761-df83-42e5-bbf3-e8d6dab71e36_10_t30citestprov13.webex.com",
    "licenseType": "CMR",
    "volume": 10,
    "capacity": 10,
    "usage": 3
  }, {
    "licenseId": "EC_4c6e5366-2e44-4886-9b91-f2d2c90ebcff_200_t30citestprov13.webex.com",
    "licenseType": "CONFERENCING",
    "volume": 200,
    "capacity": 200,
    "usage": 6
  }, {
    "licenseId": "MC_61d4e4eb-ecbc-4bac-8f6b-b8030128e1b7_200_t30citestprov13.webex.com",
    "licenseType": "CONFERENCING",
    "volume": 200,
    "capacity": 200,
    "usage": 5
  }, {
    "licenseId": "CF_437a6b1d-f049-4583-aa16-acab6a0583c8_10",
    "licenseType": "CONFERENCING",
    "volume": 5,
    "capacity": 10,
    "usage": 0
  }]; // fakeOrgLicenses

  beforeEach(module('WebExApp'));

  beforeEach(module(function ($provide) {
    $provide.value('$stateParams', fakeStateParams);
  }));

  beforeEach(inject(function (
    _$q_,
    _Orgservice_
  ) {

    // deferredOrgLicenses = _$q_.defer();
    // spyOn(_Orgservice_, "getValidLicenses").and.returnValue(deferredOrgLicenses.promise);

    spyOn(_Orgservice_, "getValidLicenses").and.returnValue(_$q_.when(fakeOrgLicenses));
  }));

  it('can initialize user settings', inject(function (WebExUserSettingsFact) {
    var userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

    expect(userSettingsModel.meetingCenter.userHasLicense).toBeDefined();
    expect(userSettingsModel.trainingCenter.userHasLicense).toBeDefined();
    expect(userSettingsModel.eventCenter.userHasLicense).toBeDefined();
    expect(userSettingsModel.supportCenter.userHasLicense).toBeDefined();
    expect(userSettingsModel.cmr.userHasLicense).toBeDefined();

    WebExUserSettingsFact.checkUserWebExEntitlement().then(
      function checkUserWebExEntitlementSuccess() {
        expect(userSettingsModel.meetingCenter.userHasLicense).toEqual(false);
        expect(userSettingsModel.trainingCenter.userHasLicense).toEqual(false);
        expect(userSettingsModel.eventCenter.userHasLicense).toEqual(true);
        expect(userSettingsModel.supportCenter.userHasLicense).toEqual(false);
        expect(userSettingsModel.cmr.userHasLicense).toEqual(false);
      },

      function checkUserWebExEntitlementError() {
        this.fail();
      }
    );

    // deferredOrgLicenses.resolve(fakeOrgLicenses);
  }));
});
