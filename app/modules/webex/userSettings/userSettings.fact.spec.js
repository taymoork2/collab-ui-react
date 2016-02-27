'use strict';

xdescribe('WebExUserSettingsFact Test', function () {
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

  var fakeUserInfo = {
    "use_firstName": "undefined",
    "use_lastName": "undefined",
    "use_categoryId": "36",
    "use_webExId": "customerqaprov+160219qaprov41@gmail.com",
    "use_address": {
      "com_addressType": "PERSONAL"
    },
    "use_phones": "",
    "use_email": "customerqaprov+160219qaprov41@gmail.com",
    "use_email2": "customerqaprov+160219qaprov41@gmail.com",
    "use_password": "******",
    "use_personalUrl": "pr1455921804993",
    "use_expirationDate": "12/31/2049 23:59:59",
    "use_commOptions": {
      "use_prodAnnounce": "true",
      "use_trainingInfo": "true",
      "use_electronicInfo": "true",
      "use_promos": "true",
      "use_press": "true",
      "use_email": "true",
      "use_fax": "true",
      "use_phone": "true",
      "use_mail": "true"
    },
    "use_meetingTypes": {
      "use_meetingType": ["16", "214", "216", "232", "233"]
    },
    "use_options": {
      "use_firstNameVisible": "false",
      "use_lastNameVisible": "false",
      "use_addressVisible": "false",
      "use_workPhoneVisible": "false",
      "use_cellPhoneVisible": "false",
      "use_pagerVisible": "false",
      "use_faxVisible": "false",
      "use_officeUrlVisible": "false",
      "use_pictureVisible": "false",
      "use_notifyOnNewMessage": "false",
      "use_notifyOnMeeting": "false",
      "use_followMeEnable": "false",
      "use_emailVisible": "false",
      "use_listInCategory": "false",
      "use_titleVisible": "false",
      "use_folderRead": "false",
      "use_folderWrite": "false",
      "use_messageVisible": "false",
      "use_iconSelect1": "false",
      "use_iconSelect2": "false",
      "use_acceptLinkRequest": "false",
      "use_holdOnLinkRequest": "false",
      "use_notifyOnLinkRequest": "false",
      "use_supportVideo": "false",
      "use_supportApp": "false",
      "use_supportFileShare": "false",
      "use_supportDesktopShare": "false",
      "use_supportMeetingRecord": "false",
      "use_supportAppshareRemote": "false",
      "use_supportWebTourRemote": "false",
      "use_supportDesktopShareRemote": "false",
      "use_subscriptionOffice": "false",
      "use_workPhoneCallback": "false",
      "use_cellPhoneCallback": "false",
      "use_faxCallback": "false",
      "use_pagerCallback": "false"
    },
    "use_timeZoneID": "4",
    "use_timeZone": "GMT-08:00, Pacific (San Jose)",
    "use_timeZoneWithDST": "San Francisco (Pacific Standard Time, GMT-08:00)",
    "use_tracking": "",
    "use_service": "FREE_OFFICE",
    "use_privilege": {
      "use_host": "false",
      "use_teleConfCallOut": "false",
      "use_teleConfCallOutInternational": "false",
      "use_teleConfCallIn": "true",
      "use_teleConfTollFreeCallIn": "true",
      "use_siteAdmin": "true",
      "use_voiceOverIp": "true",
      "use_roSiteAdmin": "false",
      "use_labAdmin": "false",
      "use_otherTelephony": "false",
      "use_teleConfCallInInternational": "false",
      "use_attendeeOnly": "false",
      "use_recordingEditor": "true",
      "use_meetingAssist": "false",
      "use_HQvideo": "true",
      "use_HDvideo": "true",
      "use_isEnableCET": "true",
      "use_isEnablePMR": "true",
      "use_teleCLIAuthEnabled": "false",
      "use_teleCLIPINEnabled": "false"
    },
    "use_language": "ENGLISH",
    "use_locale": "U.S.",
    "use_active": "ACTIVATED",
    "use_defaultCallIn": "",
    "use_supportedServices": {
      "use_meetingCenter": "true",
      "use_trainingCenter": "true",
      "use_supportCenter": "true",
      "use_eventCenter": "true",
      "use_salesCenter": "false"
    },
    "use_myWebEx": {
      "use_isMyWebExPro": "true",
      "use_myContact": "true",
      "use_myProfile": "true",
      "use_myMeetings": "true",
      "use_myFolders": "true",
      "use_trainingRecordings": "true",
      "use_recordedEvents": "true",
      "use_totalStorageSize": "1000",
      "use_myReports": "true",
      "use_myComputer": "0",
      "use_personalMeetingRoom": "true",
      "use_myPartnerLinks": "false",
      "use_myWorkspaces": "false",
      "use_additionalRecordingStorage": "0"
    },
    "use_personalTeleconf": {
      "use_joinBeforeHost": "false"
    },
    "use_videoSystems": "",
    "use_personalMeetingRoom": {
      "use_title": "undefined undefined's Personal Room",
      "use_personalMeetingRoomURL": "https://t30citestprov41.eng.webex.com/meet/pr1455921804993",
      "use_sipURL": "pr1455921804993@t30citestprov41.eng.webex.com",
      "use_accessCode": "705846591",
      "use_hostPIN": "6239",
      "use_applyPMRForInstantMeeting": "true",
      "use_PMRAutoLock": "false",
      "use_PMRAutoLockWaitTime": "0",
      "use_PRNotifications": {
        "use_mode": "EMAIL"
      }
    },
    "use_sessionOptions": {
      "use_defaultSessionType": "216",
      "use_defaultServiceType": "EventCenter",
      "use_autoDeleteAfterMeetingEnd": "true",
      "use_displayQuickStartHost": "true",
      "use_displayQuickStartAttendees": "false"
    },
    "use_supportCenter": {
      "use_orderTabs": {
        "use_tab": ["Tools", "Desktop", "Application", "Session"]
      },
      "use_serviceDesk": {
        "use_enable": "false"
      }
    },
    "use_security": {
      "use_forceChangePassword": "false",
      "use_resetPassword": "false",
      "use_lockAccount": "false"
    },
    "use_languageID": "1",
    "use_webACDPrefs": {
      "use_isAgent": "false",
      "use_isMgr": "false",
      "use_numAgentSessions": "0",
      "use_agentMonitorAllRSQueues": "false",
      "use_managerMonitorAllRSQueues": "false",
      "use_monitorAllRSAgents": "false"
    },
    "use_remoteSupport": {
      "use_sharingView": "FS",
      "use_sharingColor": "16BIT",
      "use_recording": {
        "use_enforce": "false"
      },
      "use_autoRequest": {
        "use_enable": "false"
      },
      "use_defaultClient": {
        "use_type": "SINGLE_SESS",
        "use_singleSessClient": "NEW_CONSL"
      }
    },
    "use_registrationDate": "02/19/2016 14:46:26",
    "use_visitCount": "0",
    "use_userId": "962231095",
    "use_eventCenter": {
      "use_optimizeAttendeeBandwidthUsage": "true"
    },
    "use_passwordExpires": "false",
    "use_passwordDaysLeft": "0"
  }; // fakeUserInfo
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

    spyOn(_Orgservice_, "getValidLicenses").and.returnValue(_$q_.when(fakeOrgLicenses));
  }));

  it('can initialize user settings', inject(function (WebExUserSettingsFact) {
    var userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

    expect(userSettingsModel.meetingCenter.isEntitledOnAtlas).toBeDefined();
    expect(userSettingsModel.trainingCenter.isEntitledOnAtlas).toBeDefined();
    expect(userSettingsModel.eventCenter.isEntitledOnAtlas).toBeDefined();
    expect(userSettingsModel.supportCenter.isEntitledOnAtlas).toBeDefined();

    WebExUserSettingsFact.checkUserWebExEntitlement().then(
      function checkUserWebExEntitlementSuccess() {
        expect(userSettingsModel.meetingCenter.isEntitledOnAtlas).toEqual(false);
        expect(userSettingsModel.trainingCenter.isEntitledOnAtlas).toEqual(false);
        expect(userSettingsModel.eventCenter.isEntitledOnAtlas).toEqual(true);
        expect(userSettingsModel.supportCenter.isEntitledOnAtlas).toEqual(false);
      },

      function checkUserWebExEntitlementError() {
        this.fail();
      }
    );
  }));
});
