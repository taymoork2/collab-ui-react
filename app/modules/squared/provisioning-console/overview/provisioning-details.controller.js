require('../_provisioning.scss');


(function () {
  'use strict';

  module.exports = ProvisioningDetailsController;
  /* @ngInject */
  function ProvisioningDetailsController($stateParams, $translate) {
    var vm = this;

    /*
     * Defining variables.
     */
    vm.order = $stateParams.order;
    vm.selectedSite = vm.order.site[0];
    vm.selectedAudioItems = [];
    vm.generalAudioItems = [];
    vm.selectedConferencingItems = [];
    vm.generalConferencingItems = [];
    vm.selectedStorageItems = [];
    vm.generalStorageItems = [];
    vm.selectedCmrItems = [];
    vm.generalCmrItems = [];
    vm.audioTitle = '';
    vm.conferencingTitle = '';
    vm.storageTitle = '';
    vm.cmrTitle = '';
    vm.dateInfo = '';

    /*
     * Call function that will return sevice items grouped by category, and by site.
     */
    vm.groupedServiceItems = getServiceItemsForSites();

    if (parseInt(vm.order.statusCode, 10) === 0 || parseInt(vm.order.statusCode, 10) === 1) {
      vm.dateInfo = $translate.instant('provisioningConsole.details.pending', {
        orderDate: vm.order.received,
      });
    } else if (parseInt(vm.order.statusCode, 10) === 2) {
      vm.dateInfo = $translate.instant('provisioningConsole.details.completed', {
        orderDate: vm.order.completionDate,
      });
    }

    /*
     * If a site is selected, show the correct serviceItems, otherwise show general items.
     */
    if (vm.selectedSite) {
      //If there are grouped service items, then split them up into items with and without a siteUrl.
      if (vm.groupedServiceItems) {
        //Audio items.
        if (vm.groupedServiceItems.audio) {
          vm.selectedAudioItems = vm.groupedServiceItems.audio[vm.selectedSite.siteUrl] || [];
          vm.generalAudioItems = vm.groupedServiceItems.audio[''] || [];
          vm.audioTitle = $translate.instant('provisioningConsole.details.audio.title', {
            site: vm.selectedSite.siteUrl,
          });
        }

        //Conferencing items.
        if (vm.groupedServiceItems.conferencing) {
          vm.selectedConferencingItems = vm.groupedServiceItems.conferencing[vm.selectedSite.siteUrl] || [];
          vm.generalConferencingItems = vm.groupedServiceItems.conferencing[''] || [];
          vm.conferencingTitle = $translate.instant('provisioningConsole.details.conferencing.title', {
            site: vm.selectedSite.siteUrl,
          });
        }

        //Storage items.
        if (vm.groupedServiceItems.storage) {
          vm.selectedStorageItems = vm.groupedServiceItems.storage[vm.selectedSite.siteUrl] || [];
          vm.generalStorageItems = vm.groupedServiceItems.storage[''] || [];
          vm.storageTitle = $translate.instant('provisioningConsole.details.storage.title', {
            site: vm.selectedSite.siteUrl,
          });
        }

        //CMR items.
        if (vm.groupedServiceItems.cmr) {
          vm.selectedCmrItems = vm.groupedServiceItems.cmr[vm.selectedSite.siteUrl] || [];
          vm.generalCmrItems = vm.groupedServiceItems.cmr[''] || [];
          vm.cmrTitle = $translate.instant('provisioningConsole.details.cmr.title', {
            site: vm.selectedSite.siteUrl,
          });
        }
      }
    } else {
      //If there are no grouped service items, but service items exist, then split them up as well.
      if (vm.order.serviceItems) {
        vm.generalAudioItems = vm.order.serviceItems.audio;
        vm.generalConferencingItems = vm.order.serviceItems.conferencing;
        vm.generalStorageItems = vm.order.serviceItems.storage;
        vm.generalCmrItems = vm.order.serviceItems.cmr;
      }
    }

    /*
     * Change the selected services after changing site url.
     */
    vm.changeSelectedSite = function () {
      vm.selectedAudioItems = vm.groupedServiceItems.audio[vm.selectedSite.siteUrl] || [];
      vm.selectedConferencingItems = vm.groupedServiceItems.conferencing[vm.selectedSite.siteUrl] || [];
      vm.selectedStorageItems = vm.groupedServiceItems.storage[vm.selectedSite.siteUrl] || [];
      vm.selectedCmrItems = vm.groupedServiceItems.cmr[vm.selectedSite.siteUrl] || [];
    };

    /*
     * Group service items by category and site.
     */
    function getServiceItemsForSites() {
      var audioItemsPerSite = [], confItemsPerSite = [], storageItemsPerSite = [], cmrItemsPerSite = [];

      //If there are service items, group them.
      if (vm.order.serviceItems) {
        //Check if there are audio items before grouping them.
        if (vm.order.serviceItems.audio) {
          audioItemsPerSite = _.groupBy(vm.order.serviceItems.audio, function (item) {
            item.siteUrl = item.siteUrl || '';
            return item.siteUrl;
          });
        }

        //Check if there are conferencing items before grouping them.
        if (vm.order.serviceItems.conferencing) {
          confItemsPerSite = _.groupBy(vm.order.serviceItems.conferencing, function (item) {
            item.siteUrl = item.siteUrl || '';
            return item.siteUrl;
          });
        }

        //Check if there are storage items before grouping them.
        if (vm.order.serviceItems.storage) {
          storageItemsPerSite = _.groupBy(vm.order.serviceItems.storage, function (item) {
            item.siteUrl = item.siteUrl || '';
            return item.siteUrl;
          });
        }

        //Check if there are cmr items before grouping them.
        if (vm.order.serviceItems.cmr) {
          cmrItemsPerSite = _.groupBy(vm.order.serviceItems.cmr, function (item) {
            item.siteUrl = item.siteUrl || '';
            return item.siteUrl;
          });
        }
      }
      return { audio: audioItemsPerSite, conferencing: confItemsPerSite, storage: storageItemsPerSite, cmr: cmrItemsPerSite };
    }
  }
}());
