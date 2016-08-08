'use strict';

describe('Service: MohService', function () {
  var mohService, httpBackend, playlistsData, playlistData1;

  beforeEach(angular.mock.module('uc.moh'));

  beforeEach(
    inject(
      function ($httpBackend, _mohService_) {
        playlistsData = getJSONFixture('huron/json/moh/playlists.json');
        playlistData1 = getJSONFixture('huron/json/moh/playlists/BBD5656B-E92B-12F5-10EF-1B01CB23A7C0.json');
        httpBackend = $httpBackend;
        // httpBackend.when('GET', '/modules/huron/moh/mohData/playlists.json').respond(function (method, url, data) {
        //   return [200, playlistsData, {}];
        // });
        httpBackend.when('GET', '/modules/huron/moh/mohData/playlists.json').respond(200, playlistsData);
        httpBackend.when('GET', '/modules/huron/moh/mohData/playlists/BBD5656B-E92B-12F5-10EF-1B01CB23A7C0.json').respond(200, playlistData1);
        mohService = _mohService_;
      }));

  afterEach(function () {
    // httpBackend.flush();
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should be definded', function () {
    expect(mohService).toBeDefined();
  });

  it('should have method getPlaylists', function () {
    expect(mohService.getPlaylists).toBeDefined();
  });

  it('should have method getPlaylist', function () {
    expect(mohService.getPlaylist).toBeDefined();
  });

});
