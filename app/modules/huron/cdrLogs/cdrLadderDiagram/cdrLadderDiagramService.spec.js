'use strict';

describe('Controller: CdrLadderDiagramService', function () {
  beforeEach(module('uc.cdrlogsupport'));
  beforeEach(module('Huron'));

  var $httpBackend, $q, CdrLadderDiagramService, Notification, Authinfo;
  var proxyResponse = getJSONFixture('huron/json/cdrDiagram/proxyResponse.json');
  var esQuery = getJSONFixture('huron/json/cdrDiagram/esQuery.json');
  var proxyUrl = 'https://hades.huron-int.com/api/v1/elasticsearch/logstash*/_search?pretty';

  // can't find XML fixture to load xml file
  var diagnosticsResponse = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?> ' +
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="184px" style="width:249px;height:184px;" version="1.1" viewBox="0 0 249 184" width="249px"> ' +
    '<defs>' +
    '<filter height="300%" id="f1" width="300%" x="-1" y="-1">' +
    '<feGaussianBlur result="blurOut" stdDeviation="2.0"/>' +
    '<feColorMatrix in="blurOut" result="blurOut2" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .4 0"/>' +
    '<feOffset dx="4.0" dy="4.0" in="blurOut2" result="blurOut3"/>' +
    '<feBlend in="SourceGraphic" in2="blurOut3" mode="normal"/>' +
    '</filter>' +
    '</defs>' +
    '<g>' +
    '<line style="stroke: #A80036; stroke-width: 1.0; stroke-dasharray: 5.0,5.0;" x1="52" x2="52" y1="38.2969" y2="145.7188"/>' +
    '<line style="stroke: #A80036; stroke-width: 1.0; stroke-dasharray: 5.0,5.0;" x1="196.5" x2="196.5" y1="38.2969" y2="145.7188"/>' +
    '<rect fill="#FEFECE" filter="url(#f1)" height="30.2969" style="stroke: #A80036; stroke-width: 1.5;" width="85" x="8" y="3"/>' +
    '<text fill="#000000" font-family="sans-serif" font-size="14" lengthAdjust="spacingAndGlyphs" textLength="71" x="15" y="23">Start Point</text>' +
    '<rect fill="#FEFECE" filter="url(#f1)" height="30.2969" style="stroke: #A80036; stroke-width: 1.5;" width="85" x="8" y="144.7188"/>' +
    '<text fill="#000000" font-family="sans-serif" font-size="14" lengthAdjust="spacingAndGlyphs" textLength="71" x="15" y="164.7188">Start Point</text>' +
    '<rect fill="#FEFECE" filter="url(#f1)" height="30.2969" style="stroke: #A80036; stroke-width: 1.5;" width="92" x="148.5" y="3"/>' +
    '<text fill="#000000" font-family="sans-serif" font-size="14" lengthAdjust="spacingAndGlyphs" textLength="78" x="155.5" y="23">Line Hedge</text>' +
    '<rect fill="#FEFECE" filter="url(#f1)" height="30.2969" style="stroke: #A80036; stroke-width: 1.5;" width="92" x="148.5" y="144.7188"/>' +
    '<text fill="#000000" font-family="sans-serif" font-size="14" lengthAdjust="spacingAndGlyphs" textLength="78" x="155.5" y="164.7188">Line Hedge</text>' +
    '<polygon fill="#A80036" points="184.5,65.2969,194.5,69.2969,184.5,73.2969,188.5,69.2969" style="stroke: #A80036; stroke-width: 1.0;"/>' +
    '<line style="stroke: #A80036; stroke-width: 1.0;" x1="52.5" x2="190.5" y1="69.2969" y2="69.2969"/>' +
    '<text fill="#000000" font-family="sans-serif" font-size="13" lengthAdjust="spacingAndGlyphs" textLength="115" x="59.5" y="64.375">[1] INVITE SIP/2.0"</text>' +
    '<polygon fill="#A80036" points="63.5,94.4375,53.5,98.4375,63.5,102.4375,59.5,98.4375" style="stroke: #A80036; stroke-width: 1.0;"/>' +
    '<line style="stroke: #A80036; stroke-width: 1.0;" x1="57.5" x2="195.5" y1="98.4375" y2="98.4375"/>' +
    '<text fill="#000000" font-family="sans-serif" font-size="13" lengthAdjust="spacingAndGlyphs" textLength="104" x="69.5" y="93.5156">"[2] SIP/2.0 100"</text>' +
    '<polygon fill="#A80036" points="63.5,123.5781,53.5,127.5781,63.5,131.5781,59.5,127.5781" style="stroke: #A80036; stroke-width: 1.0;"/>' +
    '<line style="stroke: #A80036; stroke-width: 1.0;" x1="57.5" x2="195.5" y1="127.5781" y2="127.5781"/>' +
    '<text fill="#000000" font-family="sans-serif" font-size="13" lengthAdjust="spacingAndGlyphs" textLength="120" x="69.5" y="122.6563">"[3] INVITE SIP/2.0"</text>' +
    '</g>' +
    '</svg>';

  var cdrEvents = getJSONFixture('huron/json/cdrDiagram/cdrEvents.json');
  var messageSquence = getJSONFixture('huron/json/cdrDiagram/messageSquence.json');
  var activitiesResponse = getJSONFixture('huron/json/cdrDiagram/activities.json');
  var diagnosticsServiceUrl = 'https://atlas-integration.wbx2.com/admin/api/v1/callflow/ladderdiagram';
  var activitiesServiceUrl = 'https://atlas-integration.wbx2.com/admin/api/v1/callflow/activities?id=lid.f2aa2076-77eb-329f-b5c1-a2f21fdfdc89&start=2016-05-05T21:14:16.000Z&end=2016-05-05T21:14:16.999Z';

  beforeEach(inject(function (_$httpBackend_, _$q_, _CdrLadderDiagramService_, _Notification_, _Authinfo_) {
    CdrLadderDiagramService = _CdrLadderDiagramService_;
    Notification = _Notification_;
    $q = _$q_;
    $httpBackend = _$httpBackend_;
    Authinfo = _Authinfo_;

    spyOn(Notification, 'notify');
    spyOn(Authinfo, 'getOrgId').and.returnValue('1');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be defined', function () {
    expect(CdrLadderDiagramService).toBeDefined();
  });

  it('should return elastic search data from all servers', function () {
    $httpBackend.whenPOST(proxyUrl).respond(proxyResponse);
    var logstashPath = 'logstash*';

    CdrLadderDiagramService.query(esQuery, logstashPath).then(function (response) {
      var returnValue = proxyResponse.hits.hits[0]._source;
      expect(response.hits.hits[0]._source).toEqual(returnValue);
    });

    $httpBackend.flush();
  });

  it('should return a Ladder Diagram from the Diagnostics Service', function () {
    $httpBackend.expectPOST(diagnosticsServiceUrl, messageSquence).respond(diagnosticsResponse);

    CdrLadderDiagramService.createLadderDiagram(cdrEvents).then(function (response) {
      expect(response).toEqual(diagnosticsResponse);
    });

    $httpBackend.flush();
  });

  it('should return the Spark activies data from the Diagnostics Service', function () {
    var locusid = 'f2aa2076-77eb-329f-b5c1-a2f21fdfdc89';
    var start = '2016-05-05T21:14:16.000Z';
    var end = '2016-05-05T21:14:16.999Z';
    $httpBackend.whenGET(activitiesServiceUrl).respond(activitiesResponse);

    CdrLadderDiagramService.getActivities(locusid, start, end).then(function (response) {
      expect(response).toEqual(activitiesResponse);
    });

    $httpBackend.flush();
  });

});
