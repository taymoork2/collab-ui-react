(function () {
  'use strict';

  angular
    .module('uc.moh')
    .factory('mohService', mohService);

  /* @ngInject */
  function mohService($http, $q, $location, $timeout) {
    var service = {
      getPlaylists: getPlaylists,
      getPlaylist: getPlaylist
    };
    return service;

    function getPlaylists() {

      return $http.get('/modules/huron/moh/mohData/playlists.json')
        .then(getPlaylistsComplete);

      function getPlaylistsComplete(data, status, headers, config) {
        return $timeout(
          function () {
            return data.data;
          }, 500);
      }
    }

    function getPlaylist(uuid) {
      var playlist = [];
      var uuid = uuid;
      var playlistUrl = '/modules/huron/moh/mohData/playlists/' + uuid + '.json'

      return $http.get(playlistUrl)
        .then(getPlaylistComplete);

      function getPlaylistComplete(data, status, headers, config) {
        return $timeout(
          function () {
            return data.data;
          }, 500);
      }
    }
  }
})();
