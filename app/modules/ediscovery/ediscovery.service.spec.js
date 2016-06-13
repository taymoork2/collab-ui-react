'use strict';

var orgId = 'xyz';
var roomId = 'abc';
var reportId = '123';

describe('Service: EdiscoveryService', function () {
  beforeEach(module('wx2AdminWebClientApp'));

  var Service, httpBackend, UrlConfig, Authinfo, avalonRunUrl, urlBase, responseUrl;

  beforeEach(inject(function (_EdiscoveryService_, $httpBackend, _Authinfo_, _UrlConfig_) {
    Service = _EdiscoveryService_;
    httpBackend = $httpBackend;
    UrlConfig = _UrlConfig_;
    Authinfo = _Authinfo_;

    urlBase = UrlConfig.getAdminServiceUrl();
    avalonRunUrl = 'http://avlonservice.com/run';
    responseUrl = urlBase + 'compliance/organizations/' + orgId + '/reports/' + reportId;

    httpBackend
      .when('GET', 'l10n/en_US.json')
      .respond({});

    sinon.stub(Authinfo, 'getOrgId');
    Authinfo.getOrgId.returns(orgId);

  }));

  describe('Service Locations API', function () {
    var avalonRoomsUrl = 'http://avlonservice.com/rooms';
    beforeEach(function () {
      httpBackend
        .whenGET(urlBase + 'compliance/organizations/' + orgId + '/servicelocations')
        .respond({
          avalonRoomsUrl: avalonRoomsUrl
        });
    });
    it('provides the avalon service url', function (done) {
      Service.getAvalonServiceUrl().then(function (result) {
        expect(result.avalonRoomsUrl).toEqual(avalonRoomsUrl);
        done();
      });
      httpBackend.flush();
    });
  });

  describe('Room API', function () {
    var roomId = 'abc';
    var roomInfo = {
      'id': roomId,
      'objectType': 'conversation',
      'url': 'https://conv-a.wbx2.com/conversation/api/v1/conversations/36de9c50-8410-11e5-8b9b-9d7d6ad1ac82',
      'published': '2015-11-05T22:54:47.957Z',
      'displayName': 'King Kong Rules',
      'participants': {
        'items': [{
          'id': 'kingkong@cisco.com',
          'objectType': 'person',
          'displayName': 'King Kong (kkong)',
          'orgId': 'xyz',
          'emailAddress': 'kingkong@cisco.com',
          'entryUUID': 'fd4d8ad3-78ab-4242-b37d-269942853b7c'
        }]
      },
      'activities': {
        'items': []
      },
      'tags': [],
      'locusUrl': 'https://locus-a.wbx2.com/locus/api/v1/loci/a85d5d59-95f8-3c65-8d40-14b9e5de30fa',
      'defaultActivityEncryptionKeyUrl': 'https://encryption-a.wbx2.com/encryption/api/v1/keys/04051149-6279-4a73-8fdf-ce6e3278f4e9',
      'encryptionKeyUrl': 'https://encryption-a.wbx2.com/encryption/api/v1/keys/04051149-6279-4a73-8fdf-ce6e3278f4e9',
      'conversationWebUrl': 'https://web.ciscospark.com/#/rooms/36de9c50-8410-11e5-8b9b-9d7d6ad1ac82',
      'creatorUUID': '2ab990ed-16d2-45ec-b998-84483c50d8b6',
      'lastRelevantActivityDate': '2015-11-17T18:06:11.474Z',
      'lastRelevantActivityTtl': 604800,
      'lastSeenActivityDate': '2016-05-23T19:28:49.541Z',
      'monitorBots': {
        'items': [{
          'id': 'f2efdf6a-e7f4-43fa-9cb3-0ad291840030',
          'objectType': 'person',
          'displayName': 'Cisco Security',
          'orgId': '1eb65fdf-9643-417f-9974-ad72cae0e10f',
          'emailAddress': 'spark-cisco-it-admin-bot@cisco.com',
          'entryUUID': 'f2efdf6a-e7f4-43fa-9cb3-0ad291840030'
        }]
      },
      'lastReadableActivityDate': '2016-06-08T23:26:21.281Z',
      'kmsResourceObjectUrl': 'https://encryption-a.wbx2.com/encryption/api/v1/resources/98c490d6-1da2-49e6-9a85-c3a1fdf097ea'
    };

    beforeEach(function () {
      httpBackend.whenGET(urlBase + 'compliance/rooms/' + roomId)
        .respond(roomInfo);
    });

    it('can get roominfo', function (done) {
      Service.getAvalonRoomInfo(urlBase + 'compliance/rooms/abc').then(function (result) {
        expect(result.id).toEqual(roomId);
        expect(result.displayName).toEqual('King Kong Rules');
        expect(result.participants.items.length).toEqual(1);
        done();
      });
      httpBackend.flush();
    });
  });

  describe('Report API', function () {

    var report = {
      'id': reportId,
      'orgId': orgId,
      'createdByUserId': 'c12145c3-0aad-43f9-9f9d-5cfc3b890ab0',
      'state': 'COMPLETED',
      'downloadUrl': 'http://www.vg.no',
      'createdTime': '2016-06-09T11:49:10.508Z',
      'expiryTime': '2016-06-09T12:49:30.125Z',
      'sizeInBytes': 149504,
      'displayName': 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..IJder60tKSG_COJH.chM0yocT.4ZHPKSIAgaY-9fCWUrXjUg',
      'lastUpdatedTime': '2016-06-09T11:49:30.127Z',
      'progress': 100,
      'type': 'ROOM_QUERY',
      'roomQuery': {
        'startDate': '2015-11-05T00:00:00.000Z',
        'endDate': '2016-06-08T00:00:00.000Z',
        'roomId': roomId
      },
      'runUrl': 'https://atlas-integration.wbx2.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/3bab7b32-5f8c-4cf7-924c-8d46c8bc4b21/run',
      'url': 'https://atlas-integration.wbx2.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/3bab7b32-5f8c-4cf7-924c-8d46c8bc4b21'
    };

    var reports = {
      'reports': [{
        'id': reportId,
        'orgId': orgId,
        'createdByUserId': 'c12145c3-0aad-43f9-9f9d-5cfc3b890ab0',
        'state': 'COMPLETED',
        'downloadUrl': 'https://avalon-integration.wbx2.com/avalon/api/v1/compliance/report/file/room/1eb65fdf-9643-417f-9974-ad72cae0e10f_465d5ac0-2d22-11e6-9b09-cfdd271e09dd.zip',
        'createdTime': '2016-06-10T09:05:24.791Z',
        'expiryTime': '2016-06-10T09:05:25.270Z',
        'sizeInBytes': 1024,
        'displayName': 'test',
        'lastUpdatedTime': '2016-06-10T09:05:25.281Z',
        'progress': 100,
        'type': 'ROOM_QUERY',
        'roomQuery': {
          'startDate': '2016-06-08T00:00:00.000Z',
          'endDate': '2016-06-09T00:00:00.000Z',
          'roomId': roomId
        },
        'runUrl': 'https://avalon-integration.wbx2.com/avalon/api/v1/compliance/report/room',
        'url': 'https://atlas-integration.wbx2.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/3d0fb858-9a82-4510-93f6-7ca268e698e8'
      }],
      'paging': {
        'next': 'https://atlas-integration.wbx2.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports?limit=10&offset=10',
        'limit': 10,
        'offset': 0,
        'count': 1
      }
    };

    var createReport = {
      'id': reportId,
      'orgId': orgId,
      'createdByUserId': 'c12145c3-0aad-43f9-9f9d-5cfc3b890ab0',
      'state': 'CREATED',
      'createdTime': '2016-06-10T10:53:13.997Z',
      'displayName': 'King Kong Rules',
      'lastUpdatedTime': '2016-06-10T10:53:13.997Z',
      'type': 'ROOM_QUERY',
      'roomQuery': {
        'roomId': roomId
      },
      'runUrl': 'https://avalon-integration.wbx2.com/avalon/api/v1/compliance/report/room',
      'url': 'https://atlas-integration.wbx2.com/admin/api/v1/compliance/organizations/1eb65fdf-9643-417f-9974-ad72cae0e10f/reports/2345e3bc-587d-428c-bee1-1081c03c533a'
    };

    beforeEach(function () {
      httpBackend.whenGET(urlBase + 'compliance/organizations/' + orgId + '/reports/' + reportId)
        .respond(report);

      httpBackend.whenGET(urlBase + 'compliance/organizations/' + orgId + '/reports/?limit=10')
        .respond(reports);

      httpBackend.whenPOST(urlBase + 'compliance/organizations/' + orgId + '/reports/', {
        'displayName': 'King Kong Rules',
        'roomQuery': {
          'startDate': null,
          'endDate': null,
          'roomId': roomId
        }
      }).respond(createReport);

      httpBackend.whenPOST(avalonRunUrl, {
        'roomId': roomId,
        'responseUrl': responseUrl
      }).respond(202, '');

      httpBackend.whenPATCH(urlBase + 'compliance/organizations/' + orgId + '/reports/' + reportId, {
        state: "ABORTED"
      }).respond();
    });

    it('can get report', function (done) {
      Service.getReport(reportId).then(function (result) {
        expect(result.id).toEqual('123');
        expect(result.progress).toEqual(100);
        done();
      });
      httpBackend.flush();
    });

    it('can get reports', function (done) {
      Service.getReports().then(function (result) {
        expect(result.length).toEqual(1);
        expect(result[0].orgId).toEqual(orgId);
        done();
      });
      httpBackend.flush();
    });

    it('can create report', function (done) {
      Service.createReport('King Kong Rules', roomId, null, null).then(function (result) {
        expect(result.id).toEqual(reportId);
        expect(result.orgId).toEqual(orgId);
        expect(result.displayName).toEqual('King Kong Rules');
        expect(result.state).toEqual('CREATED');
        expect(result.roomQuery.roomId).toEqual(roomId);
        done();
      });
      httpBackend.flush();
    });

    it('can run a report', function (done) {
      Service.runReport(avalonRunUrl, roomId, responseUrl).then(function (result) {
        expect(result.status).toEqual(202);
        done();
      });
      httpBackend.flush();
    });

    it('can patch report', function (done) {
      Service.patchReport(reportId, {
        state: "ABORTED"
      }).then(function (result) {
        done();
      });
      httpBackend.flush();
    });

  });

});
