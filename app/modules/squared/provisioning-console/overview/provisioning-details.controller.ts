
export class ProvisioningDetailsController {

  public order: any;
  public selectedSite: any;
  public selectedAudioItems = [];
  public generalAudioItems = [];
  public selectedConferencingItems = [];
  public generalConferencingItems = [];
  public selectedStorageItems = [];
  public generalStorageItems = [];
  public selectedCmrItems = [];
  public generalCmrItems = [];
  public audioTitle = '';
  public conferencingTitle = '';
  public storageTitle = '';
  public cmrTitle = '';
  public dateInfo = '';
  public groupedServiceItems: any;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $stateParams) {
    this.order = this.$stateParams.order;
    this.selectedSite = this.order.site[0];
    this.init();
  }


  /*
   * Call function that will return sevice items grouped by category, and by site.
   */
  private init() {

    this.groupedServiceItems = this.getServiceItemsForSites();

    if (parseInt(this.order.statusCode, 10) === 0 || parseInt(this.order.statusCode, 10) === 1) {
      this.dateInfo = this.$translate.instant('provisioningConsole.details.pending', {
        orderDate: this.order.received,
      });
    } else if (parseInt(this.order.statusCode, 10) === 2) {
      this.dateInfo = this.$translate.instant('provisioningConsole.details.completed', {
        orderDate: this.order.completionDate,
      });
    }

    /*
     * If a site is selected, show the correct serviceItems, otherwise show general items.
     */
    if (this.selectedSite) {
      //If there are grouped service items, then split them up into items with and without a siteUrl.
      if (this.groupedServiceItems) {
        //Audio items.
        if (this.groupedServiceItems.audio) {
          this.selectedAudioItems = this.groupedServiceItems.audio[this.selectedSite.siteUrl] || [];
          this.generalAudioItems = this.groupedServiceItems.audio[''] || [];
          this.audioTitle = this.$translate.instant('provisioningConsole.details.audio.title', {
            site: this.selectedSite.siteUrl,
          });
        }

        //Conferencing items.
        if (this.groupedServiceItems.conferencing) {
          this.selectedConferencingItems = this.groupedServiceItems.conferencing[this.selectedSite.siteUrl] || [];
          this.generalConferencingItems = this.groupedServiceItems.conferencing[''] || [];
          this.conferencingTitle = this.$translate.instant('provisioningConsole.details.conferencing.title', {
            site: this.selectedSite.siteUrl,
          });
        }

        //Storage items.
        if (this.groupedServiceItems.storage) {
          this.selectedStorageItems = this.groupedServiceItems.storage[this.selectedSite.siteUrl] || [];
          this.generalStorageItems = this.groupedServiceItems.storage[''] || [];
          this.storageTitle = this.$translate.instant('provisioningConsole.details.storage.title', {
            site: this.selectedSite.siteUrl,
          });
        }

        //CMR items.
        if (this.groupedServiceItems.cmr) {
          this.selectedCmrItems = this.groupedServiceItems.cmr[this.selectedSite.siteUrl] || [];
          this.generalCmrItems = this.groupedServiceItems.cmr[''] || [];
          this.cmrTitle = this.$translate.instant('provisioningConsole.details.cmr.title', {
            site: this.selectedSite.siteUrl,
          });
        }
      }
    } else {
      //If there are no grouped service items, but service items exist, then split them up as well.
      if (this.order.serviceItems) {
        this.generalAudioItems = this.order.serviceItems.audio;
        this.generalConferencingItems = this.order.serviceItems.conferencing;
        this.generalStorageItems = this.order.serviceItems.storage;
        this.generalCmrItems = this.order.serviceItems.cmr;
      }
    }
  }
  /*
   * Change the selected services after changing site url.
   */
  public changeSelectedSite() {
    this.selectedAudioItems = this.groupedServiceItems.audio[this.selectedSite.siteUrl] || [];
    this.selectedConferencingItems = this.groupedServiceItems.conferencing[this.selectedSite.siteUrl] || [];
    this.selectedStorageItems = this.groupedServiceItems.storage[this.selectedSite.siteUrl] || [];
    this.selectedCmrItems = this.groupedServiceItems.cmr[this.selectedSite.siteUrl] || [];
  }

  /*
   * Group service items by category and site.
   */
  public getServiceItemsForSites() {
    let audioItemsPerSite: any;
    let confItemsPerSite: any;
    let storageItemsPerSite: any;
    let cmrItemsPerSite: any;

    //If there are service items, group them.
    if (this.order.serviceItems) {
      //Check if there are audio items before grouping them.
      if (this.order.serviceItems.audio) {
        audioItemsPerSite = _.groupBy(this.order.serviceItems.audio, function (item: any) {
          item.siteUrl = item.siteUrl || '';
          return item.siteUrl;
        });
      }

      //Check if there are conferencing items before grouping them.
      if (this.order.serviceItems.conferencing) {
        confItemsPerSite = _.groupBy(this.order.serviceItems.conferencing, function (item: any) {
          item.siteUrl = item.siteUrl || '';
          return item.siteUrl;
        });
      }

      //Check if there are storage items before grouping them.
      if (this.order.serviceItems.storage) {
        storageItemsPerSite = _.groupBy(this.order.serviceItems.storage, function (item: any) {
          item.siteUrl = item.siteUrl || '';
          return item.siteUrl;
        });
      }

      //Check if there are cmr items before grouping them.
      if (this.order.serviceItems.cmr) {
        cmrItemsPerSite = _.groupBy(this.order.serviceItems.cmr, function (item: any) {
          item.siteUrl = item.siteUrl || '';
          return item.siteUrl;
        });
      }
    }
    return { audio: audioItemsPerSite, conferencing: confItemsPerSite, storage: storageItemsPerSite, cmr: cmrItemsPerSite };
  }
}

