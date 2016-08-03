/**
 * 
 */
'use strict';

describe('WebExApiGatewayService.csvConstructHttpsObj() test', function () {
  var expectedCsvHttpsObj;
  var csvConstructHttpsObj;

  var WebExApiGatewayConstsService, SessionStorage, $log;

  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function (
    _WebExApiGatewayConstsService_,
    _SessionStorage_,
    _$log_
  ) {

    WebExApiGatewayConstsService = _WebExApiGatewayConstsService_;
    SessionStorage = _SessionStorage_;
    $log = _$log_;

    WebExApiGatewayConstsService.csvAPIs = [{
        request: 'csvStatus',
        api: 'importexportstatus',
        method: 'GET',
        contentType: 'application/json;charset=utf-8'
      },

      {
        request: 'csvExport',
        api: 'export',
        method: 'POST',
        contentType: 'application/json;charset=utf-8'
      },

      {
        request: 'csvImport',
        api: 'import',
        method: 'POST',
        contentType: 'multipart/form-data;charset=utf-8'
      },

      {
        request: 'csvFileDownload',
        api: null,
        method: 'POST',
        contentType: 'application/json;charset=utf-8'
      },
    ];

    expectedCsvHttpsObj = null;
    csvConstructHttpsObj = null;

    spyOn(SessionStorage, 'get').and.returnValue('someFakeBearer');
  }));

  it('can construct https obj for csvStatus', inject(function (WebExApiGatewayService) {
    expectedCsvHttpsObj = {
      url: 'https://test.site.com/meetingsapi/v1/users/importexportstatus',
      method: 'GET',
      headers: {
        'Content-Type': 'multipart/form-data;charset=utf-8',
        'Authorization': 'Bearer someFakeBearer'
      }
    };

    csvConstructHttpsObj = WebExApiGatewayService.csvConstructHttpsObj(
      "test.site.com",
      "csvStatus"
    );

    expect(csvConstructHttpsObj.url).toEqual(expectedCsvHttpsObj.url);
    expect(csvConstructHttpsObj.method).toEqual(expectedCsvHttpsObj.method);
  }));

  it('can construct https obj for csvExport', inject(function (WebExApiGatewayService) {
    expectedCsvHttpsObj = {
      url: 'https://test.site.com/meetingsapi/v1/users/export',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Authorization': 'Bearer someFakeBearer'
      }
    };

    csvConstructHttpsObj = WebExApiGatewayService.csvConstructHttpsObj(
      "test.site.com",
      "csvExport"
    );

    expect(csvConstructHttpsObj.url).toEqual(expectedCsvHttpsObj.url);
    expect(csvConstructHttpsObj.method).toEqual(expectedCsvHttpsObj.method);
  }));

  it('can construct https obj for csvImport', inject(function (WebExApiGatewayService) {
    expectedCsvHttpsObj = {
      url: 'https://test.site.com/meetingsapi/v1/users/import',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data;charset=utf-8',
        'Authorization': 'Bearer someFakeBearer'
      }
    };

    csvConstructHttpsObj = WebExApiGatewayService.csvConstructHttpsObj(
      "test.site.com",
      "csvImport"
    );

    expect(csvConstructHttpsObj.url).toEqual(expectedCsvHttpsObj.url);
    expect(csvConstructHttpsObj.method).toEqual(expectedCsvHttpsObj.method);
    expect(csvConstructHttpsObj.headers).toEqual(expectedCsvHttpsObj.headers);
  }));
}); // describe()

describe('WebExApiGatewayService.csvStatus() and csvImport() tests', function () {
  var $q;
  var $rootScope;

  var deferredCsvApiRequest;

  var WebExApiGatewayConstsService;
  var WebExApiGatewayService;
  var WebExRestApiFact;

  var fakeCsvStatusHttpsObj = {
    url: 'https://test.site.com/meetingsapi/v1/users/csvStatus',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Authorization': 'Bearer someFakeBearer'
    }
  };

  var fakeViewModel = {
    'siteUrl': 'test.site.com',
    'siteRow': {
      'csvMock': {
        'mockImport': true
      }
    },
    'modal': {
      'file': 'Some file content'
    }
  };

  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(inject(function (
    _$q_,
    _$rootScope_,
    _WebExRestApiFact_,
    _WebExApiGatewayService_,
    _WebExApiGatewayConstsService_
  ) {

    $q = _$q_;
    $rootScope = _$rootScope_;

    WebExApiGatewayConstsService = _WebExApiGatewayConstsService_;
    WebExApiGatewayService = _WebExApiGatewayService_;
    WebExRestApiFact = _WebExRestApiFact_;

    WebExApiGatewayConstsService.csvRequests = {
      csvStatus: 'csvStatus',
      csvExport: 'csvExport',
      csvImport: 'csvImport',
      csvFileDownload: 'csvFileDownload'
    };

    WebExApiGatewayConstsService.csvAPIs = [{
        request: 'csvStatus',
        api: 'importexportstatus',
        method: 'GET',
        contentType: 'application/json;charset=utf-8'
      },

      {
        request: 'csvExport',
        api: 'export',
        method: 'POST',
        contentType: 'application/json;charset=utf-8'
      },

      {
        request: 'csvImport',
        api: 'import',
        method: 'POST',
        contentType: 'multipart/form-data;charset=utf-8'
      },

      {
        request: 'csvFileDownload',
        api: null,
        method: 'POST',
        contentType: 'application/json;charset=utf-8'
      },
    ];

    WebExApiGatewayConstsService.csvJobStatus = {
      statusQueued: 0,
      statusPreProcess: 1,
      statusCompleted: 2,
      statusInProcess: 3
    };

    WebExApiGatewayConstsService.csvStates = {
      none: 'none',
      exportInProgress: 'exportInProgress',
      exportCompletedNoErr: 'exportCompletedNoErr',
      exportCompletedWithErr: 'exportCompletedWithErr',
      importInProgress: 'importInProgress',
      importCompletedNoErr: 'importCompletedNoErr',
      importCompletedWithErr: 'importCompletedWithErr'
    };

    WebExApiGatewayConstsService.csvStatusTypes = [
      'none',
      'exportInProgress',
      'exportCompletedNoErr',
      'exportCompletedWithErr',
      'importInProgress',
      'importCompletedNoErr',
      'importCompletedWithErr'
    ]; // csvStatusTypes[]

    deferredCsvApiRequest = $q.defer();

    spyOn(WebExApiGatewayService, 'csvConstructHttpsObj').and.returnValue(fakeCsvStatusHttpsObj);
    spyOn(WebExApiGatewayService, 'webexCreateImportBlob');
    spyOn(WebExRestApiFact, 'csvApiRequest').and.returnValue(deferredCsvApiRequest.promise);
  }));

  it('can call webex import blob', function () {
    expect(WebExApiGatewayService).toBeDefined();
    expect(fakeViewModel).toBeDefined();

    WebExApiGatewayService.csvImport(fakeViewModel);

    expect(WebExApiGatewayService.webexCreateImportBlob).toHaveBeenCalled();
  });

  it('can return mock CSV status to be "none"', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.csvStatus(
      "test.site.com",
      true,
      WebExApiGatewayConstsService.csvStates.none
    ).then(

      function csvStatusReqSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.isMockResult).toEqual(true);
        expect(response.status).toEqual(WebExApiGatewayConstsService.csvStates.none);
        expect(response.details).not.toEqual(null);
      }, // csvStatusReqSuccess()

      function csvStatusReqError(response) {
        var dummy = null;
      } // csvStatusReqError()
    ); // WebExApiGatewayService.csvStatusReq().then()

    deferredCsvApiRequest.resolve({
      "jobType": 0,
    });
    $rootScope.$apply();
  }));

  it('can return mock CSV status to be "exportInProgress"', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.csvStatus(
      "test.site.com",
      true,
      WebExApiGatewayConstsService.csvStates.exportInProgress
    ).then(
      function csvStatusReqSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.isMockResult).toEqual(true);
        expect(response.status).toEqual(WebExApiGatewayConstsService.csvStates.exportInProgress);
        expect(response.details).not.toEqual(null);
      }, // csvStatusReqSuccess()

      function csvStatusReqError(response) {
        var dummy = null;
      } // csvStatusReqError()
    ); // WebExApiGatewayService.csvStatusReq().then()

    var fakeResult = {
      "jobType": 2,
      "request": 0
    };

    deferredCsvApiRequest.resolve(fakeResult);
    $rootScope.$apply();
  }));

  it('can return mock CSV status to be "exportCompletedNoErr"', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.csvStatus(
      "test.site.com",
      true,
      WebExApiGatewayConstsService.csvStates.exportCompletedNoErr
    ).then(
      function csvStatusReqSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.isMockResult).toEqual(true);
        expect(response.status).toEqual(WebExApiGatewayConstsService.csvStates.exportCompletedNoErr);
        expect(response.details).not.toEqual(null);
      }, // csvStatusReqSuccess()

      function csvStatusReqError(response) {
        var dummy = null;
      } // csvStatusReqError()
    ); // WebExApiGatewayService.csvStatusReq().then()

    var fakeResult = {
      "jobType": 2,
      "request": 2,
      "created": "03/23/16 12:41 AM",
      "started": "03/23/16 12:41 AM",
      "finished": "03/23/16 12:41 AM",
      "totalRecords": 5,
      "successRecords": 5,
      "failedRecords": 0,
      "exportFileLink": "http://sjsite14.webex.com/meetingsapi/v1/files/ODAyJSVjdnNmaWxl"
    };

    deferredCsvApiRequest.resolve(fakeResult);
    $rootScope.$apply();
  }));

  it('can return mock CSV status to be "exportCompletedWithErr"', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.csvStatus(
      "test.site.com",
      true,
      WebExApiGatewayConstsService.csvStates.exportCompletedWithErr
    ).then(
      function csvStatusReqSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.isMockResult).toEqual(true);
        expect(response.status).toEqual(WebExApiGatewayConstsService.csvStates.exportCompletedWithErr);
        expect(response.details).not.toEqual(null);
      }, // csvStatusReqSuccess()

      function csvStatusReqError(response) {
        var dummy = null;
      } // csvStatusReqError()
    ); // WebExApiGatewayService.csvStatusReq().then()

    var fakeResult = {
      "jobType": 2,
      "request": 2,
      "created": "03/23/16 12:41 AM",
      "started": "03/23/16 12:41 AM",
      "finished": "03/23/16 12:41 AM",
      "totalRecords": 5,
      "successRecords": 4,
      "failedRecords": 1,
      "exportFileLink": "http://sjsite14.webex.com/meetingsapi/v1/files/ODAyJSVjdnNmaWxl"
    };

    deferredCsvApiRequest.resolve(fakeResult);
    $rootScope.$apply();
  }));

  it('can return mock CSV status to be "importInProgress"', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.csvStatus(
      "test.site.com",
      true,
      WebExApiGatewayConstsService.csvStates.importInProgress
    ).then(
      function csvStatusReqSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.isMockResult).toEqual(true);
        expect(response.status).toEqual(WebExApiGatewayConstsService.csvStates.importInProgress);
        expect(response.details).not.toEqual(null);
      }, // csvStatusReqSuccess()

      function csvStatusReqError(response) {
        var dummy = null;
      } // csvStatusReqError()
    ); // WebExApiGatewayService.csvStatusReq().then()

    var fakeResult = {
      "jobType": 1,
      "request": 0,
    };

    deferredCsvApiRequest.resolve(fakeResult);
    $rootScope.$apply();
  }));

  it('can return mock CSV status to be "importCompletedNoErr"', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.csvStatus(
      "test.site.com",
      true,
      WebExApiGatewayConstsService.csvStates.importCompletedNoErr
    ).then(
      function csvStatusReqSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.isMockResult).toEqual(true);
        expect(response.status).toEqual(WebExApiGatewayConstsService.csvStates.importCompletedNoErr);
        expect(response.details).not.toEqual(null);
      }, // csvStatusReqSuccess()

      function csvStatusReqError(response) {
        var dummy = null;
      } // csvStatusReqError()
    ); // WebExApiGatewayService.csvStatusReq().then()

    var fakeResult = {
      "jobType": 1,
      "request": 2,
      "created": "03/23/16 12:41 AM",
      "started": "03/23/16 12:41 AM",
      "finished": "03/23/16 12:41 AM",
      "totalRecords": 5,
      "successRecords": 5,
      "failedRecords": 0
    };

    deferredCsvApiRequest.resolve(fakeResult);
    $rootScope.$apply();
  }));

  it('can return mock CSV status to be "importCompletedWithErr"', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.csvStatus(
      "test.site.com",
      true,
      WebExApiGatewayConstsService.csvStates.importCompletedWithErr
    ).then(
      function csvStatusReqSuccess(response) {
        expect(response).not.toEqual(null);
        expect(response.isMockResult).toEqual(true);
        expect(response.status).toEqual(WebExApiGatewayConstsService.csvStates.importCompletedWithErr);
        expect(response.details).not.toEqual(null);
      }, // csvStatusReqSuccess()

      function csvStatusReqError(response) {
        var dummy = null;
      } // csvStatusReqError()
    ); // WebExApiGatewayService.csvStatusReq().then()

    var fakeResult = {
      "jobType": 1,
      "request": 2,
      "errorLogLink": "http://sjsite14.webex.com/meetingsapi/v1/files/ODAyJSVjdnNmaWxl",
      "created": "03/23/16 12:41 AM",
      "started": "03/23/16 12:41 AM",
      "finished": "03/23/16 12:41 AM",
      "totalRecords": 5,
      "successRecords": 3,
      "failedRecords": 2
    };

    deferredCsvApiRequest.resolve(fakeResult);
    $rootScope.$apply();
  }));
}); // describe()

describe('WebExApiGatewayService.siteFunctions() test', function () {
  var $q;
  var $rootScope;

  var deferredSessionTicket;
  var deferredVersionXml;
  var deferredSiteInfoXml;
  var deferredEnableT30UnifiedAdminXml;

  var WebExXmlApiFact;

  var isIframeSupportedReleaseOrderXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ep="http://www.webex.com/schemas/2002/06/service/ep" xmlns:meet="http://www.webex.com/schemas/2002/06/service/meeting"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ep:getAPIVersionResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ep:apiVersion>WebEx XML API V10.0.0</ep:apiVersion><ep:trainReleaseVersion>T31L</ep:trainReleaseVersion><ep:trainReleaseOrder>400</ep:trainReleaseOrder></serv:bodyContent></serv:body></serv:message>';
  var isNotIframeSupportedReleaseOrderXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ep="http://www.webex.com/schemas/2002/06/service/ep" xmlns:meet="http://www.webex.com/schemas/2002/06/service/meeting"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ep:getAPIVersionResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ep:apiVersion>WebEx XML API V10.0.0</ep:apiVersion><ep:trainReleaseVersion>T31L</ep:trainReleaseVersion><ep:trainReleaseOrder>100</ep:trainReleaseOrder></serv:bodyContent></serv:body></serv:message>';
  var isNullIframeSupportedReleaseOrderXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:use="http://www.webex.com/schemas/2002/06/service/user"><serv:header><serv:response><serv:result>FAILURE</serv:result><serv:reason>ASService not responding</serv:reason><serv:gsbStatus>PRIMARY</serv:gsbStatus><serv:exceptionID>000035</serv:exceptionID></serv:response></serv:header><serv:body><serv:bodyContent/></serv:body></serv:message>';

  var isEnableT30UnfiedAdminXml = '<?xml version="1.0" encoding="ISO-8859-1"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ns1="http://www.webex.com/schemas/2002/06/service/site" xmlns:event="http://www.webex.com/schemas/2002/06/service/event"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ns1:getSiteAdminNavUrlResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ns1:enableT30UnifiedAdmin>true</ns1:enableT30UnifiedAdmin></serv:bodyContent> </serv:body></serv:message>';
  var isNotEnableT30UnfiedAdminXml = '<?xml version="1.0" encoding="ISO-8859-1"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ns1="http://www.webex.com/schemas/2002/06/service/site" xmlns:event="http://www.webex.com/schemas/2002/06/service/event"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ns1:getSiteAdminNavUrlResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ns1:enableT30UnifiedAdmin>false</ns1:enableT30UnifiedAdmin></serv:bodyContent> </serv:body></serv:message>';
  var isNullEnableT30UnfiedAdminXml = '<?xml version="1.0" encoding="ISO-8859-1"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ns1="http://www.webex.com/schemas/2002/06/service/site" xmlns:event="http://www.webex.com/schemas/2002/06/service/event"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ns1:getSiteAdminNavUrlResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"></serv:bodyContent> </serv:body></serv:message>';

  var isAdminReportEnabledXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ns1="http://www.webex.com/schemas/2002/06/service/site" xmlns:event="http://www.webex.com/schemas/2002/06/service/event"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ns1:getSiteResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ns1:siteInstance><ns1:metaData><ns1:isEnterprise>true</ns1:isEnterprise><ns1:serviceType>Meeting Center</ns1:serviceType><ns1:serviceType>Event Center</ns1:serviceType><ns1:serviceType>Training Center</ns1:serviceType><ns1:serviceType>Support Center</ns1:serviceType><ns1:meetingTypes><ns1:meetingTypeID>13</ns1:meetingTypeID><ns1:meetingTypeName>SC3</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:meetingTypes><ns1:meetingTypeID>14</ns1:meetingTypeID><ns1:meetingTypeName>SMT</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:meetingTypes><ns1:meetingTypeID>16</ns1:meetingTypeID><ns1:meetingTypeName>AUO</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:meetingTypes><ns1:meetingTypeID>214</ns1:meetingTypeID><ns1:meetingTypeName>PRO</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:meetingTypes><ns1:meetingTypeID>232</ns1:meetingTypeID><ns1:meetingTypeName>SC3</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:siteName>someSite</ns1:siteName><ns1:brandName>someSite</ns1:brandName><ns1:brandName>someSite-fr</ns1:brandName><ns1:brandName>someSite-sc</ns1:brandName><ns1:brandName>someSite-tc</ns1:brandName><ns1:region>U.S.</ns1:region><ns1:currency>US Dollars</ns1:currency><ns1:timeZoneID>4</ns1:timeZoneID><ns1:timeZone>GMT-08:00, Pacific (San Jose)</ns1:timeZone><ns1:parterID>Rk2K0zJmorXcSpTLRtn1wA</ns1:parterID><ns1:webDomain>sqwd</ns1:webDomain><ns1:meetingDomain>sqmd</ns1:meetingDomain><ns1:telephonyDomain>sqtd</ns1:telephonyDomain><ns1:pageVersion>T31L</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion><ns1:pageLanguage>ENGLISH</ns1:pageLanguage><ns1:activateStatus>true</ns1:activateStatus><ns1:webPageType>J2EE</ns1:webPageType><ns1:iCalendar>true</ns1:iCalendar><ns1:myWebExDefaultPage>My Meetings</ns1:myWebExDefaultPage><ns1:componentVersion>cmp3100</ns1:componentVersion><ns1:displayMeetingActualTime>false</ns1:displayMeetingActualTime><ns1:displayOffset>true</ns1:displayOffset><ns1:supportWebEx11>false</ns1:supportWebEx11></ns1:metaData><ns1:ucf><ns1:ucfConfiguration>No UCF</ns1:ucfConfiguration></ns1:ucf><ns1:clientPlatforms><ns1:msWindows>true</ns1:msWindows><ns1:macOS9>true</ns1:macOS9><ns1:macOSX>true</ns1:macOSX><ns1:sunSolaris>false</ns1:sunSolaris><ns1:linux>true</ns1:linux><ns1:hpUnix>false</ns1:hpUnix><ns1:java>true</ns1:java><ns1:palm>false</ns1:palm></ns1:clientPlatforms><ns1:resourceRestrictions><ns1:isLicenseManager>true</ns1:isLicenseManager><ns1:concurrentLicense>0</ns1:concurrentLicense><ns1:fileFolderCapacity>1000</ns1:fileFolderCapacity><ns1:maxConcurrentEvents>0</ns1:maxConcurrentEvents><ns1:archiveStorageLimit>0</ns1:archiveStorageLimit></ns1:resourceRestrictions><ns1:supportAPI><ns1:autoLogin>true</ns1:autoLogin><ns1:aspAndPHPAPI>true</ns1:aspAndPHPAPI><ns1:backwardAPI>false</ns1:backwardAPI><ns1:xmlAPI>true</ns1:xmlAPI><ns1:cAPI>false</ns1:cAPI><ns1:scorm>false</ns1:scorm></ns1:supportAPI><ns1:myWebExConfig><ns1:myContacts>false</ns1:myContacts><ns1:myProfile>false</ns1:myProfile><ns1:myMeetings>false</ns1:myMeetings><ns1:trainingRecordings>false</ns1:trainingRecordings><ns1:folders>false</ns1:folders><ns1:eventDocument>false</ns1:eventDocument><ns1:myReport>false</ns1:myReport><ns1:myComputer>false</ns1:myComputer><ns1:personalMeetingPage>false</ns1:personalMeetingPage><ns1:myFilesStorage>0</ns1:myFilesStorage><ns1:myComputerNumbers>0</ns1:myComputerNumbers><ns1:enableMyWebExPro>true</ns1:enableMyWebExPro><ns1:myWebExProMaxHosts>999999</ns1:myWebExProMaxHosts><ns1:restrictAccessAnyApps>false</ns1:restrictAccessAnyApps><ns1:restrictAccessAnyAppsNum>0</ns1:restrictAccessAnyAppsNum><ns1:addlAccessAnyComputersLimit>STRICT</ns1:addlAccessAnyComputersLimit><ns1:addlAccessAnyComputers>0</ns1:addlAccessAnyComputers><ns1:addlStorageLimit>STRICT</ns1:addlStorageLimit><ns1:addlStorage>0</ns1:addlStorage><ns1:myContactsPro>true</ns1:myContactsPro><ns1:myProfilePro>true</ns1:myProfilePro><ns1:myMeetingsPro>true</ns1:myMeetingsPro><ns1:trainingRecordingsPro>true</ns1:trainingRecordingsPro><ns1:foldersPro>true</ns1:foldersPro><ns1:eventDocumentPro>true</ns1:eventDocumentPro><ns1:myReportPro>true</ns1:myReportPro><ns1:myComputerPro>false</ns1:myComputerPro><ns1:personalMeetingPagePro>true</ns1:personalMeetingPagePro><ns1:myFilesStoragePro>1000</ns1:myFilesStoragePro><ns1:myComputerNumbersPro>0</ns1:myComputerNumbersPro><ns1:PMRheaderBranding>false</ns1:PMRheaderBranding></ns1:myWebExConfig><ns1:telephonyConfig><ns1:isTSPUsingTelephonyAPI>false</ns1:isTSPUsingTelephonyAPI><ns1:serviceName>Personal Conference No.</ns1:serviceName><ns1:participantAccessCodeLabel>Attendee access code</ns1:participantAccessCodeLabel><ns1:subscriberAccessCodeLabel>Host access code</ns1:subscriberAccessCodeLabel><ns1:attendeeIDLabel>Attendee ID</ns1:attendeeIDLabel><ns1:internetPhone>true</ns1:internetPhone><ns1:supportCallInTypeTeleconf>true</ns1:supportCallInTypeTeleconf><ns1:callInTeleconferencing>true</ns1:callInTeleconferencing><ns1:tollFreeCallinTeleconferencing>true</ns1:tollFreeCallinTeleconferencing><ns1:intlCallInTeleconferencing>true</ns1:intlCallInTeleconferencing><ns1:callBackTeleconferencing>true</ns1:callBackTeleconferencing><ns1:callInNumber>1</ns1:callInNumber><ns1:defaultTeleServerSubject>173.36.202.189</ns1:defaultTeleServerSubject><ns1:subscribeName>QA</ns1:subscribeName><ns1:subscribePassword>pass</ns1:subscribePassword><ns1:defaultPhoneLines>10</ns1:defaultPhoneLines><ns1:defaultSpeakingLines>10</ns1:defaultSpeakingLines><ns1:majorCountryCode>1</ns1:majorCountryCode><ns1:majorAreaCode>408</ns1:majorAreaCode><ns1:publicName>Call-in User</ns1:publicName><ns1:hybridTeleconference>true</ns1:hybridTeleconference><ns1:instantHelp>false</ns1:instantHelp><ns1:customerManage>false</ns1:customerManage><ns1:maxCallersNumber>500</ns1:maxCallersNumber><ns1:isSpecified>false</ns1:isSpecified><ns1:isContinue>false</ns1:isContinue><ns1:intlCallBackTeleconferencing>true</ns1:intlCallBackTeleconferencing><ns1:personalTeleconf><ns1:primaryLargeServer><serv:tollNum>14085452906</serv:tollNum><serv:tollFreeNum>14085452907</serv:tollFreeNum><serv:enableServer>true</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:primaryLargeServer><ns1:backup1LargeServer><serv:tollNum> </serv:tollNum><serv:tollFreeNum> </serv:tollFreeNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup1LargeServer><ns1:backup2LargeServer><serv:tollNum> </serv:tollNum><serv:tollFreeNum> </serv:tollFreeNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Backup call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Backup call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup2LargeServer><ns1:primarySmallServer><serv:tollNum> </serv:tollNum><serv:tollFreeNum> </serv:tollFreeNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:primarySmallServer><ns1:backup1SmallServer><serv:tollNum> </serv:tollNum><serv:tollFreeNum> </serv:tollFreeNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup1SmallServer><ns1:backup2SmallServer><serv:tollNum> </serv:tollNum><serv:tollFreeNum> </serv:tollFreeNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Backup call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Backup call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup2SmallServer><ns1:joinBeforeHost>false</ns1:joinBeforeHost></ns1:personalTeleconf><ns1:multiMediaPlatform>true</ns1:multiMediaPlatform><ns1:multiMediaHostName>http://msq1mcccl01.qa.webex.com</ns1:multiMediaHostName><ns1:broadcastAudioStream>true</ns1:broadcastAudioStream><ns1:tspAdaptorSettings><ns1:primaryLarge><ns1:enableAdaptor>false</ns1:enableAdaptor><ns1:serverIP></ns1:serverIP><ns1:mpAudio><ns1:label>Call-in numbernull</ns1:label></ns1:mpAudio><ns1:mpAudio><ns1:label>Call-in toll-free numbernull</ns1:label></ns1:mpAudio></ns1:primaryLarge><ns1:backup1Large><ns1:enableAdaptor>false</ns1:enableAdaptor><ns1:serverIP></ns1:serverIP><ns1:mpAudio><ns1:label>Call-in numbernull</ns1:label></ns1:mpAudio><ns1:mpAudio><ns1:label>Call-in toll-free numbernull</ns1:label></ns1:mpAudio></ns1:backup1Large><ns1:backup2Large><ns1:enableAdaptor>false</ns1:enableAdaptor><ns1:serverIP></ns1:serverIP><ns1:mpAudio><ns1:label>Call-in numbernull</ns1:label></ns1:mpAudio><ns1:mpAudio><ns1:label>Call-in toll-free numbernull</ns1:label></ns1:mpAudio></ns1:backup2Large></ns1:tspAdaptorSettings><ns1:meetingPlace><ns1:persistentTSP>false</ns1:persistentTSP><ns1:mpAudioConferencing>WithoutIntegration</ns1:mpAudioConferencing></ns1:meetingPlace><ns1:supportOtherTypeTeleconf>true</ns1:supportOtherTypeTeleconf><ns1:otherTeleServiceName>Other teleconference service</ns1:otherTeleServiceName><ns1:supportAdapterlessTSP>false</ns1:supportAdapterlessTSP><ns1:displayAttendeeID>false</ns1:displayAttendeeID><ns1:provisionTeleAccount>true</ns1:provisionTeleAccount><ns1:choosePCN>false</ns1:choosePCN><ns1:audioOnly>true</ns1:audioOnly><ns1:configTollAndTollFreeNum>true</ns1:configTollAndTollFreeNum><ns1:configPrimaryTS>false</ns1:configPrimaryTS><ns1:teleCLIAuthEnabled>true</ns1:teleCLIAuthEnabled><ns1:teleCLIPINEnabled>false</ns1:teleCLIPINEnabled></ns1:telephonyConfig><ns1:commerceAndReporting><ns1:trackingCode>false</ns1:trackingCode><ns1:siteAdminReport>true</ns1:siteAdminReport><ns1:subScriptionService>false</ns1:subScriptionService><ns1:isECommmerce>false</ns1:isECommmerce><ns1:customereCommerce>false</ns1:customereCommerce><ns1:isLocalTax>false</ns1:isLocalTax><ns1:localTaxName>VAT</ns1:localTaxName><ns1:localTaxtRate>0.0</ns1:localTaxtRate><ns1:holReport>0</ns1:holReport></ns1:commerceAndReporting><ns1:tools><ns1:businessDirectory>false</ns1:businessDirectory><ns1:officeCalendar>false</ns1:officeCalendar><ns1:meetingCalendar>true</ns1:meetingCalendar><ns1:displayOnCallAssistLink>false</ns1:displayOnCallAssistLink><ns1:displayProfileLink>true</ns1:displayProfileLink><ns1:recordingAndPlayback>true</ns1:recordingAndPlayback><ns1:recordingEditor>true</ns1:recordingEditor><ns1:publishRecordings>false</ns1:publishRecordings><ns1:instantMeeting>true</ns1:instantMeeting><ns1:emails>false</ns1:emails><ns1:outlookIntegration>true</ns1:outlookIntegration><ns1:wirelessAccess>true</ns1:wirelessAccess><ns1:allowPublicAccess>true</ns1:allowPublicAccess><ns1:ssl>true</ns1:ssl><ns1:handsOnLab>true</ns1:handsOnLab><ns1:holMaxLabs>999999</ns1:holMaxLabs><ns1:holMaxComputers>999999</ns1:holMaxComputers><ns1:userLockDown>false</ns1:userLockDown><ns1:meetingAssist>false</ns1:meetingAssist><ns1:sms>false</ns1:sms><ns1:encryption>NONE</ns1:encryption><ns1:internalMeeting>false</ns1:internalMeeting><ns1:enableTP>false</ns1:enableTP><ns1:enableTPplus>false</ns1:enableTPplus></ns1:tools><ns1:custCommunications><ns1:displayType><ns1:prodSvcAnnounce>false</ns1:prodSvcAnnounce><ns1:trainingInfo>false</ns1:trainingInfo><ns1:eNewsletters>false</ns1:eNewsletters><ns1:promotionsOffers>false</ns1:promotionsOffers><ns1:pressReleases>false</ns1:pressReleases></ns1:displayType><ns1:displayMethod><ns1:email>false</ns1:email><ns1:fax>false</ns1:fax><ns1:phone>false</ns1:phone><ns1:mail>false</ns1:mail></ns1:displayMethod></ns1:custCommunications><ns1:trackingCodes/><ns1:supportedServices><ns1:meetingCenter><ns1:enabled>true</ns1:enabled><ns1:pageVersion>mc3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion></ns1:meetingCenter><ns1:trainingCenter><ns1:enabled>true</ns1:enabled><ns1:pageVersion>tc3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion></ns1:trainingCenter><ns1:supportCenter><ns1:enabled>true</ns1:enabled><ns1:pageVersion>sc3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion><ns1:webACD>true</ns1:webACD></ns1:supportCenter><ns1:eventCenter><ns1:enabled>true</ns1:enabled><ns1:pageVersion>ec3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion><ns1:marketingAddOn>true</ns1:marketingAddOn><ns1:optimizeAttendeeBandwidthUsage>false</ns1:optimizeAttendeeBandwidthUsage></ns1:eventCenter><ns1:salesCenter><ns1:enabled>false</ns1:enabled><ns1:pageVersion>sac3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion></ns1:salesCenter></ns1:supportedServices><ns1:securityOptions><ns1:passwordExpires>false</ns1:passwordExpires><ns1:passwordLifetime>0</ns1:passwordLifetime><ns1:allMeetingsUnlisted>false</ns1:allMeetingsUnlisted><ns1:allMeetingsPassword>true</ns1:allMeetingsPassword><ns1:joinBeforeHost>false</ns1:joinBeforeHost><ns1:audioBeforeHost>true</ns1:audioBeforeHost><ns1:changePersonalURL>true</ns1:changePersonalURL><ns1:changeUserName>false</ns1:changeUserName><ns1:meetings><ns1:strictPasswords>true</ns1:strictPasswords></ns1:meetings><ns1:strictUserPassword>true</ns1:strictUserPassword><ns1:accountNotify>false</ns1:accountNotify><ns1:requireLoginBeforeSiteAccess>false</ns1:requireLoginBeforeSiteAccess><ns1:changePWDWhenAutoLogin>false</ns1:changePWDWhenAutoLogin><ns1:enforceBaseline>true</ns1:enforceBaseline><ns1:passwordChangeIntervalOpt>false</ns1:passwordChangeIntervalOpt><ns1:passwordChangeInterval>24</ns1:passwordChangeInterval><ns1:firstAttendeeAsPresenter>false</ns1:firstAttendeeAsPresenter><ns1:isEnableUUIDLink>true</ns1:isEnableUUIDLink><ns1:isEnableUUIDLinkForSAC>false</ns1:isEnableUUIDLinkForSAC></ns1:securityOptions><ns1:defaults><ns1:emailReminders>true</ns1:emailReminders><ns1:entryExitTone>BEEP</ns1:entryExitTone><ns1:voip>true</ns1:voip><ns1:teleconference><ns1:telephonySupport>CALLIN</ns1:telephonySupport><ns1:tollFree>true</ns1:tollFree><ns1:intlLocalCallIn>true</ns1:intlLocalCallIn></ns1:teleconference><ns1:joinTeleconfNotPress1>false</ns1:joinTeleconfNotPress1><ns1:updateTSPAccount>false</ns1:updateTSPAccount></ns1:defaults><ns1:scheduleMeetingOptions><ns1:scheduleOnBehalf>true</ns1:scheduleOnBehalf><ns1:saveSessionTemplate>true</ns1:saveSessionTemplate></ns1:scheduleMeetingOptions><ns1:navBarTop><ns1:button><ns1:order>1</ns1:order><ns1:serviceName>Welcome</ns1:serviceName></ns1:button><ns1:button><ns1:order>2</ns1:order><ns1:enabled>true</ns1:enabled><ns1:serviceName>Meeting Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>3</ns1:order><ns1:enabled>true</ns1:enabled><ns1:serviceName>Event Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>4</ns1:order><ns1:enabled>false</ns1:enabled><ns1:serviceName>Sales Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>5</ns1:order><ns1:enabled>true</ns1:enabled><ns1:serviceName>Support Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>6</ns1:order><ns1:enabled>true</ns1:enabled><ns1:serviceName>Training Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>7</ns1:order><ns1:serviceName>Site Administration</ns1:serviceName></ns1:button><ns1:button><ns1:order>8</ns1:order><ns1:enabled>false</ns1:enabled><ns1:serviceName>Presentation Studio</ns1:serviceName></ns1:button><ns1:displayDisabledService>false</ns1:displayDisabledService></ns1:navBarTop><ns1:navMyWebEx><ns1:customLinks><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink></ns1:customLinks><ns1:partnerLinks><ns1:partnerLink><ns1:target>NEW</ns1:target></ns1:partnerLink><ns1:partnerLink><ns1:target>NEW</ns1:target></ns1:partnerLink><ns1:partnerLink><ns1:target>NEW</ns1:target></ns1:partnerLink></ns1:partnerLinks><ns1:partnerIntegration>true</ns1:partnerIntegration><ns1:support><ns1:target>NEW</ns1:target></ns1:support><ns1:training><ns1:target>NEW</ns1:target></ns1:training></ns1:navMyWebEx><ns1:navAllServices><ns1:customLinks><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink></ns1:customLinks><ns1:support><ns1:name>Support</ns1:name><ns1:target>NEW</ns1:target></ns1:support><ns1:training><ns1:name>Training</ns1:name><ns1:target>NEW</ns1:target></ns1:training><ns1:supportMenu><ns1:userGuides><ns1:target>NEW</ns1:target></ns1:userGuides><ns1:downloads><ns1:target>NEW</ns1:target></ns1:downloads><ns1:training><ns1:target>NEW</ns1:target></ns1:training><ns1:contactUs><ns1:target>NEW</ns1:target></ns1:contactUs><ns1:supportMyResources>true</ns1:supportMyResources></ns1:supportMenu></ns1:navAllServices><ns1:passwordCriteria><ns1:mixedCase>false</ns1:mixedCase><ns1:minLength>4</ns1:minLength><ns1:minAlpha>0</ns1:minAlpha><ns1:minNumeric>0</ns1:minNumeric><ns1:minSpecial>0</ns1:minSpecial><ns1:disallowWebTextSessions>true</ns1:disallowWebTextSessions><ns1:disallowWebTextAccounts>true</ns1:disallowWebTextAccounts><ns1:disallowList>true</ns1:disallowList><ns1:disallowValue>password</ns1:disallowValue><ns1:disallowValue>passwd</ns1:disallowValue><ns1:disallowValue>pass</ns1:disallowValue></ns1:passwordCriteria><ns1:accountPasswordCriteria><ns1:mixedCase>true</ns1:mixedCase><ns1:minLength>8</ns1:minLength><ns1:minNumeric>1</ns1:minNumeric><ns1:minAlpha>2</ns1:minAlpha><ns1:minSpecial>0</ns1:minSpecial><ns1:disallow3XRepeatedChar>false</ns1:disallow3XRepeatedChar><ns1:disallowWebTextAccounts>true</ns1:disallowWebTextAccounts><ns1:disallowList>true</ns1:disallowList><ns1:disallowValue>password</ns1:disallowValue><ns1:disallowValue>passwd</ns1:disallowValue><ns1:disallowValue>pass</ns1:disallowValue><ns1:disallowValue>webex</ns1:disallowValue><ns1:disallowValue>cisco</ns1:disallowValue><ns1:disallowValue>xebew</ns1:disallowValue><ns1:disallowValue>ocsic</ns1:disallowValue></ns1:accountPasswordCriteria><ns1:productivityTools><ns1:enable>true</ns1:enable><ns1:installOpts><ns1:autoUpdate>false</ns1:autoUpdate></ns1:installOpts><ns1:integrations><ns1:outlook>true</ns1:outlook><ns1:outlookForMac>true</ns1:outlookForMac><ns1:lotusNotes>false</ns1:lotusNotes><ns1:oneClick>false</ns1:oneClick><ns1:showSysTrayIcon>false</ns1:showSysTrayIcon><ns1:office>false</ns1:office><ns1:excel>false</ns1:excel><ns1:powerPoint>false</ns1:powerPoint><ns1:word>false</ns1:word><ns1:IE>false</ns1:IE><ns1:firefox>false</ns1:firefox><ns1:explorerRightClick>false</ns1:explorerRightClick><ns1:instantMessenger>false</ns1:instantMessenger><ns1:aolMessenger>false</ns1:aolMessenger><ns1:googleTalk>false</ns1:googleTalk><ns1:lotusSametime>false</ns1:lotusSametime><ns1:skype>false</ns1:skype><ns1:windowsMessenger>false</ns1:windowsMessenger><ns1:yahooMessenger>false</ns1:yahooMessenger><ns1:ciscoIPPhone>false</ns1:ciscoIPPhone><ns1:pcNow>false</ns1:pcNow><ns1:iGoogle>false</ns1:iGoogle><ns1:iPhoneDusting>false</ns1:iPhoneDusting></ns1:integrations><ns1:oneClick><ns1:allowJoinUnlistMeeting>true</ns1:allowJoinUnlistMeeting><ns1:requireApproveJoin>false</ns1:requireApproveJoin></ns1:oneClick><ns1:templates><ns1:useTemplate>false</ns1:useTemplate></ns1:templates><ns1:lockDownPT><ns1:lockDown>false</ns1:lockDown></ns1:lockDownPT><ns1:imSettings><ns1:attendeeInviteOther>false</ns1:attendeeInviteOther></ns1:imSettings></ns1:productivityTools><ns1:meetingPlace/><ns1:salesCenter><ns1:allowJoinWithoutLogin>false</ns1:allowJoinWithoutLogin></ns1:salesCenter><ns1:connectIntegration><ns1:integratedWebEx11>false</ns1:integratedWebEx11></ns1:connectIntegration><ns1:video><ns1:HQvideo>true</ns1:HQvideo><ns1:maxBandwidth>LOW</ns1:maxBandwidth><ns1:HDvideo>false</ns1:HDvideo></ns1:video><ns1:siteCommonOptions><ns1:SupportCustomDialRestriction>false</ns1:SupportCustomDialRestriction><ns1:SupportTelePresence>false</ns1:SupportTelePresence><ns1:SupportTelePresencePlus>false</ns1:SupportTelePresencePlus><ns1:EnableCloudTelepresence>false</ns1:EnableCloudTelepresence><ns1:enablePersonalMeetingRoom>true</ns1:enablePersonalMeetingRoom></ns1:siteCommonOptions><ns1:samlSSO><ns1:enableSSO>false</ns1:enableSSO><ns1:autoAccountCreation>false</ns1:autoAccountCreation></ns1:samlSSO></ns1:siteInstance></serv:bodyContent></serv:body></serv:message>';
  var isNotAdminReportEnabledXml = '<?xml version="1.0" encoding="UTF-8"?><serv:message xmlns:serv="http://www.webex.com/schemas/2002/06/service" xmlns:com="http://www.webex.com/schemas/2002/06/common" xmlns:ns1="http://www.webex.com/schemas/2002/06/service/site" xmlns:event="http://www.webex.com/schemas/2002/06/service/event"><serv:header><serv:response><serv:result>SUCCESS</serv:result><serv:gsbStatus>PRIMARY</serv:gsbStatus></serv:response></serv:header><serv:body><serv:bodyContent xsi:type="ns1:getSiteResponse" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><ns1:siteInstance><ns1:metaData><ns1:isEnterprise>true</ns1:isEnterprise><ns1:serviceType>Meeting Center</ns1:serviceType><ns1:serviceType>Event Center</ns1:serviceType><ns1:serviceType>Training Center</ns1:serviceType><ns1:serviceType>Support Center</ns1:serviceType><ns1:meetingTypes><ns1:meetingTypeID>13</ns1:meetingTypeID><ns1:meetingTypeName>SC3</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:meetingTypes><ns1:meetingTypeID>14</ns1:meetingTypeID><ns1:meetingTypeName>SMT</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:meetingTypes><ns1:meetingTypeID>16</ns1:meetingTypeID><ns1:meetingTypeName>AUO</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:meetingTypes><ns1:meetingTypeID>214</ns1:meetingTypeID><ns1:meetingTypeName>PRO</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:meetingTypes><ns1:meetingTypeID>232</ns1:meetingTypeID><ns1:meetingTypeName>SC3</ns1:meetingTypeName><ns1:hideInScheduler>false</ns1:hideInScheduler></ns1:meetingTypes><ns1:siteName>someSite</ns1:siteName><ns1:brandName>someSite</ns1:brandName><ns1:brandName>someSite-fr</ns1:brandName><ns1:brandName>someSite-sc</ns1:brandName><ns1:brandName>someSite-tc</ns1:brandName><ns1:region>U.S.</ns1:region><ns1:currency>US Dollars</ns1:currency><ns1:timeZoneID>4</ns1:timeZoneID><ns1:timeZone>GMT-08:00, Pacific (San Jose)</ns1:timeZone><ns1:parterID>Rk2K0zJmorXcSpTLRtn1wA</ns1:parterID><ns1:webDomain>sqwd</ns1:webDomain><ns1:meetingDomain>sqmd</ns1:meetingDomain><ns1:telephonyDomain>sqtd</ns1:telephonyDomain><ns1:pageVersion>T31L</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion><ns1:pageLanguage>ENGLISH</ns1:pageLanguage><ns1:activateStatus>true</ns1:activateStatus><ns1:webPageType>J2EE</ns1:webPageType><ns1:iCalendar>true</ns1:iCalendar><ns1:myWebExDefaultPage>My Meetings</ns1:myWebExDefaultPage><ns1:componentVersion>cmp3100</ns1:componentVersion><ns1:displayMeetingActualTime>false</ns1:displayMeetingActualTime><ns1:displayOffset>true</ns1:displayOffset><ns1:supportWebEx11>false</ns1:supportWebEx11></ns1:metaData><ns1:ucf><ns1:ucfConfiguration>No UCF</ns1:ucfConfiguration></ns1:ucf><ns1:clientPlatforms><ns1:msWindows>true</ns1:msWindows><ns1:macOS9>true</ns1:macOS9><ns1:macOSX>true</ns1:macOSX><ns1:sunSolaris>false</ns1:sunSolaris><ns1:linux>true</ns1:linux><ns1:hpUnix>false</ns1:hpUnix><ns1:java>true</ns1:java><ns1:palm>false</ns1:palm></ns1:clientPlatforms><ns1:resourceRestrictions><ns1:isLicenseManager>true</ns1:isLicenseManager><ns1:concurrentLicense>0</ns1:concurrentLicense><ns1:fileFolderCapacity>1000</ns1:fileFolderCapacity><ns1:maxConcurrentEvents>0</ns1:maxConcurrentEvents><ns1:archiveStorageLimit>0</ns1:archiveStorageLimit></ns1:resourceRestrictions><ns1:supportAPI><ns1:autoLogin>true</ns1:autoLogin><ns1:aspAndPHPAPI>true</ns1:aspAndPHPAPI><ns1:backwardAPI>false</ns1:backwardAPI><ns1:xmlAPI>true</ns1:xmlAPI><ns1:cAPI>false</ns1:cAPI><ns1:scorm>false</ns1:scorm></ns1:supportAPI><ns1:myWebExConfig><ns1:myContacts>false</ns1:myContacts><ns1:myProfile>false</ns1:myProfile><ns1:myMeetings>false</ns1:myMeetings><ns1:trainingRecordings>false</ns1:trainingRecordings><ns1:folders>false</ns1:folders><ns1:eventDocument>false</ns1:eventDocument><ns1:myReport>false</ns1:myReport><ns1:myComputer>false</ns1:myComputer><ns1:personalMeetingPage>false</ns1:personalMeetingPage><ns1:myFilesStorage>0</ns1:myFilesStorage><ns1:myComputerNumbers>0</ns1:myComputerNumbers><ns1:enableMyWebExPro>true</ns1:enableMyWebExPro><ns1:myWebExProMaxHosts>999999</ns1:myWebExProMaxHosts><ns1:restrictAccessAnyApps>false</ns1:restrictAccessAnyApps><ns1:restrictAccessAnyAppsNum>0</ns1:restrictAccessAnyAppsNum><ns1:addlAccessAnyComputersLimit>STRICT</ns1:addlAccessAnyComputersLimit><ns1:addlAccessAnyComputers>0</ns1:addlAccessAnyComputers><ns1:addlStorageLimit>STRICT</ns1:addlStorageLimit><ns1:addlStorage>0</ns1:addlStorage><ns1:myContactsPro>true</ns1:myContactsPro><ns1:myProfilePro>true</ns1:myProfilePro><ns1:myMeetingsPro>true</ns1:myMeetingsPro><ns1:trainingRecordingsPro>true</ns1:trainingRecordingsPro><ns1:foldersPro>true</ns1:foldersPro><ns1:eventDocumentPro>true</ns1:eventDocumentPro><ns1:myReportPro>true</ns1:myReportPro><ns1:myComputerPro>false</ns1:myComputerPro><ns1:personalMeetingPagePro>true</ns1:personalMeetingPagePro><ns1:myFilesStoragePro>1000</ns1:myFilesStoragePro><ns1:myComputerNumbersPro>0</ns1:myComputerNumbersPro><ns1:PMRheaderBranding>false</ns1:PMRheaderBranding></ns1:myWebExConfig><ns1:telephonyConfig><ns1:isTSPUsingTelephonyAPI>false</ns1:isTSPUsingTelephonyAPI><ns1:serviceName>Personal Conference No.</ns1:serviceName><ns1:participantAccessCodeLabel>Attendee access code</ns1:participantAccessCodeLabel><ns1:subscriberAccessCodeLabel>Host access code</ns1:subscriberAccessCodeLabel><ns1:attendeeIDLabel>Attendee ID</ns1:attendeeIDLabel><ns1:internetPhone>true</ns1:internetPhone><ns1:supportCallInTypeTeleconf>true</ns1:supportCallInTypeTeleconf><ns1:callInTeleconferencing>true</ns1:callInTeleconferencing><ns1:tollFreeCallinTeleconferencing>true</ns1:tollFreeCallinTeleconferencing><ns1:intlCallInTeleconferencing>true</ns1:intlCallInTeleconferencing><ns1:callBackTeleconferencing>true</ns1:callBackTeleconferencing><ns1:callInNumber>1</ns1:callInNumber><ns1:defaultTeleServerSubject>173.36.202.189</ns1:defaultTeleServerSubject><ns1:subscribeName>QA</ns1:subscribeName><ns1:subscribePassword>pass</ns1:subscribePassword><ns1:defaultPhoneLines>10</ns1:defaultPhoneLines><ns1:defaultSpeakingLines>10</ns1:defaultSpeakingLines><ns1:majorCountryCode>1</ns1:majorCountryCode><ns1:majorAreaCode>408</ns1:majorAreaCode><ns1:publicName>Call-in User</ns1:publicName><ns1:hybridTeleconference>true</ns1:hybridTeleconference><ns1:instantHelp>false</ns1:instantHelp><ns1:customerManage>false</ns1:customerManage><ns1:maxCallersNumber>500</ns1:maxCallersNumber><ns1:isSpecified>false</ns1:isSpecified><ns1:isContinue>false</ns1:isContinue><ns1:intlCallBackTeleconferencing>true</ns1:intlCallBackTeleconferencing><ns1:personalTeleconf><ns1:primaryLargeServer><serv:tollNum>14085452906</serv:tollNum><serv:tollFreeNum>14085452907</serv:tollFreeNum><serv:enableServer>true</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:primaryLargeServer><ns1:backup1LargeServer><serv:tollNum> </serv:tollNum><serv:tollFreeNum> </serv:tollFreeNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup1LargeServer><ns1:backup2LargeServer><serv:tollNum> </serv:tollNum><serv:tollFreeNum> </serv:tollFreeNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Backup call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Backup call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup2LargeServer><ns1:primarySmallServer><serv:tollNum> </serv:tollNum><serv:tollFreeNum> </serv:tollFreeNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:primarySmallServer><ns1:backup1SmallServer><serv:tollNum> </serv:tollNum><serv:tollFreeNum> </serv:tollFreeNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup1SmallServer><ns1:backup2SmallServer><serv:tollNum> </serv:tollNum><serv:tollFreeNum> </serv:tollFreeNum><serv:enableServer>false</serv:enableServer><serv:tollLabel>Backup call-in toll number (US/Canada)</serv:tollLabel><serv:tollFreeLabel>Backup call-in toll-free number (US/Canada)</serv:tollFreeLabel></ns1:backup2SmallServer><ns1:joinBeforeHost>false</ns1:joinBeforeHost></ns1:personalTeleconf><ns1:multiMediaPlatform>true</ns1:multiMediaPlatform><ns1:multiMediaHostName>http://msq1mcccl01.qa.webex.com</ns1:multiMediaHostName><ns1:broadcastAudioStream>true</ns1:broadcastAudioStream><ns1:tspAdaptorSettings><ns1:primaryLarge><ns1:enableAdaptor>false</ns1:enableAdaptor><ns1:serverIP></ns1:serverIP><ns1:mpAudio><ns1:label>Call-in numbernull</ns1:label></ns1:mpAudio><ns1:mpAudio><ns1:label>Call-in toll-free numbernull</ns1:label></ns1:mpAudio></ns1:primaryLarge><ns1:backup1Large><ns1:enableAdaptor>false</ns1:enableAdaptor><ns1:serverIP></ns1:serverIP><ns1:mpAudio><ns1:label>Call-in numbernull</ns1:label></ns1:mpAudio><ns1:mpAudio><ns1:label>Call-in toll-free numbernull</ns1:label></ns1:mpAudio></ns1:backup1Large><ns1:backup2Large><ns1:enableAdaptor>false</ns1:enableAdaptor><ns1:serverIP></ns1:serverIP><ns1:mpAudio><ns1:label>Call-in numbernull</ns1:label></ns1:mpAudio><ns1:mpAudio><ns1:label>Call-in toll-free numbernull</ns1:label></ns1:mpAudio></ns1:backup2Large></ns1:tspAdaptorSettings><ns1:meetingPlace><ns1:persistentTSP>false</ns1:persistentTSP><ns1:mpAudioConferencing>WithoutIntegration</ns1:mpAudioConferencing></ns1:meetingPlace><ns1:supportOtherTypeTeleconf>true</ns1:supportOtherTypeTeleconf><ns1:otherTeleServiceName>Other teleconference service</ns1:otherTeleServiceName><ns1:supportAdapterlessTSP>false</ns1:supportAdapterlessTSP><ns1:displayAttendeeID>false</ns1:displayAttendeeID><ns1:provisionTeleAccount>true</ns1:provisionTeleAccount><ns1:choosePCN>false</ns1:choosePCN><ns1:audioOnly>true</ns1:audioOnly><ns1:configTollAndTollFreeNum>true</ns1:configTollAndTollFreeNum><ns1:configPrimaryTS>false</ns1:configPrimaryTS><ns1:teleCLIAuthEnabled>true</ns1:teleCLIAuthEnabled><ns1:teleCLIPINEnabled>false</ns1:teleCLIPINEnabled></ns1:telephonyConfig><ns1:commerceAndReporting><ns1:trackingCode>false</ns1:trackingCode><ns1:siteAdminReport>false</ns1:siteAdminReport><ns1:subScriptionService>false</ns1:subScriptionService><ns1:isECommmerce>false</ns1:isECommmerce><ns1:customereCommerce>false</ns1:customereCommerce><ns1:isLocalTax>false</ns1:isLocalTax><ns1:localTaxName>VAT</ns1:localTaxName><ns1:localTaxtRate>0.0</ns1:localTaxtRate><ns1:holReport>0</ns1:holReport></ns1:commerceAndReporting><ns1:tools><ns1:businessDirectory>false</ns1:businessDirectory><ns1:officeCalendar>false</ns1:officeCalendar><ns1:meetingCalendar>true</ns1:meetingCalendar><ns1:displayOnCallAssistLink>false</ns1:displayOnCallAssistLink><ns1:displayProfileLink>true</ns1:displayProfileLink><ns1:recordingAndPlayback>true</ns1:recordingAndPlayback><ns1:recordingEditor>true</ns1:recordingEditor><ns1:publishRecordings>false</ns1:publishRecordings><ns1:instantMeeting>true</ns1:instantMeeting><ns1:emails>false</ns1:emails><ns1:outlookIntegration>true</ns1:outlookIntegration><ns1:wirelessAccess>true</ns1:wirelessAccess><ns1:allowPublicAccess>true</ns1:allowPublicAccess><ns1:ssl>true</ns1:ssl><ns1:handsOnLab>true</ns1:handsOnLab><ns1:holMaxLabs>999999</ns1:holMaxLabs><ns1:holMaxComputers>999999</ns1:holMaxComputers><ns1:userLockDown>false</ns1:userLockDown><ns1:meetingAssist>false</ns1:meetingAssist><ns1:sms>false</ns1:sms><ns1:encryption>NONE</ns1:encryption><ns1:internalMeeting>false</ns1:internalMeeting><ns1:enableTP>false</ns1:enableTP><ns1:enableTPplus>false</ns1:enableTPplus></ns1:tools><ns1:custCommunications><ns1:displayType><ns1:prodSvcAnnounce>false</ns1:prodSvcAnnounce><ns1:trainingInfo>false</ns1:trainingInfo><ns1:eNewsletters>false</ns1:eNewsletters><ns1:promotionsOffers>false</ns1:promotionsOffers><ns1:pressReleases>false</ns1:pressReleases></ns1:displayType><ns1:displayMethod><ns1:email>false</ns1:email><ns1:fax>false</ns1:fax><ns1:phone>false</ns1:phone><ns1:mail>false</ns1:mail></ns1:displayMethod></ns1:custCommunications><ns1:trackingCodes/><ns1:supportedServices><ns1:meetingCenter><ns1:enabled>true</ns1:enabled><ns1:pageVersion>mc3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion></ns1:meetingCenter><ns1:trainingCenter><ns1:enabled>true</ns1:enabled><ns1:pageVersion>tc3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion></ns1:trainingCenter><ns1:supportCenter><ns1:enabled>true</ns1:enabled><ns1:pageVersion>sc3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion><ns1:webACD>true</ns1:webACD></ns1:supportCenter><ns1:eventCenter><ns1:enabled>true</ns1:enabled><ns1:pageVersion>ec3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion><ns1:marketingAddOn>true</ns1:marketingAddOn><ns1:optimizeAttendeeBandwidthUsage>false</ns1:optimizeAttendeeBandwidthUsage></ns1:eventCenter><ns1:salesCenter><ns1:enabled>false</ns1:enabled><ns1:pageVersion>sac3100</ns1:pageVersion><ns1:clientVersion>T31L</ns1:clientVersion></ns1:salesCenter></ns1:supportedServices><ns1:securityOptions><ns1:passwordExpires>false</ns1:passwordExpires><ns1:passwordLifetime>0</ns1:passwordLifetime><ns1:allMeetingsUnlisted>false</ns1:allMeetingsUnlisted><ns1:allMeetingsPassword>true</ns1:allMeetingsPassword><ns1:joinBeforeHost>false</ns1:joinBeforeHost><ns1:audioBeforeHost>true</ns1:audioBeforeHost><ns1:changePersonalURL>true</ns1:changePersonalURL><ns1:changeUserName>false</ns1:changeUserName><ns1:meetings><ns1:strictPasswords>true</ns1:strictPasswords></ns1:meetings><ns1:strictUserPassword>true</ns1:strictUserPassword><ns1:accountNotify>false</ns1:accountNotify><ns1:requireLoginBeforeSiteAccess>false</ns1:requireLoginBeforeSiteAccess><ns1:changePWDWhenAutoLogin>false</ns1:changePWDWhenAutoLogin><ns1:enforceBaseline>true</ns1:enforceBaseline><ns1:passwordChangeIntervalOpt>false</ns1:passwordChangeIntervalOpt><ns1:passwordChangeInterval>24</ns1:passwordChangeInterval><ns1:firstAttendeeAsPresenter>false</ns1:firstAttendeeAsPresenter><ns1:isEnableUUIDLink>true</ns1:isEnableUUIDLink><ns1:isEnableUUIDLinkForSAC>false</ns1:isEnableUUIDLinkForSAC></ns1:securityOptions><ns1:defaults><ns1:emailReminders>true</ns1:emailReminders><ns1:entryExitTone>BEEP</ns1:entryExitTone><ns1:voip>true</ns1:voip><ns1:teleconference><ns1:telephonySupport>CALLIN</ns1:telephonySupport><ns1:tollFree>true</ns1:tollFree><ns1:intlLocalCallIn>true</ns1:intlLocalCallIn></ns1:teleconference><ns1:joinTeleconfNotPress1>false</ns1:joinTeleconfNotPress1><ns1:updateTSPAccount>false</ns1:updateTSPAccount></ns1:defaults><ns1:scheduleMeetingOptions><ns1:scheduleOnBehalf>true</ns1:scheduleOnBehalf><ns1:saveSessionTemplate>true</ns1:saveSessionTemplate></ns1:scheduleMeetingOptions><ns1:navBarTop><ns1:button><ns1:order>1</ns1:order><ns1:serviceName>Welcome</ns1:serviceName></ns1:button><ns1:button><ns1:order>2</ns1:order><ns1:enabled>true</ns1:enabled><ns1:serviceName>Meeting Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>3</ns1:order><ns1:enabled>true</ns1:enabled><ns1:serviceName>Event Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>4</ns1:order><ns1:enabled>false</ns1:enabled><ns1:serviceName>Sales Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>5</ns1:order><ns1:enabled>true</ns1:enabled><ns1:serviceName>Support Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>6</ns1:order><ns1:enabled>true</ns1:enabled><ns1:serviceName>Training Center</ns1:serviceName></ns1:button><ns1:button><ns1:order>7</ns1:order><ns1:serviceName>Site Administration</ns1:serviceName></ns1:button><ns1:button><ns1:order>8</ns1:order><ns1:enabled>false</ns1:enabled><ns1:serviceName>Presentation Studio</ns1:serviceName></ns1:button><ns1:displayDisabledService>false</ns1:displayDisabledService></ns1:navBarTop><ns1:navMyWebEx><ns1:customLinks><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink></ns1:customLinks><ns1:partnerLinks><ns1:partnerLink><ns1:target>NEW</ns1:target></ns1:partnerLink><ns1:partnerLink><ns1:target>NEW</ns1:target></ns1:partnerLink><ns1:partnerLink><ns1:target>NEW</ns1:target></ns1:partnerLink></ns1:partnerLinks><ns1:partnerIntegration>true</ns1:partnerIntegration><ns1:support><ns1:target>NEW</ns1:target></ns1:support><ns1:training><ns1:target>NEW</ns1:target></ns1:training></ns1:navMyWebEx><ns1:navAllServices><ns1:customLinks><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink><ns1:customLink><ns1:target>NEW</ns1:target></ns1:customLink></ns1:customLinks><ns1:support><ns1:name>Support</ns1:name><ns1:target>NEW</ns1:target></ns1:support><ns1:training><ns1:name>Training</ns1:name><ns1:target>NEW</ns1:target></ns1:training><ns1:supportMenu><ns1:userGuides><ns1:target>NEW</ns1:target></ns1:userGuides><ns1:downloads><ns1:target>NEW</ns1:target></ns1:downloads><ns1:training><ns1:target>NEW</ns1:target></ns1:training><ns1:contactUs><ns1:target>NEW</ns1:target></ns1:contactUs><ns1:supportMyResources>true</ns1:supportMyResources></ns1:supportMenu></ns1:navAllServices><ns1:passwordCriteria><ns1:mixedCase>false</ns1:mixedCase><ns1:minLength>4</ns1:minLength><ns1:minAlpha>0</ns1:minAlpha><ns1:minNumeric>0</ns1:minNumeric><ns1:minSpecial>0</ns1:minSpecial><ns1:disallowWebTextSessions>true</ns1:disallowWebTextSessions><ns1:disallowWebTextAccounts>true</ns1:disallowWebTextAccounts><ns1:disallowList>true</ns1:disallowList><ns1:disallowValue>password</ns1:disallowValue><ns1:disallowValue>passwd</ns1:disallowValue><ns1:disallowValue>pass</ns1:disallowValue></ns1:passwordCriteria><ns1:accountPasswordCriteria><ns1:mixedCase>true</ns1:mixedCase><ns1:minLength>8</ns1:minLength><ns1:minNumeric>1</ns1:minNumeric><ns1:minAlpha>2</ns1:minAlpha><ns1:minSpecial>0</ns1:minSpecial><ns1:disallow3XRepeatedChar>false</ns1:disallow3XRepeatedChar><ns1:disallowWebTextAccounts>true</ns1:disallowWebTextAccounts><ns1:disallowList>true</ns1:disallowList><ns1:disallowValue>password</ns1:disallowValue><ns1:disallowValue>passwd</ns1:disallowValue><ns1:disallowValue>pass</ns1:disallowValue><ns1:disallowValue>webex</ns1:disallowValue><ns1:disallowValue>cisco</ns1:disallowValue><ns1:disallowValue>xebew</ns1:disallowValue><ns1:disallowValue>ocsic</ns1:disallowValue></ns1:accountPasswordCriteria><ns1:productivityTools><ns1:enable>true</ns1:enable><ns1:installOpts><ns1:autoUpdate>false</ns1:autoUpdate></ns1:installOpts><ns1:integrations><ns1:outlook>true</ns1:outlook><ns1:outlookForMac>true</ns1:outlookForMac><ns1:lotusNotes>false</ns1:lotusNotes><ns1:oneClick>false</ns1:oneClick><ns1:showSysTrayIcon>false</ns1:showSysTrayIcon><ns1:office>false</ns1:office><ns1:excel>false</ns1:excel><ns1:powerPoint>false</ns1:powerPoint><ns1:word>false</ns1:word><ns1:IE>false</ns1:IE><ns1:firefox>false</ns1:firefox><ns1:explorerRightClick>false</ns1:explorerRightClick><ns1:instantMessenger>false</ns1:instantMessenger><ns1:aolMessenger>false</ns1:aolMessenger><ns1:googleTalk>false</ns1:googleTalk><ns1:lotusSametime>false</ns1:lotusSametime><ns1:skype>false</ns1:skype><ns1:windowsMessenger>false</ns1:windowsMessenger><ns1:yahooMessenger>false</ns1:yahooMessenger><ns1:ciscoIPPhone>false</ns1:ciscoIPPhone><ns1:pcNow>false</ns1:pcNow><ns1:iGoogle>false</ns1:iGoogle><ns1:iPhoneDusting>false</ns1:iPhoneDusting></ns1:integrations><ns1:oneClick><ns1:allowJoinUnlistMeeting>true</ns1:allowJoinUnlistMeeting><ns1:requireApproveJoin>false</ns1:requireApproveJoin></ns1:oneClick><ns1:templates><ns1:useTemplate>false</ns1:useTemplate></ns1:templates><ns1:lockDownPT><ns1:lockDown>false</ns1:lockDown></ns1:lockDownPT><ns1:imSettings><ns1:attendeeInviteOther>false</ns1:attendeeInviteOther></ns1:imSettings></ns1:productivityTools><ns1:meetingPlace/><ns1:salesCenter><ns1:allowJoinWithoutLogin>false</ns1:allowJoinWithoutLogin></ns1:salesCenter><ns1:connectIntegration><ns1:integratedWebEx11>false</ns1:integratedWebEx11></ns1:connectIntegration><ns1:video><ns1:HQvideo>true</ns1:HQvideo><ns1:maxBandwidth>LOW</ns1:maxBandwidth><ns1:HDvideo>false</ns1:HDvideo></ns1:video><ns1:siteCommonOptions><ns1:SupportCustomDialRestriction>false</ns1:SupportCustomDialRestriction><ns1:SupportTelePresence>false</ns1:SupportTelePresence><ns1:SupportTelePresencePlus>false</ns1:SupportTelePresencePlus><ns1:EnableCloudTelepresence>false</ns1:EnableCloudTelepresence><ns1:enablePersonalMeetingRoom>true</ns1:enablePersonalMeetingRoom></ns1:siteCommonOptions><ns1:samlSSO><ns1:enableSSO>false</ns1:enableSSO><ns1:autoAccountCreation>false</ns1:autoAccountCreation></ns1:samlSSO></ns1:siteInstance></serv:bodyContent></serv:body></serv:message>';

  beforeEach(angular.mock.module('WebExApp'));

  beforeEach(
    inject(function (
      _$q_,
      _$rootScope_,
      _WebExXmlApiFact_
    ) {

      $q = _$q_;
      $rootScope = _$rootScope_;
      WebExXmlApiFact = _WebExXmlApiFact_;

      deferredSessionTicket = $q.defer();
      deferredVersionXml = $q.defer();
      deferredEnableT30UnifiedAdminXml = $q.defer();
      deferredSiteInfoXml = $q.defer();

      spyOn(WebExXmlApiFact, "getSessionTicket").and.returnValue(deferredSessionTicket.promise);
      spyOn(WebExXmlApiFact, "getSiteVersion").and.returnValue(deferredVersionXml.promise);
      spyOn(WebExXmlApiFact, "getSiteInfo").and.returnValue(deferredSiteInfoXml.promise);
    })
  );

  it('can check if site iframe supported (release order >= 400)', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.siteFunctions("test.site.com").then(
      function isSiteSupportsIframeSuccess(response) {
        var isIframeSupported = response.isIframeSupported;
        expect(isIframeSupported).toBe(true);
      },

      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferredSessionTicket.resolve("ticket");
    $rootScope.$apply();

    deferredVersionXml.resolve(isIframeSupportedReleaseOrderXml);
    $rootScope.$apply();

    deferredEnableT30UnifiedAdminXml.resolve(isNullEnableT30UnfiedAdminXml);
    $rootScope.$apply();

    deferredSiteInfoXml.resolve(isAdminReportEnabledXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteInfo).toHaveBeenCalled();
  }));

  it('can check if site is iframe supported (release order < 400; enableT30UnifiedAdmin = true', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.siteFunctions("test.site.com").then(
      function isSiteSupportsIframeSuccess(response) {
        var isIframeSupported = response.isIframeSupported;
        expect(isIframeSupported).toBe(true);
      },

      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferredSessionTicket.resolve("ticket");
    $rootScope.$apply();

    deferredVersionXml.resolve(isNotIframeSupportedReleaseOrderXml);
    $rootScope.$apply();

    deferredEnableT30UnifiedAdminXml.resolve(isEnableT30UnfiedAdminXml);
    $rootScope.$apply();

    deferredSiteInfoXml.resolve(isAdminReportEnabledXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteInfo).toHaveBeenCalled();
  }));

  it('can check if site is iframe supported (release order = null; enableT30UnifiedAdmin = true', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.siteFunctions("test.site.com").then(
      function isSiteSupportsIframeSuccess(response) {
        var isIframeSupported = response.isIframeSupported;
        expect(isIframeSupported).toBe(true);
      },

      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferredSessionTicket.resolve("ticket");
    $rootScope.$apply();

    deferredVersionXml.resolve(isNullIframeSupportedReleaseOrderXml);
    $rootScope.$apply();

    deferredEnableT30UnifiedAdminXml.resolve(isEnableT30UnfiedAdminXml);
    $rootScope.$apply();

    deferredSiteInfoXml.resolve(isAdminReportEnabledXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteInfo).toHaveBeenCalled();
  }));

  it('can check if site report is enabled', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.siteFunctions("test.site.com").then(
      function isSiteSupportsIframeSuccess(response) {
        var isAdminReportEnabled = response.isAdminReportEnabled;
        expect(isAdminReportEnabled).toBe(true);
      },

      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferredSessionTicket.resolve("ticket");
    $rootScope.$apply();

    deferredVersionXml.resolve(isIframeSupportedReleaseOrderXml);
    $rootScope.$apply();

    deferredEnableT30UnifiedAdminXml.resolve(isNullEnableT30UnfiedAdminXml);
    $rootScope.$apply();

    deferredSiteInfoXml.resolve(isAdminReportEnabledXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteInfo).toHaveBeenCalled();
  }));

  it('can check if site report is not enabled', inject(function (WebExApiGatewayService) {
    WebExApiGatewayService.siteFunctions("test.site.com").then(
      function isSiteSupportsIframeSuccess(response) {
        var isAdminReportEnabled = response.isAdminReportEnabled;
        expect(isAdminReportEnabled).toBe(false);
      },

      function isSiteSupportsIframeError(response) {
        this.fail();
      }
    );

    deferredSessionTicket.resolve("ticket");
    $rootScope.$apply();

    deferredVersionXml.resolve(isIframeSupportedReleaseOrderXml);
    $rootScope.$apply();

    deferredEnableT30UnifiedAdminXml.resolve(isNullEnableT30UnfiedAdminXml);
    $rootScope.$apply();

    deferredSiteInfoXml.resolve(isNotAdminReportEnabledXml);
    $rootScope.$apply();

    expect(WebExXmlApiFact.getSessionTicket).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteVersion).toHaveBeenCalled();
    expect(WebExXmlApiFact.getSiteInfo).toHaveBeenCalled();
  }));
});
