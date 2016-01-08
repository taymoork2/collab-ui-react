(function () {
  'use strict';

  angular
    .module('uc.moh')
    .controller('MohCtrl', MohCtrl);

  /* @ngInject */
  function MohCtrl(mohService, $timeout, $state) {
    var vm = this;
    vm.title = 'Media on Hold';
    vm.playlists = [];
    vm.tracks = [];
    // vm.selectedUuid;
    vm.selectedList = {};
    vm.tracks = [];
    // vm.tracksCount;
    vm.selectPlaylist = selectPlaylist;

    function activate() {
      getPlaylists().then(function () {
        getTracks();
      });
    }

    function getPlaylists() {
      vm.playlists = [];
      return mohService.getPlaylists().then(function (data) {
        vm.playlists = data;
        $timeout(function () {
          $('.playlist-list ul').niceScroll({
            cursoropacitymax: 1,
            cursorwidth: 5,
            cursorborderradius: 2,
            cursorcolor: '#DDDDDD',
            autohidemode: false
          });
        });
        return vm.playlists;
      });
    }

    function getTracks() {
      vm.tracks = [];
      vm.tracksCount = 0;
      var selectedUuid = vm.selectedUuid || vm.playlists[0].uuid;
      vm.selectedUuid = selectedUuid;
      return mohService.getPlaylist(selectedUuid).then(function (data) {
        vm.selectedList = data;
        vm.tracks = vm.selectedList.files;
        vm.tracksCount = vm.tracks.length;
        $timeout(function () {
          $('.tracklist ul').niceScroll({
            cursoropacitymax: 1,
            cursorwidth: 5,
            cursorborderradius: 2,
            cursorcolor: '#DDDDDD',
            autohidemode: false
          });
          $('.tracklist ul').getNiceScroll().resize();
        });
        return;
      });
    }

    function selectPlaylist(uuid, name) {
      vm.selectedList.name = name;
      vm.selectedUuid = uuid;
      getTracks();
    }

    function close() {
      $state.modal.close();
    }

    vm.close = close;
    activate();
  }
})();
