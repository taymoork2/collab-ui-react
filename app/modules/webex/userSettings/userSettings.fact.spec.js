'use strict';

describe('WebExUserSettingsFact multi-center licenses tests', function () {
  var $q;
  var $rootScope;

  var deferredOrgLicenses;
  var deferredWebExSessionTicket;
  var deferredWebExSiteVersionXml;
  var deferredWebExUserInfoXml;
  var deferredWebExSiteInfoXml;
  var deferredWebExMeetingTypeInfoXml;

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
        "MC_61d4e4eb-ecbc-4bac-8f6b-b8030128e1b7_200_t30citestprov13.webex.com",
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

  var fakeWebExSessionTicket = "fakeWebExSessionTicket";
  var fakeWebExSiteVersionXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ep="http://www.webex.com/schemas/2002/06/service/ep" xmlns:meet="http://www.webex.com/schemas/2002/06/service/meeting"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContentxsi:type="ep:getAPIVersionResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ep:apiVersion>WebEx XML API V10.0.0</ep:apiVersion><ep:release>EP1</ep:release><ep:trainReleaseVersion>T31L</ep:trainReleaseVersion><ep:trainReleaseOrder>400</ep:trainReleaseOrder></serv:bodyContent></serv:body></serv:message>';
  var fakeWebExUserInfoXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:use="http://www.webex.com/schemas/2002/06/service/user"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="use:getUserResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><use:firstName>undefined</use:firstName><use:lastName>undefined</use:lastName><use:categoryId>36</use:categoryId><use:webExId>wesleyzhu7+78695@gmail.com</use:webExId><use:address><com:addressType>PERSONAL</com:addressType></use:address><use:phones><use:PIN></use:PIN></use:phones><use:email>wesleyzhu7+78695@gmail.com</use:email><use:password>******</use:password><use:personalUrl>pr1454974599154</use:personalUrl><use:expirationDate>12/31/2049 23:59:59</use:expirationDate><use:commOptions><use:prodAnnounce>true</use:prodAnnounce><use:trainingInfo>true</use:trainingInfo><use:electronicInfo>true</use:electronicInfo><use:promos>true</use:promos><use:press>true</use:press><use:email>true</use:email><use:fax>true</use:fax><use:phone>true</use:phone><use:mail>true</use:mail></use:commOptions><use:meetingTypes><use:meetingType>214</use:meetingType><use:meetingType>216</use:meetingType></use:meetingTypes><use:options><use:firstNameVisible>false</use:firstNameVisible><use:lastNameVisible>false</use:lastNameVisible><use:addressVisible>false</use:addressVisible><use:workPhoneVisible>false</use:workPhoneVisible><use:cellPhoneVisible>false</use:cellPhoneVisible><use:pagerVisible>false</use:pagerVisible><use:faxVisible>false</use:faxVisible><use:officeUrlVisible>false</use:officeUrlVisible><use:pictureVisible>false</use:pictureVisible><use:notifyOnNewMessage>false</use:notifyOnNewMessage><use:notifyOnMeeting>false</use:notifyOnMeeting><use:followMeEnable>false</use:followMeEnable><use:emailVisible>false</use:emailVisible><use:listInCategory>false</use:listInCategory><use:titleVisible>false</use:titleVisible><use:folderRead>false</use:folderRead><use:folderWrite>false</use:folderWrite><use:messageVisible>false</use:messageVisible><use:iconSelect1>false</use:iconSelect1><use:iconSelect2>false</use:iconSelect2><use:acceptLinkRequest>false</use:acceptLinkRequest><use:holdOnLinkRequest>false</use:holdOnLinkRequest><use:notifyOnLinkRequest>false</use:notifyOnLinkRequest><use:supportVideo>false</use:supportVideo><use:supportApp>false</use:supportApp><use:supportFileShare>false</use:supportFileShare><use:supportDesktopShare>false</use:supportDesktopShare><use:supportMeetingRecord>false</use:supportMeetingRecord><use:supportAppshareRemote>false</use:supportAppshareRemote><use:supportWebTourRemote>false</use:supportWebTourRemote><use:supportDesktopShareRemote>false</use:supportDesktopShareRemote><use:subscriptionOffice>false</use:subscriptionOffice><use:workPhoneCallback>false</use:workPhoneCallback><use:cellPhoneCallback>false</use:cellPhoneCallback><use:faxCallback>false</use:faxCallback><use:pagerCallback>false</use:pagerCallback></use:options><use:timeZoneID>4</use:timeZoneID><use:timeZone>GMT-08:00, Pacific (San Jose)</use:timeZone><use:timeZoneWithDST>San Francisco (Pacific Standard Time, GMT-08:00)</use:timeZoneWithDST><use:tracking/><use:service>FREE_OFFICE</use:service><use:privilege><use:host>true</use:host><use:teleConfCallOut>true</use:teleConfCallOut><use:teleConfCallOutInternational>true</use:teleConfCallOutInternational><use:teleConfCallIn>true</use:teleConfCallIn><use:teleConfTollFreeCallIn>true</use:teleConfTollFreeCallIn><use:siteAdmin>false</use:siteAdmin><use:voiceOverIp>true</use:voiceOverIp><use:roSiteAdmin>false</use:roSiteAdmin><use:labAdmin>false</use:labAdmin><use:otherTelephony>false</use:otherTelephony><use:teleConfCallInInternational>true</use:teleConfCallInInternational><use:attendeeOnly>false</use:attendeeOnly><use:recordingEditor>true</use:recordingEditor><use:meetingAssist>false</use:meetingAssist><use:HQvideo>true</use:HQvideo><use:HDvideo>true</use:HDvideo><use:isEnableCET>true</use:isEnableCET><use:isEnablePMR>true</use:isEnablePMR><use:teleCLIAuthEnabled>false</use:teleCLIAuthEnabled><use:teleCLIPINEnabled>false</use:teleCLIPINEnabled></use:privilege><use:language>ENGLISH</use:language><use:locale>U.S.</use:locale><use:active>ACTIVATED</use:active><use:defaultCallIn/><use:supportedServices><use:meetingCenter>true</use:meetingCenter><use:trainingCenter>false</use:trainingCenter><use:supportCenter>false</use:supportCenter><use:eventCenter>true</use:eventCenter><use:salesCenter>false</use:salesCenter></use:supportedServices><use:myWebEx><use:isMyWebExPro>true</use:isMyWebExPro><use:myContact>true</use:myContact><use:myProfile>true</use:myProfile><use:myMeetings>true</use:myMeetings><use:myFolders>true</use:myFolders><use:trainingRecordings>true</use:trainingRecordings><use:recordedEvents>true</use:recordedEvents><use:totalStorageSize>1000</use:totalStorageSize><use:myReports>true</use:myReports><use:myComputer>0</use:myComputer><use:personalMeetingRoom>true</use:personalMeetingRoom><use:myPartnerLinks>false</use:myPartnerLinks><use:myWorkspaces>false</use:myWorkspaces><use:additionalRecordingStorage>0</use:additionalRecordingStorage></use:myWebEx><use:personalTeleconf><use:joinBeforeHost>false</use:joinBeforeHost></use:personalTeleconf><use:videoSystems/><use:personalMeetingRoom><use:title>undefined undefined\'s Personal Room</use:title><use:personalMeetingRoomURL>https://t30citestprov13.eng.webex.com/meet/pr1454974599154</use:personalMeetingRoomURL><use:sipURL>pr1454974599154@t30citestprov13.eng.webex.com</use:sipURL><use:accessCode>708031110</use:accessCode><use:hostPIN>6514</use:hostPIN><use:applyPMRForInstantMeeting>true</use:applyPMRForInstantMeeting><use:PMRAutoLock>false</use:PMRAutoLock><use:PMRAutoLockWaitTime>0</use:PMRAutoLockWaitTime><use:PRNotifications><use:mode>EMAIL</use:mode></use:PRNotifications></use:personalMeetingRoom><use:sessionOptions><use:defaultSessionType>216</use:defaultSessionType><use:defaultServiceType>EventCenter</use:defaultServiceType><use:autoDeleteAfterMeetingEnd>true</use:autoDeleteAfterMeetingEnd><use:displayQuickStartHost>true</use:displayQuickStartHost><use:displayQuickStartAttendees>false</use:displayQuickStartAttendees></use:sessionOptions><use:supportCenter><use:serviceDesk><use:enable>false</use:enable></use:serviceDesk></use:supportCenter><use:security><use:forceChangePassword>false</use:forceChangePassword><use:resetPassword>false</use:resetPassword><use:lockAccount>false</use:lockAccount></use:security><use:languageID>1</use:languageID><use:webACDPrefs><use:isAgent>false</use:isAgent><use:isMgr>false</use:isMgr><use:numAgentSessions>0</use:numAgentSessions><use:agentMonitorAllRSQueues>false</use:agentMonitorAllRSQueues><use:managerMonitorAllRSQueues>false</use:managerMonitorAllRSQueues><use:monitorAllRSAgents>false</use:monitorAllRSAgents></use:webACDPrefs><use:registrationDate>02/08/2016 15:21:23</use:registrationDate><use:visitCount>0</use:visitCount><use:userId>962225390</use:userId><use:eventCenter><use:optimizeAttendeeBandwidthUsage>true</use:optimizeAttendeeBandwidthUsage></use:eventCenter><use:passwordExpires>false</use:passwordExpires><use:passwordDaysLeft>0</use:passwordDaysLeft></serv:bodyContent></serv:body></serv:message>';
  var fakeWebExSiteInfoXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ns1="http://www.webex.com/schemas/2002/06/service/site" xmlns:event="http://www.webex.com/schemas/2002/06/service/event"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ns1:getSiteResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ns1:siteInstance><ns1:metaData><ns1:isEnterprise>true</ns1:isEnterprise><ns1:serviceType>Meeting Center</ns1:serviceType><ns1:serviceType>Event Center</ns1:serviceType><ns1:meetingTypes><ns1:meetingTypeID>214</ns1:meetingTypeID><ns1:meetingTypeName>PRO</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:meetingTypes><ns1:meetingTypeID>216</ns1:meetingTypeID><ns1:meetingTypeName>ONS</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:siteName>t30citestprov13</ns1:siteName><ns1:brandName>t30citestprov13</ns1:brandName><ns1:region>U.S.</ns1:region><ns1:currency>US Dollars</ns1:currency><ns1:timeZoneID>4</ns1:timeZoneID><ns1:timeZone>GMT-08:00, Pacific (San Jose)</ns1:timeZone><ns1:webDomain>sd2wd</ns1:webDomain><ns1:meetingDomain>sd2md</ns1:meetingDomain><ns1:telephonyDomain>sd2td</ns1:telephonyDomain><ns1:pageVersion>T31L</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion><ns1:pageLanguage>ENGLISH</ns1:pageLanguage><ns1:activateStatus>true</ns1:activateStatus><ns1:webPageType>J2EE</ns1:webPageType><ns1:iCalendar>true</ns1:iCalendar><ns1:myWebExDefaultPage>My Meetings</ns1:myWebExDefaultPage><ns1:componentVersion>cmp3100</ns1:componentVersion><ns1:displayMeetingActualTime>false</ns1:displayMeetingActualTime><ns1:displayOffset>true</ns1:displayOffset><ns1:supportWebEx11>false</ns1:supportWebEx11></ns1:metaData><ns1:ucf><ns1:ucfConfiguration>UCF 2.1</ns1:ucfConfiguration></ns1:ucf><ns1:clientPlatforms><ns1:msWindows>true</ns1:msWindows><ns1:macOS9>true</ns1:macOS9><ns1:macOSX>true</ns1:macOSX><ns1:sunSolaris>true</ns1:sunSolaris><ns1:linux>true</ns1:linux><ns1:hpUnix>false</ns1:hpUnix><ns1:java>true</ns1:java><ns1:palm>false</ns1:palm></ns1:clientPlatforms><ns1:resourceRestrictions><ns1:isLicenseManager>true</ns1:isLicenseManager><ns1:concurrentLicense>0</ns1:concurrentLicense><ns1:fileFolderCapacity>1000</ns1:fileFolderCapacity><ns1:maxConcurrentEvents>0</ns1:maxConcurrentEvents><ns1:archiveStorageLimit>1000</ns1:archiveStorageLimit></ns1:resourceRestrictions><ns1:supportAPI><ns1:autoLogin>true</ns1:autoLogin><ns1:aspAndPHPAPI>true</ns1:aspAndPHPAPI><ns1:backwardAPI>false</ns1:backwardAPI><ns1:xmlAPI>true</ns1:xmlAPI><ns1:cAPI>false</ns1:cAPI><ns1:scorm>true</ns1:scorm></ns1:supportAPI><ns1:myWebExConfig><ns1:myContacts>true</ns1:myContacts><ns1:myProfile>true</ns1:myProfile><ns1:myMeetings>true</ns1:myMeetings><ns1:trainingRecordings>false</ns1:trainingRecordings><ns1:folders>true</ns1:folders><ns1:eventDocument>false</ns1:eventDocument><ns1:myReport>false</ns1:myReport><ns1:myComputer>false</ns1:myComputer><ns1:personalMeetingPage>false</ns1:personalMeetingPage><ns1:myFilesStorage>1000</ns1:myFilesStorage><ns1:myComputerNumbers>0</ns1:myComputerNumbers><ns1:enableMyWebExPro>true</ns1:enableMyWebExPro><ns1:myWebExProMaxHosts>999999</ns1:myWebExProMaxHosts><ns1:restrictAccessAnyApps>false</ns1:restrictAccessAnyApps><ns1:restrictAccessAnyAppsNum>0</ns1:restrictAccessAnyAppsNum><ns1:addlAccessAnyComputersLimit>STRICT</ns1:addlAccessAnyComputersLimit><ns1:addlAccessAnyComputers>0</ns1:addlAccessAnyComputers><ns1:addlStorageLimit>STRICT</ns1:addlStorageLimit><ns1:addlStorage>0</ns1:addlStorage><ns1:myContactsPro>true</ns1:myContactsPro><ns1:myProfilePro>true</ns1:myProfilePro><ns1:myMeetingsPro>true</ns1:myMeetingsPro><ns1:trainingRecordingsPro>true</ns1:trainingRecordingsPro><ns1:foldersPro>true</ns1:foldersPro><ns1:eventDocumentPro>true</ns1:eventDocumentPro><ns1:myReportPro>true</ns1:myReportPro><ns1:myComputerPro>false</ns1:myComputerPro><ns1:personalMeetingPagePro>true</ns1:personalMeetingPagePro><ns1:myFilesStoragePro>1000</ns1:myFilesStoragePro><ns1:myComputerNumbersPro>0</ns1:myComputerNumbersPro><ns1:PMRheaderBranding>false</ns1:PMRheaderBranding></ns1:myWebExConfig><ns1:telephonyConfig><ns1:isTSPUsingTelephonyAPI>false</ns1:isTSPUsingTelephonyAPI><ns1:serviceName>Personal Conference No.</ns1:serviceName><ns1:participantAccessCodeLabel>Attendee access code</ns1:participantAccessCodeLabel><ns1:subscriberAccessCodeLabel>Host access code</ns1:subscriberAccessCodeLabel><ns1:attendeeIDLabel>Attendee ID</ns1:attendeeIDLabel><ns1:internetPhone>true</ns1:internetPhone><ns1:supportCallInTypeTeleconf>true</ns1:supportCallInTypeTeleconf><ns1:callInTeleconferencing>true</ns1:callInTeleconferencing><ns1:tollFreeCallinTeleconferencing>true</ns1:tollFreeCallinTeleconferencing><ns1:intlCallInTeleconferencing>true</ns1:intlCallInTeleconferencing><ns1:callBackTeleconferencing>true</ns1:callBackTeleconferencing><ns1:callInNumber>1</ns1:callInNumber><ns1:defaultTeleServerSubject>173.36.203.148</ns1:defaultTeleServerSubject><ns1:subscribeName>test</ns1:subscribeName><ns1:subscribePassword>pass</ns1:subscribePassword><ns1:defaultPhoneLines>4</ns1:defaultPhoneLines><ns1:defaultSpeakingLines>4</ns1:defaultSpeakingLines><ns1:majorCountryCode>1</ns1:majorCountryCode><ns1:majorAreaCode>408</ns1:majorAreaCode><ns1:publicName>Call-in User</ns1:publicName><ns1:hybridTeleconference>true</ns1:hybridTeleconference><ns1:instantHelp>false</ns1:instantHelp><ns1:customerManage>false</ns1:customerManage><ns1:maxCallersNumber>500</ns1:maxCallersNumber><ns1:isSpecified>false</ns1:isSpecified><ns1:isContinue>false</ns1:isContinue><ns1:intlCallBackTeleconferencing>true</ns1:intlCallBackTeleconferencing><ns1:personalTeleconf><ns1:primaryLargeServer><serv:tollNum>408-545-2904</serv:tollNum><serv:tollFreeNum>408-545-2905</serv:tollFreeNum><serv:intlLocalNum>408-545-2905</serv:intlLocalNum><serv:globalNum><serv:countryAlias>United States of America</serv:countryAlias><serv:phoneNumber>8666993231</serv:phoneNumber><serv:tollFree>false</serv:tollFree><serv:default>false</serv:default></serv:globalNum><serv:globalNum><serv:countryAlias>Canada</serv:countryAlias><serv:phoneNumber>80012345678</serv:phoneNumber><serv:tollFree>false</serv:tollFree><serv:default>false</serv:default></serv:globalNum><serv:globalNum><serv:countryAlias>Germany</serv:countryAlias><serv:phoneNumber>017738999999</serv:phoneNumber><serv:tollFree>false</serv:tollFree><serv:default>false</serv:default></serv:globalNum><serv:globalNum><serv:countryAlias>Germany toll-free</serv:countryAlias><serv:phoneNumber>01773898888</serv:phoneNumber><serv:tollFree>true</serv:tollFree><serv:default>false</serv:default></serv:globalNum><serv:globalNum><serv:countryAlias>France</serv:countryAlias><serv:phoneNumber>8889898998</serv:phoneNumber><serv:tollFree>false</serv:tollFree><serv:default>false</serv:default></serv:globalNum><serv:globalNum><serv:countryAlias>France toll free</serv:countryAlias><serv:phoneNumber>88886666666</serv:phoneNumber><serv:tollFree>true</serv:tollFree><serv:default>false</serv:default></serv:globalNum><serv:enableServer>true</serv:enableServer><serv:tollLabel>New Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>New2 Call-in toll-free number (US/Canada) - changed</serv:tollFreeLabel></ns1:primaryLargeServer><ns1:backup1LargeServer><serv:intlLocalNum>1-408-545-2905</serv:intlLocalNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup1LargeServer><ns1:backup2LargeServer><serv:enableServer>false</serv:enableServer><serv:tollLabel>Backup call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Backup call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup2LargeServer><ns1:primarySmallServer><serv:enableServer>false</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:primarySmallServer><ns1:backup1SmallServer><serv:enableServer>false</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup1SmallServer><ns1:backup2SmallServer><serv:enableServer>false</serv:enableServer><serv:tollLabel>Backup call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Backup call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup2SmallServer><ns1:joinBeforeHost>false</ns1:joinBeforeHost></ns1:personalTeleconf><ns1:multiMediaPlatform>true</ns1:multiMediaPlatform><ns1:multiMediaHostName>msd1mcccl01.webex.com</ns1:multiMediaHostName><ns1:broadcastAudioStream>true</ns1:broadcastAudioStream><ns1:tspAdaptorSettings><ns1:primaryLarge><ns1:enableAdaptor>true</ns1:enableAdaptor><ns1:serverIP>173.36.203.178</ns1:serverIP><ns1:mpAudio><ns1:label>Call-in number</ns1:label><ns1:phoneNumber>1-8775548180</ns1:phoneNumber></ns1:mpAudio><ns1:mpAudio><ns1:label>Call-in toll-free number</ns1:label><ns1:phoneNumber>1-8775548180</ns1:phoneNumber></ns1:mpAudio><ns1:globalCallInNumURL>http://www.webex.com</ns1:globalCallInNumURL></ns1:primaryLarge><ns1:backup1Large><ns1:enableAdaptor>false</ns1:enableAdaptor><ns1:serverIP></ns1:serverIP><ns1:mpAudio><ns1:label>Call-in number</ns1:label></ns1:mpAudio><ns1:mpAudio><ns1:label>Call-in toll-free number</ns1:label></ns1:mpAudio></ns1:backup1Large><ns1:backup2Large><ns1:enableAdaptor>false</ns1:enableAdaptor><ns1:serverIP></ns1:serverIP><ns1:mpAudio><ns1:label>Call-in number</ns1:label></ns1:mpAudio><ns1:mpAudio><ns1:label>Call-in toll-free number</ns1:label></ns1:mpAudio></ns1:backup2Large></ns1:tspAdaptorSettings><ns1:meetingPlace><ns1:persistentTSP>false</ns1:persistentTSP><ns1:mpAudioConferencing>WithoutIntegration</ns1:mpAudioConferencing></ns1:meetingPlace><ns1:supportOtherTypeTeleconf>false</ns1:supportOtherTypeTeleconf><ns1:otherTeleServiceName>Other teleconference service</ns1:otherTeleServiceName><ns1:supportAdapterlessTSP>false</ns1:supportAdapterlessTSP><ns1:displayAttendeeID>false</ns1:displayAttendeeID><ns1:provisionTeleAccount>true</ns1:provisionTeleAccount><ns1:choosePCN>false</ns1:choosePCN><ns1:audioOnly>true</ns1:audioOnly><ns1:configTollAndTollFreeNum>false</ns1:configTollAndTollFreeNum><ns1:configPrimaryTS>false</ns1:configPrimaryTS><ns1:teleCLIAuthEnabled>false</ns1:teleCLIAuthEnabled><ns1:teleCLIPINEnabled>false</ns1:teleCLIPINEnabled></ns1:telephonyConfig><ns1:commerceAndReporting><ns1:trackingCode>false</ns1:trackingCode><ns1:siteAdminReport>true</ns1:siteAdminReport><ns1:subScriptionService>false</ns1:subScriptionService><ns1:isECommmerce>false</ns1:isECommmerce><ns1:customereCommerce>false</ns1:customereCommerce><ns1:isLocalTax>false</ns1:isLocalTax><ns1:localTaxName>VAT</ns1:localTaxName><ns1:localTaxtRate>0.0</ns1:localTaxtRate><ns1:holReport>1</ns1:holReport></ns1:commerceAndReporting><ns1:tools><ns1:businessDirectory>false</ns1:businessDirectory><ns1:officeCalendar>false</ns1:officeCalendar><ns1:meetingCalendar>true</ns1:meetingCalendar><ns1:displayOnCallAssistLink>false</ns1:displayOnCallAssistLink><ns1:displayProfileLink>true</ns1:displayProfileLink><ns1:recordingAndPlayback>true</ns1:recordingAndPlayback><ns1:recordingEditor>true</ns1:recordingEditor><ns1:publishRecordings>true</ns1:publishRecordings><ns1:instantMeeting>true</ns1:instantMeeting><ns1:emails>false</ns1:emails><ns1:outlookIntegration>true</ns1:outlookIntegration><ns1:wirelessAccess>false</ns1:wirelessAccess><ns1:allowPublicAccess>true</ns1:allowPublicAccess><ns1:ssl>true</ns1:ssl><ns1:handsOnLab>true</ns1:handsOnLab><ns1:holMaxLabs>999999</ns1:holMaxLabs><ns1:holMaxComputers>999999</ns1:holMaxComputers><ns1:userLockDown>false</ns1:userLockDown><ns1:meetingAssist>false</ns1:meetingAssist><ns1:sms>false</ns1:sms><ns1:encryption>NONE</ns1:encryption><ns1:internalMeeting>false</ns1:internalMeeting><ns1:enableTP>false</ns1:enableTP><ns1:enableTPplus>false</ns1:enableTPplus></ns1:tools><ns1:custCommunications><ns1:displayType><ns1:prodSvcAnnounce>false</ns1:prodSvcAnnounce><ns1:trainingInfo>false</ns1:trainingInfo><ns1:eNewsletters>false</ns1:eNewsletters><ns1:promotionsOffers>false</ns1:promotionsOffers><ns1:pressReleases>false</ns1:pressReleases></ns1:displayType><ns1:displayMethod><ns1:email>false</ns1:email><ns1:fax>false</ns1:fax><ns1:phone>false</ns1:phone><ns1:mail>false</ns1:mail></ns1:displayMethod></ns1:custCommunications><ns1:trackingCodes/><ns1:supportedServices><ns1:meetingCenter><ns1:enabled>true</ns1:enabled><ns1:pageVersion>mc3100</ns1:pageVersion><ns1:clientVersion>T30L10NSP2EP4</ns1:clientVersion></ns1:meetingCenter><ns1:trainingCenter><ns1:enabled>false</ns1:enabled><ns1:pageVersion>tc3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion></ns1:trainingCenter><ns1:supportCenter><ns1:enabled>false</ns1:enabled><ns1:pageVersion>sc3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion><ns1:webACD>false</ns1:webACD></ns1:supportCenter><ns1:eventCenter><ns1:enabled>true</ns1:enabled><ns1:pageVersion>ec3100</ns1:pageVersion><ns1:clientVersion>T30L10NSP2EP4</ns1:clientVersion><ns1:marketingAddOn>true</ns1:marketingAddOn><ns1:optimizeAttendeeBandwidthUsage>false</ns1:optimizeAttendeeBandwidthUsage></ns1:eventCenter><ns1:salesCenter><ns1:enabled>false</ns1:enabled><ns1:pageVersion>sac3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion></ns1:salesCenter></ns1:supportedServices><ns1:securityOptions><ns1:passwordExpires>false</ns1:passwordExpires><ns1:passwordLifetime>90</ns1:passwordLifetime><ns1:allMeetingsUnlisted>true</ns1:allMeetingsUnlisted><ns1:allMeetingsPassword>true</ns1:allMeetingsPassword><ns1:joinBeforeHost>false</ns1:joinBeforeHost><ns1:audioBeforeHost>true</ns1:audioBeforeHost><ns1:changePersonalURL>false</ns1:changePersonalURL><ns1:changeUserName>false</ns1:changeUserName><ns1:meetings><ns1:strictPasswords>true</ns1:strictPasswords></ns1:meetings><ns1:strictUserPassword>true</ns1:strictUserPassword><ns1:accountNotify>false</ns1:accountNotify><ns1:requireLoginBeforeSiteAccess>true</ns1:requireLoginBeforeSiteAccess><ns1:changePWDWhenAutoLogin>true</ns1:changePWDWhenAutoLogin><ns1:enforceBaseline>true</ns1:enforceBaseline><ns1:passwordChangeIntervalOpt>true</ns1:passwordChangeIntervalOpt><ns1:passwordChangeInterval>24</ns1:passwordChangeInterval><ns1:firstAttendeeAsPresenter>false</ns1:firstAttendeeAsPresenter><ns1:isEnableUUIDLink>true</ns1:isEnableUUIDLink><ns1:isEnableUUIDLinkForSAC>false</ns1:isEnableUUIDLinkForSAC><ns1:enforceRecordingPwdForMC>true</ns1:enforceRecordingPwdForMC><ns1:enforceRecordingPwdForEC>true</ns1:enforceRecordingPwdForEC><ns1:enforceRecordingPwdForTC>true</ns1:enforceRecordingPwdForTC><ns1:enforceRecordingPwdForMisc>true</ns1:enforceRecordingPwdForMisc></ns1:securityOptions><ns1:defaults><ns1:emailReminders>true</ns1:emailReminders><ns1:entryExitTone>NOTONE</ns1:entryExitTone><ns1:voip>true</ns1:voip><ns1:teleconference><ns1:telephonySupport>CALLIN</ns1:telephonySupport><ns1:tollFree>true</ns1:tollFree><ns1:intlLocalCallIn>false</ns1:intlLocalCallIn></ns1:teleconference><ns1:joinTeleconfNotPress1>false</ns1:joinTeleconfNotPress1><ns1:updateTSPAccount>false</ns1:updateTSPAccount></ns1:defaults><ns1:scheduleMeetingOptions><ns1:scheduleOnBehalf>true</ns1:scheduleOnBehalf><ns1:saveSessionTemplate>true</ns1:saveSessionTemplate></ns1:scheduleMeetingOptions><ns1:navBarTop><ns1:button><ns1:order>1</ns1:order><ns1:serviceName>Welcome</ns1:serviceName></ns1:button><ns1:button><ns1:order>2</ns1:order><ns1:enabled>true</ns1:enabled><ns1:serviceName>Meeting Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>3</ns1:order><ns1:enabled>true</ns1:enabled><ns1:serviceName>Event Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>4</ns1:order><ns1:enabled>false</ns1:enabled><ns1:serviceName>Sales Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>5</ns1:order><ns1:enabled>false</ns1:enabled><ns1:serviceName>Support Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>6</ns1:order><ns1:enabled>false</ns1:enabled><ns1:serviceName>Training Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>7</ns1:order><ns1:serviceName>Site Administration</ns1:serviceName></ns1:button><ns1:button><ns1:order>8</ns1:order><ns1:enabled>false</ns1:enabled><ns1:serviceName>Presentation Studio</ns1:serviceName></ns1:button><ns1:displayDisabledService>true</ns1:displayDisabledService></ns1:navBarTop><ns1:navMyWebEx><ns1:partnerIntegration>true</ns1:partnerIntegration><ns1:support/><ns1:training/></ns1:navMyWebEx><ns1:navAllServices><ns1:support><ns1:name>Support</ns1:name></ns1:support><ns1:training><ns1:name>Training</ns1:name></ns1:training><ns1:supportMenu><ns1:supportMyResources>false</ns1:supportMyResources></ns1:supportMenu></ns1:navAllServices><ns1:passwordCriteria><ns1:mixedCase>false</ns1:mixedCase><ns1:minLength>4</ns1:minLength><ns1:minAlpha>0</ns1:minAlpha><ns1:minNumeric>0</ns1:minNumeric><ns1:minSpecial>0</ns1:minSpecial><ns1:disallowWebTextSessions>true</ns1:disallowWebTextSessions><ns1:disallowWebTextAccounts>true</ns1:disallowWebTextAccounts><ns1:disallowList>true</ns1:disallowList><ns1:disallowValue>password</ns1:disallowValue><ns1:disallowValue>passwd</ns1:disallowValue><ns1:disallowValue>pass</ns1:disallowValue></ns1:passwordCriteria><ns1:recordingPasswordCriteria><ns1:mixedCase>true</ns1:mixedCase><ns1:minLength>8</ns1:minLength><ns1:minAlpha>2</ns1:minAlpha><ns1:minNumeric>1</ns1:minNumeric><ns1:minSpecial>0</ns1:minSpecial><ns1:disallowWebTextSessions>false</ns1:disallowWebTextSessions><ns1:disallowList>false</ns1:disallowList><ns1:disallowValue>password</ns1:disallowValue><ns1:disallowValue>passwd</ns1:disallowValue><ns1:disallowValue>pass</ns1:disallowValue></ns1:recordingPasswordCriteria><ns1:accountPasswordCriteria><ns1:mixedCase>true</ns1:mixedCase><ns1:minLength>8</ns1:minLength><ns1:minNumeric>1</ns1:minNumeric><ns1:minAlpha>2</ns1:minAlpha><ns1:minSpecial>0</ns1:minSpecial><ns1:disallow3XRepeatedChar>true</ns1:disallow3XRepeatedChar><ns1:disallowWebTextAccounts>true</ns1:disallowWebTextAccounts><ns1:disallowList>true</ns1:disallowList><ns1:disallowValue>password</ns1:disallowValue><ns1:disallowValue>passwd</ns1:disallowValue><ns1:disallowValue>pass</ns1:disallowValue><ns1:disallowValue>webex</ns1:disallowValue><ns1:disallowValue>cisco</ns1:disallowValue><ns1:disallowValue>xebew</ns1:disallowValue><ns1:disallowValue>ocsic</ns1:disallowValue></ns1:accountPasswordCriteria><ns1:productivityTools><ns1:enable>true</ns1:enable><ns1:installOpts><ns1:autoUpdate>true</ns1:autoUpdate></ns1:installOpts><ns1:integrations><ns1:outlook>true</ns1:outlook><ns1:outlookForMac>true</ns1:outlookForMac><ns1:lotusNotes>true</ns1:lotusNotes><ns1:oneClick>true</ns1:oneClick><ns1:showSysTrayIcon>true</ns1:showSysTrayIcon><ns1:office>true</ns1:office><ns1:excel>true</ns1:excel><ns1:powerPoint>true</ns1:powerPoint><ns1:word>true</ns1:word><ns1:IE>true</ns1:IE><ns1:firefox>true</ns1:firefox><ns1:explorerRightClick>true</ns1:explorerRightClick><ns1:instantMessenger>true</ns1:instantMessenger><ns1:aolMessenger>true</ns1:aolMessenger><ns1:googleTalk>true</ns1:googleTalk><ns1:lotusSametime>true</ns1:lotusSametime><ns1:skype>true</ns1:skype><ns1:windowsMessenger>true</ns1:windowsMessenger><ns1:yahooMessenger>true</ns1:yahooMessenger><ns1:ciscoIPPhone>false</ns1:ciscoIPPhone><ns1:pcNow>true</ns1:pcNow><ns1:iGoogle>false</ns1:iGoogle><ns1:iPhoneDusting>true</ns1:iPhoneDusting></ns1:integrations><ns1:oneClick><ns1:allowJoinUnlistMeeting>true</ns1:allowJoinUnlistMeeting><ns1:requireApproveJoin>false</ns1:requireApproveJoin></ns1:oneClick><ns1:templates><ns1:useTemplate>false</ns1:useTemplate></ns1:templates><ns1:lockDownPT><ns1:lockDown>false</ns1:lockDown></ns1:lockDownPT><ns1:imSettings><ns1:attendeeInviteOther>true</ns1:attendeeInviteOther></ns1:imSettings></ns1:productivityTools><ns1:meetingPlace/><ns1:salesCenter><ns1:allowJoinWithoutLogin>false</ns1:allowJoinWithoutLogin></ns1:salesCenter><ns1:connectIntegration><ns1:integratedWebEx11>false</ns1:integratedWebEx11></ns1:connectIntegration><ns1:video><ns1:HQvideo>true</ns1:HQvideo><ns1:maxBandwidth>MEDIUM</ns1:maxBandwidth><ns1:HDvideo>true</ns1:HDvideo></ns1:video><ns1:siteCommonOptions><ns1:SupportCustomDialRestriction>false</ns1:SupportCustomDialRestriction><ns1:SupportTelePresence>false</ns1:SupportTelePresence><ns1:SupportTelePresencePlus>false</ns1:SupportTelePresencePlus><ns1:EnableCloudTelepresence>true</ns1:EnableCloudTelepresence><ns1:enablePersonalMeetingRoom>true</ns1:enablePersonalMeetingRoom></ns1:siteCommonOptions><ns1:samlSSO><ns1:enableSSO>false</ns1:enableSSO><ns1:autoAccountCreation>false</ns1:autoAccountCreation></ns1:samlSSO></ns1:siteInstance></serv:bodyContent></serv:body></serv:message>';
  var fakeWebExMeetingTypeInfoXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:mtgtype="http://www.webex.com/schemas/2002/06/service/meetingtype"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="mtgtype:lstMeetingTypeResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><mtgtype:matchingRecords><serv:total>2</serv:total><serv:returned>2</serv:returned><serv:startFrom>1</serv:startFrom></mtgtype:matchingRecords><mtgtype:meetingType><mtgtype:productCodePrefix>PRO</mtgtype:productCodePrefix><mtgtype:active>ACTIVATED</mtgtype:active><mtgtype:name>Pro 200</mtgtype:name><mtgtype:displayName>Pro 200</mtgtype:displayName><mtgtype:limits><mtgtype:maxAppShareDuration>1440</mtgtype:maxAppShareDuration><mtgtype:maxAppShareUser>200</mtgtype:maxAppShareUser><mtgtype:maxDesktopShareDuration>1440</mtgtype:maxDesktopShareDuration><mtgtype:maxDesktopShareUser>200</mtgtype:maxDesktopShareUser><mtgtype:maxFileTransferUser>200</mtgtype:maxFileTransferUser><mtgtype:maxMeetingDuration>1440</mtgtype:maxMeetingDuration><mtgtype:maxMeetingUser>200</mtgtype:maxMeetingUser><mtgtype:maxRecordUser>200</mtgtype:maxRecordUser><mtgtype:maxVideoDuration>1440</mtgtype:maxVideoDuration><mtgtype:maxVideoUser>200</mtgtype:maxVideoUser><mtgtype:maxWebTourDuration>1440</mtgtype:maxWebTourDuration><mtgtype:maxWebTourUser>200</mtgtype:maxWebTourUser></mtgtype:limits><mtgtype:options><mtgtype:supportAppShare>true</mtgtype:supportAppShare><mtgtype:supportAppShareRemote>true</mtgtype:supportAppShareRemote><mtgtype:supportAttendeeRegistration>true</mtgtype:supportAttendeeRegistration><mtgtype:supportRemoteWebTour>true</mtgtype:supportRemoteWebTour><mtgtype:supportWebTour>true</mtgtype:supportWebTour><mtgtype:supportFileShare>false</mtgtype:supportFileShare><mtgtype:supportChat>true</mtgtype:supportChat><mtgtype:supportCobrowseSite>false</mtgtype:supportCobrowseSite><mtgtype:supportCorporateOfficesSite>true</mtgtype:supportCorporateOfficesSite><mtgtype:supportDesktopShare>true</mtgtype:supportDesktopShare><mtgtype:supportDesktopShareRemote>true</mtgtype:supportDesktopShareRemote><mtgtype:supportFileTransfer>true</mtgtype:supportFileTransfer><mtgtype:supportInternationalCallOut>true</mtgtype:supportInternationalCallOut><mtgtype:supportJavaClient>true</mtgtype:supportJavaClient><mtgtype:supportMacClient>true</mtgtype:supportMacClient><mtgtype:supportMeetingCenterSite>true</mtgtype:supportMeetingCenterSite><mtgtype:supportMeetingRecord>true</mtgtype:supportMeetingRecord><mtgtype:supportMultipleMeeting>false</mtgtype:supportMultipleMeeting><mtgtype:supportOnCallSite>true</mtgtype:supportOnCallSite><mtgtype:supportOnStageSite>false</mtgtype:supportOnStageSite><mtgtype:supportPartnerOfficesSite>true</mtgtype:supportPartnerOfficesSite><mtgtype:supportPoll>true</mtgtype:supportPoll><mtgtype:supportPresentation>true</mtgtype:supportPresentation><mtgtype:supportSolarisClient>true</mtgtype:supportSolarisClient><mtgtype:supportSSL>false</mtgtype:supportSSL><mtgtype:supportE2E>false</mtgtype:supportE2E><mtgtype:supportPKI>false</mtgtype:supportPKI><mtgtype:supportTeleconfCallIn>true</mtgtype:supportTeleconfCallIn><mtgtype:supportTeleconfCallOut>true</mtgtype:supportTeleconfCallOut><mtgtype:supportTollFreeCallIn>true</mtgtype:supportTollFreeCallIn><mtgtype:supportVideo>true</mtgtype:supportVideo><mtgtype:supportVoIP>true</mtgtype:supportVoIP><mtgtype:supportWebExComSite>true</mtgtype:supportWebExComSite><mtgtype:supportWindowsClient>true</mtgtype:supportWindowsClient><mtgtype:supportQuickStartAttendees>false</mtgtype:supportQuickStartAttendees><mtgtype:supportQuickStartHost>true</mtgtype:supportQuickStartHost><mtgtype:hideInScheduler>false</mtgtype:hideInScheduler></mtgtype:options><mtgtype:phoneNumbers><mtgtype:primaryTollCallInNumber>408-545-2904</mtgtype:primaryTollCallInNumber><mtgtype:primaryTollFreeCallInNumber>408-545-2905</mtgtype:primaryTollFreeCallInNumber></mtgtype:phoneNumbers><mtgtype:meetingTypeID>214</mtgtype:meetingTypeID><mtgtype:serviceTypes><mtgtype:serviceType>MeetingCenter</mtgtype:serviceType></mtgtype:serviceTypes></mtgtype:meetingType><mtgtype:meetingType><mtgtype:productCodePrefix>ONS</mtgtype:productCodePrefix><mtgtype:active>ACTIVATED</mtgtype:active><mtgtype:name>Event 200</mtgtype:name><mtgtype:displayName>Event 200</mtgtype:displayName><mtgtype:limits><mtgtype:maxAppShareDuration>1440</mtgtype:maxAppShareDuration><mtgtype:maxAppShareUser>200</mtgtype:maxAppShareUser><mtgtype:maxDesktopShareDuration>1440</mtgtype:maxDesktopShareDuration><mtgtype:maxDesktopShareUser>200</mtgtype:maxDesktopShareUser><mtgtype:maxFileTransferUser>200</mtgtype:maxFileTransferUser><mtgtype:maxMeetingDuration>1440</mtgtype:maxMeetingDuration><mtgtype:maxMeetingUser>200</mtgtype:maxMeetingUser><mtgtype:maxRecordUser>200</mtgtype:maxRecordUser><mtgtype:maxVideoDuration>1440</mtgtype:maxVideoDuration><mtgtype:maxVideoUser>200</mtgtype:maxVideoUser><mtgtype:maxWebTourDuration>1440</mtgtype:maxWebTourDuration><mtgtype:maxWebTourUser>200</mtgtype:maxWebTourUser></mtgtype:limits><mtgtype:options><mtgtype:supportAppShare>true</mtgtype:supportAppShare><mtgtype:supportAppShareRemote>true</mtgtype:supportAppShareRemote><mtgtype:supportAttendeeRegistration>true</mtgtype:supportAttendeeRegistration><mtgtype:supportRemoteWebTour>true</mtgtype:supportRemoteWebTour><mtgtype:supportWebTour>true</mtgtype:supportWebTour><mtgtype:supportFileShare>false</mtgtype:supportFileShare><mtgtype:supportChat>true</mtgtype:supportChat><mtgtype:supportCobrowseSite>false</mtgtype:supportCobrowseSite><mtgtype:supportCorporateOfficesSite>false</mtgtype:supportCorporateOfficesSite><mtgtype:supportDesktopShare>true</mtgtype:supportDesktopShare><mtgtype:supportDesktopShareRemote>true</mtgtype:supportDesktopShareRemote><mtgtype:supportFileTransfer>true</mtgtype:supportFileTransfer><mtgtype:supportInternationalCallOut>true</mtgtype:supportInternationalCallOut><mtgtype:supportJavaClient>true</mtgtype:supportJavaClient><mtgtype:supportMacClient>true</mtgtype:supportMacClient><mtgtype:supportMeetingCenterSite>false</mtgtype:supportMeetingCenterSite><mtgtype:supportMeetingRecord>true</mtgtype:supportMeetingRecord><mtgtype:supportMultipleMeeting>false</mtgtype:supportMultipleMeeting><mtgtype:supportOnCallSite>false</mtgtype:supportOnCallSite><mtgtype:supportOnStageSite>true</mtgtype:supportOnStageSite><mtgtype:supportPartnerOfficesSite>false</mtgtype:supportPartnerOfficesSite><mtgtype:supportPoll>true</mtgtype:supportPoll><mtgtype:supportPresentation>true</mtgtype:supportPresentation><mtgtype:supportSolarisClient>true</mtgtype:supportSolarisClient><mtgtype:supportSSL>false</mtgtype:supportSSL><mtgtype:supportE2E>false</mtgtype:supportE2E><mtgtype:supportPKI>false</mtgtype:supportPKI><mtgtype:supportTeleconfCallIn>true</mtgtype:supportTeleconfCallIn><mtgtype:supportTeleconfCallOut>true</mtgtype:supportTeleconfCallOut><mtgtype:supportTollFreeCallIn>true</mtgtype:supportTollFreeCallIn><mtgtype:supportVideo>true</mtgtype:supportVideo><mtgtype:supportVoIP>true</mtgtype:supportVoIP><mtgtype:supportWebExComSite>false</mtgtype:supportWebExComSite><mtgtype:supportWindowsClient>true</mtgtype:supportWindowsClient><mtgtype:supportQuickStartAttendees>false</mtgtype:supportQuickStartAttendees><mtgtype:supportQuickStartHost>true</mtgtype:supportQuickStartHost><mtgtype:hideInScheduler>false</mtgtype:hideInScheduler></mtgtype:options><mtgtype:phoneNumbers><mtgtype:primaryTollCallInNumber>408-545-2904</mtgtype:primaryTollCallInNumber><mtgtype:primaryTollFreeCallInNumber>408-545-2905</mtgtype:primaryTollFreeCallInNumber></mtgtype:phoneNumbers><mtgtype:meetingTypeID>216</mtgtype:meetingTypeID><mtgtype:serviceTypes><mtgtype:serviceType>EventCenter</mtgtype:serviceType></mtgtype:serviceTypes></mtgtype:meetingType></serv:bodyContent></serv:body></serv:message>';

  beforeEach(module('WebExApp'));

  beforeEach(module(function ($provide) {
    $provide.value('$stateParams', fakeStateParams);
  }));

  beforeEach(inject(function (
    _$q_,
    _$rootScope_,
    _Orgservice_,
    _WebExXmlApiFact_
  ) {

    $q = _$q_;
    $rootScope = _$rootScope_;

    deferredOrgLicenses = _$q_.defer();
    deferredWebExSessionTicket = _$q_.defer();
    deferredWebExSiteVersionXml = _$q_.defer();
    deferredWebExUserInfoXml = _$q_.defer();
    deferredWebExSiteInfoXml = _$q_.defer();
    deferredWebExMeetingTypeInfoXml = _$q_.defer();

    spyOn(_Orgservice_, "getValidLicenses").and.returnValue(deferredOrgLicenses.promise);
    spyOn(_WebExXmlApiFact_, "getSessionTicket").and.returnValue(deferredWebExSessionTicket.promise);
    spyOn(_WebExXmlApiFact_, "getSiteVersion").and.returnValue(deferredWebExSiteVersionXml.promise);
    spyOn(_WebExXmlApiFact_, "getUserInfo").and.returnValue(deferredWebExUserInfoXml.promise);
    spyOn(_WebExXmlApiFact_, "getSiteInfo").and.returnValue(deferredWebExSiteInfoXml.promise);
    spyOn(_WebExXmlApiFact_, "getMeetingTypeInfo").and.returnValue(deferredWebExMeetingTypeInfoXml.promise);
  }));

  it('can initialize user settings', inject(function (WebExUserSettingsFact) {
    var userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

    expect(userSettingsModel.meetingCenter.isEntitledOnAtlas).toBeDefined();
    expect(userSettingsModel.trainingCenter.isEntitledOnAtlas).toBeDefined();
    expect(userSettingsModel.eventCenter.isEntitledOnAtlas).toBeDefined();
    expect(userSettingsModel.supportCenter.isEntitledOnAtlas).toBeDefined();

    expect(userSettingsModel.meetingCenter.isEntitledOnWebEx).toBeDefined();
    expect(userSettingsModel.trainingCenter.isEntitledOnWebEx).toBeDefined();
    expect(userSettingsModel.eventCenter.isEntitledOnWebEx).toBeDefined();
    expect(userSettingsModel.supportCenter.isEntitledOnWebEx).toBeDefined();
  }));

  it('can update user settings base on webex service entitlement in the atlas d/b', inject(function (WebExUserSettingsFact) {
    var userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

    WebExUserSettingsFact.getUserWebExEntitlementFromAtlas();

    deferredOrgLicenses.resolve(fakeOrgLicenses);
    $rootScope.$apply();

    expect(userSettingsModel.meetingCenter.isEntitledOnAtlas).toEqual(true);
    expect(userSettingsModel.trainingCenter.isEntitledOnAtlas).toEqual(false);
    expect(userSettingsModel.eventCenter.isEntitledOnAtlas).toEqual(true);
    expect(userSettingsModel.supportCenter.isEntitledOnAtlas).toEqual(false);
  }));

  it('can update user settings base on webex service entitlement in the webex d/b', inject(function (WebExUserSettingsFact) {
    var userSettingsModel = WebExUserSettingsFact.initUserSettingsModel();

    WebExUserSettingsFact.getUserSettingsFromWebEx();

    deferredWebExSessionTicket.resolve(fakeWebExSessionTicket);
    $rootScope.$apply();

    deferredWebExSiteVersionXml.resolve(fakeWebExSiteVersionXml);
    $rootScope.$apply();

    deferredWebExUserInfoXml.resolve(fakeWebExUserInfoXml);
    $rootScope.$apply();

    deferredWebExSiteInfoXml.resolve(fakeWebExSiteInfoXml);
    $rootScope.$apply();

    deferredWebExMeetingTypeInfoXml.resolve(fakeWebExMeetingTypeInfoXml);
    $rootScope.$apply();

    expect(userSettingsModel.meetingCenter.isEntitledOnWebEx).toEqual(true);
    expect(userSettingsModel.trainingCenter.isEntitledOnWebEx).toEqual(false);
    expect(userSettingsModel.eventCenter.isEntitledOnWebEx).toEqual(true);
    expect(userSettingsModel.supportCenter.isEntitledOnWebEx).toEqual(false);
  }));
}); // describe()

describe('WebExUserSettingsFact read-only admin tests', function () {
  var $q;
  var $rootScope;
  var Notification;
  var deferredWebExReadOnlyXML;
  var fakeWebExReadOnlyXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:use="http://www.webex.com/schemas/2002/06/service/user"><serv:header><serv:response><serv:result>FAILURE</serv:result><serv:reason>Access denied, additional privileges are required</serv:reason><serv:gsbStatus>PRIMARY</serv:gsbStatus><serv:exceptionID>000001</serv:exceptionID></serv:response></serv:header><serv:body><serv:bodyContent/></serv:body></serv:message>';

  beforeEach(module('WebExApp'));

  beforeEach(inject(function (
    _$q_,
    _$rootScope_,
    _WebExXmlApiFact_,
    _Notification_,
    _Authinfo_
  ) {

    $q = _$q_;
    $rootScope = _$rootScope_;

    deferredWebExReadOnlyXML = _$q_.defer();
    spyOn(_WebExXmlApiFact_, "updateUserSettings2").and.returnValue(deferredWebExReadOnlyXML.promise);

    Notification = _Notification_;
    spyOn(Notification, 'notifyReadOnly');

    spyOn(_Authinfo_, "isReadOnlyAdmin").and.returnValue(true);
  }));

  it('Shows orange toast in read only mode', inject(function (WebExUserSettingsFact) {
    WebExUserSettingsFact.updateUserSettings2();
    deferredWebExReadOnlyXML.resolve(fakeWebExReadOnlyXml);
    $rootScope.$apply();

    expect(Notification.notifyReadOnly).toHaveBeenCalled();
  }));
}); // describe(read-only admin tests)

describe('WebExUserSettingsFact pmr/cmr tests', function () {
  var Notification;
  var WebexUserSettingsSvc;

  /**
    var MyReporter = function () {
      jasmineRequire.JsApiReporter.apply(this, arguments);
    };
    MyReporter.prototype = jasmineRequire.JsApiReporter.prototype;
    MyReporter.prototype.constructor = MyReporter;
    MyReporter.prototype.specDone = function (o) {
      o = o || {};
      if (o.status !== "passed") {
        console.warn("Failed:" + o.fullName + o.failedExpectations[0].message);
      }
    };
    var env = jasmine.getEnv();
    env.addReporter(new MyReporter());
  **/

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

  beforeEach(module('WebExApp'));

  beforeEach(module(function ($provide) {
    WebexUserSettingsSvc = {
      'pmr': {
        'isSiteEnabled': true,
        'value': true
      },
      'cmr': {
        'value': true
      },
      'telephonyPriviledge': {
        "telephonyType": {
          "isWebExAudio": false,
          "isTspAudio": false
        },
        "hybridAudio": {
          "isSiteEnabled": false
        },
        'callInTeleconf': {
          'value': false,
          'selectedCallInTollType': 0,
          'toll': {
            'value': false
          },
          'tollFree': {
            'value': false
          },
          'teleconfViaGlobalCallIn': {
            'isSiteEnabled': false,
            'value': false
          },
          'teleCLIAuthEnabled': {
            'isSiteEnabled': false,
            'value': false
          }
        },
        'callBackTeleconf': {
          'isSiteEnabled': false,
          'value': false,
          'globalCallBackTeleconf': {
            'isSiteEnabled': false,
            'value': false
          }
        },
        'otherTeleconfServices': {
          'isSiteEnabled': false,
          'value': false
        },
        'integratedVoIP': {
          'isSiteEnabled': false,
          'value': false
        }
      },
      'videoSettings': {
        'hiQualVideo': {
          'isSiteEnabled': false,
          'value': false,
          'hiDefVideo': {
            'isSiteEnabled': false,
            'value': false
          }
        }
      },
      "meetingCenter": {
        "id": "MC",
        "serviceType": "MeetingCenter",
        "isSiteEnabled": false
      },
      "trainingCenter": {
        "id": "TC",
        "serviceType": "TrainingCenter",
        "isSiteEnabled": false,
        "handsOnLabAdmin": {
          "value": false,
          "isSiteEnabled": false
        }
      },
      "eventCenter": {
        "id": "EC",
        "serviceType": "EventCenter",
        "isSiteEnabled": false,
        "optimizeBandwidthUsage": {
          "isSiteEnabled": false,
          "value": false
        }
      },
      "supportCenter": {
        "id": "SC",
        "serviceType": "SupportCenter",
        "isSiteEnabled": false
      },
      'disableCancel2': false,
      'isT31Site': false
    };

    $provide.value('WebexUserSettingsSvc', WebexUserSettingsSvc);
    $provide.value('$stateParams', fakeStateParams);
  }));

  beforeEach(inject(function (
    _Notification_) {

    Notification = _Notification_;
    spyOn(Notification, 'notify');
  }));

  it('Does not allow PMR + CMR without callInTeleconf for non-T31 non-WebEx audio', inject(function (WebExUserSettingsFact) {
    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Allows PMR + CMR with callInTeleconf for non-T31 non-WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).not.toHaveBeenCalled();
  }));

  it('Does not allow PMR + CMR without callInTeleconf and without integrated voip for T31 non-WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.isT31Site = true;
    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Allows PMR + CMR with callInTeleconf for T31 non-WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;
    WebexUserSettingsSvc.isT31Site = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).not.toHaveBeenCalled();
  }));

  it('Allows PMR + CMR with integrated voip for T31 non-WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).not.toHaveBeenCalled();
  }));

  it('Does not allow PMR + CMR with integrated voip for non-T31 non-WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Allows PMR + CMR with integrated voip and callInTeleconf for T31 non-WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).not.toHaveBeenCalled();
  }));

  //-----

  it('Does not allow PMR + CMR without hybridAudio for T30 with WebexAudio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Does not allow PMR + CMR without hybridAudio for T31 with WebexAudio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  //-----

  it('Does not allow PMR + CMR with callInTeleconf without hybridAudio for non-T31 WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Does not allow PMR + CMR with callInTeleconf without hybridAudio for T31 WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;
    WebexUserSettingsSvc.isT31Site = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Does not allow PMR + CMR with integrated voip wihtout hybridAudio for T31 WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Does not allow PMR + CMR with integrated voip wihtout hybridAudio for non-T31 WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Does not allow PMR + CMR with with callInTeleconf with integrated voip for non-T31 WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Does not allow PMR + CMR with with callInTeleconf with integrated voip for T31 WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), "error");
  }));

  it('Allows PMR + CMR with integrated voip with callInTeleconf with hybrid audio for T31 WebEx audio', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).not.toHaveBeenCalled();
  }));

  ///------

  it('Allows PMR + CMR with WebexAudio and hybridAudio for T30', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;
    WebexUserSettingsSvc.telephonyPriviledge.hybridAudio.isSiteEnabled = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).not.toHaveBeenCalled();
  }));

  it('Allows PMR + CMR with WebexAudio and hybridAudio for T31', inject(function (WebExUserSettingsFact) {
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.callInTeleconf.value = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;
    WebexUserSettingsSvc.telephonyPriviledge.hybridAudio.isSiteEnabled = true;

    WebExUserSettingsFact.updateUserSettings2();
    expect(Notification.notify).not.toHaveBeenCalled();
  }));

  //----
  it('Allows PMR + CMR with WebexAudio but with hybridAudio and integratedVoIP for T31', inject(function () {
    WebexUserSettingsSvc.isT31Site = true;
    WebexUserSettingsSvc.telephonyPriviledge.telephonyType.isWebExAudio = true;
    WebexUserSettingsSvc.telephonyPriviledge.hybridAudio.isSiteEnabled = true;
    WebexUserSettingsSvc.telephonyPriviledge.integratedVoIP.value = true;

    expect(Notification.notify).not.toHaveBeenCalled();
  }));
}); // describe()
