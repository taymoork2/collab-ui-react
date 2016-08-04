'use strict';

describe('RedirectTargetService', function () {
  beforeEach(angular.mock.module('Hercules'));

  var service;
  var httpBackend;

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", {
      getOrgId: function () {
        return "foo";
      }
    });
    $provide.value("UrlConfig", {
      getHerculesUrl: function () {
        return "http://server";
      }
    });
  }));

  beforeEach(inject(function (RedirectTargetService, $httpBackend) {
    service = RedirectTargetService;
    httpBackend = $httpBackend;
  }));

  afterEach(function () {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should post to the correct hercules endpoint', function () {
    var url = "http://server/organizations/foo/allowedRedirectTargets";
    var body = {
      hostname: "hostname",
      ttlInSeconds: 60 * 60 * 1
    };
    httpBackend.expectPOST(url, body).respond(200);

    service.addRedirectTarget("hostname");
    httpBackend.flush();
  });
});
