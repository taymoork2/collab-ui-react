'use strict';

describe('Controller: MohCtrl', function () {
  var controller, scope, httpBackend, playlistsData, playlistData1;

  beforeEach(angular.mock.module('uc.moh'));
  beforeEach(angular.mock.module('ui.router'));

  beforeEach(
    inject(
      function ($rootScope, $controller, $httpBackend) {
        scope = $rootScope.$new();
        playlistsData = getJSONFixture('huron/json/moh/playlists.json');
        playlistData1 = getJSONFixture('huron/json/moh/playlists/BBD5656B-E92B-12F5-10EF-1B01CB23A7C0.json');
        httpBackend = $httpBackend;
        httpBackend.when('GET', '/modules/huron/moh/mohData/playlists.json').respond(200, playlistsData);
        httpBackend.when('GET', '/modules/huron/moh/mohData/playlists/BBD5656B-E92B-12F5-10EF-1B01CB23A7C0.json').respond(200, playlistData1);
        controller = $controller('MohCtrl as moh', {
          '$scope': scope
        });
        $rootScope.$apply();
      }));

  afterEach(function () {
    httpBackend.flush();
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  describe('after activate', function () {

    it('should have close method', function () {
      expect(controller.close).toBeDefined();
    });

    it('should have selectPlaylist method', function () {
      expect(controller.selectPlaylist).toBeDefined();
    });
  });

});
