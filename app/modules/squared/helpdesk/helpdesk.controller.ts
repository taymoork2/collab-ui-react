import { IToolkitModalService } from '../../core/modal';

class HelpdeskController {

  private KeyCodes = require('modules/core/accessibility').KeyCodes;

  public searchResultsPageSize: number = 5;
  public searchResultsLimit: number = 20;
  public searchingForUsers: boolean = false;
  public searchingForOrgs: boolean  = false;
  public searchingForOrders: boolean  = false;
  public searchingForDevices: boolean  = false;
  public searchingForCloudberryDevices: boolean  = false;
  public searchingForHuronDevices: boolean  = false;
  public searchingForHuronDevicesMatchingNumber: boolean = false;
  public lookingUpOrgFilter: boolean  = false;
  public searchString: string = '';
  public searchHistory: any;
  public isCustomerHelpDesk = !this.Authinfo.isInDelegatedAdministrationOrg();
  public orderNumberSize: number = 8;
  public isOrderSearchEnabled = this.Authinfo.isCisco() || this.Authinfo.isCiscoMock();
  public currentSearch;

  /* @ngInject */
  constructor(
    private $element,
    private $modal: IToolkitModalService,
    private $q,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private $scope: ng.IScope,
    public $window,
    private AccessibilityService,
    private Authinfo,
    private Config,
    private HelpdeskHuronService,
    private HelpdeskSearchHistoryService,
    private HelpdeskService,
    private HelpdeskSplunkReporterService,
    private LicenseService,
  ) {
    this.currentSearch = {
      searchString: '',
      userSearchResults: null,
      orgSearchResults: null,
      orderSearchResults: null,
      deviceSearchResults: null,
      userSearchFailure: null,
      orgSearchFailure: null,
      orderSearchFailure: null,
      deviceSearchFailure: null,
      orgFilter: this.isCustomerHelpDesk ? {
        id: Authinfo.getOrgId(),
        displayName: Authinfo.getOrgName(),
      } : null,
      orgLimit: this.searchResultsPageSize,
      userLimit: this.searchResultsPageSize,
      deviceLimit: this.searchResultsPageSize,
      orderLimit: this.searchResultsPageSize,
      initSearch: (searchString) => {
        this.currentSearch.searchString = searchString;
        this.currentSearch.userSearchResults = null;
        this.currentSearch.orgSearchResults = null;
        this.currentSearch.orderSearchResults = null;
        this.currentSearch.deviceSearchResults = null;
        this.currentSearch.userSearchFailure = null;
        this.currentSearch.orgSearchFailure = null;
        this.currentSearch.orderSearchFailure = null;
        this.currentSearch.deviceSearchFailure = null;
        this.currentSearch.orgLimit = this.searchResultsPageSize;
        this.currentSearch.userLimit = this.searchResultsPageSize;
        this.currentSearch.deviceLimit = this.searchResultsPageSize;
        this.currentSearch.orderLimit = this.searchResultsPageSize;
      },
    };

    // @ts-ignore: event always present
    this.$scope.$on('helpdeskLoadSearchEvent', (event, args) => {
      const search = args.message;
      this.setCurrentSearch(search);
      HelpdeskSplunkReporterService.reportOperation(HelpdeskSplunkReporterService.SEARCH_HISTORY);
    });

    /* @ngInject */
    this.$scope.$on('$viewContentLoaded', () => {
      this.setSearchFieldFocus();
      this.$window.document.title = $translate.instant('helpdesk.browserTabHeaderTitle');
    });

    if (this.isCustomerHelpDesk) {
      this.initSearchWithOrgFilter(this.currentSearch.orgFilter);
    }

  }

  public currentSearchClear() {
    this.currentSearch.initSearch('');
    if (!this.isCustomerHelpDesk) {
      this.currentSearch.orgFilter = null;
    }
  }
  public showSearchHelp() {
    const searchHelpTemplate = require('./helpdesk-search-help-dialog.html');
    const searchHelpMobileTemplate = require('./helpdesk-search-help-dialog-mobile.html');
    const isSearchOrderEnabled = this.isOrderSearchEnabled;
    this.$modal.open({
      template: this.HelpdeskService.checkIfMobile() ? searchHelpMobileTemplate : searchHelpTemplate,
      controller: () => {
        this.isCustomerHelpDesk = !this.Authinfo.isInDelegatedAdministrationOrg();
        this.isOrderSearchEnabled = isSearchOrderEnabled;
      },
      controllerAs: 'searchHelpModalCtrl',
    });
    this.HelpdeskSplunkReporterService.reportOperation(this.HelpdeskSplunkReporterService.SEARCH_HELP);
  }

  public setCurrentSearch(search) {
    _.assign(this.currentSearch, search);
    this.searchString = search.searchString;
    this.HelpdeskService.findAndResolveOrgsForUserResults(
      this.currentSearch.userSearchResults,
      this.currentSearch.orgFilter,
      this.currentSearch.userLimit);
    this.HelpdeskHuronService.setOwnerAndDeviceDetails(_.take(this.currentSearch.deviceSearchResults, this.currentSearch.deviceLimit));
    this.$state.go('helpdesk.search');
    this.setSearchFieldFocus();
  }

  public search() {
    if (!this.searchString) {
      return;
    }
    if (this.HelpdeskService.noOutstandingRequests()) {
      this.doSearch();
    } else {
      this.HelpdeskService.cancelAllRequests().then( () => {
        this.doSearch();
      });
    }
  }

  public doSearch() {
    const startTime = moment();
    this.currentSearch.initSearch(this.searchString);
    const orgFilterId = this.currentSearch.orgFilter ? this.currentSearch.orgFilter.id : null;
    let promises: any = [];
    promises.push(this.searchUsers(this.searchString, orgFilterId));
    if (!orgFilterId) {
      promises.push(this.searchOrgs(this.searchString));
      if (this.isOrderSearchEnabled) {
        promises.push(this.searchOrders(this.searchString));
      }
    } else {
      this.isOrderSearchEnabled = false;
      promises = promises.concat(this.searchDevices(this.searchString, this.currentSearch.orgFilter));
    }

    this.$q.all(promises).then((res) => {
      this.reportSearchSummary(this.searchString, res, startTime, orgFilterId);
    });
  }

  public searchUsers(searchString, orgId) {
    const searchDone = this.$q.defer();
    if (searchString.length >= 3) {
      this.searchingForUsers = true;
      this.HelpdeskService.searchUsers(searchString, orgId, this.searchResultsLimit, null, true).then( (res) => {
        this.currentSearch.userSearchResults = res;
        this.currentSearch.userSearchFailure = null;
        this.searchingForUsers = false;
        this.HelpdeskService.findAndResolveOrgsForUserResults(
          this.currentSearch.userSearchResults,
          this.currentSearch.orgFilter,
          this.currentSearch.userLimit);
        this.HelpdeskSearchHistoryService.saveSearch(this.currentSearch);
        this.searchHistory = this.HelpdeskSearchHistoryService.getAllSearches();
      }).catch((err) => {
        this.searchingForUsers = false;
        this.currentSearch.userSearchResults = null;
        if (err.status === 400) {
          this.currentSearch.userSearchFailure = this.$translate.instant('helpdesk.badUserSearchInput');
        } else if (err.cancelled === true || err.timedout === true) {
          this.currentSearch.userSearchFailure = this.$translate.instant('helpdesk.cancelled');
        } else {
          this.currentSearch.userSearchFailure = this.$translate.instant('helpdesk.unexpectedError');
        }
      }).finally( () => {
        searchDone.resolve(this.stats(this.HelpdeskSplunkReporterService.USER_SEARCH, this.currentSearch.userSearchFailure || this.currentSearch.userSearchResults));
      });
    } else {
      this.currentSearch.userSearchFailure = this.$translate.instant('helpdesk.badUserSearchInput');
      searchDone.resolve(this.stats(this.HelpdeskSplunkReporterService.USER_SEARCH, this.currentSearch.userSearchFailure));
    }
    return searchDone.promise;
  }

  public searchOrgs(searchString) {
    const searchDone = this.$q.defer();

    if (searchString.length >= 3) {
      this.searchingForOrgs = true;
      this.HelpdeskService.searchOrgs(searchString, this.searchResultsLimit).then( (res) => {
        this.currentSearch.orgSearchResults = res;
        this.currentSearch.orgSearchFailure = null;
        this.searchingForOrgs = false;
        this.HelpdeskSearchHistoryService.saveSearch(this.currentSearch);
        this.searchHistory = this.HelpdeskSearchHistoryService.getAllSearches();
      }).catch((err) => {
        this.searchingForOrgs = false;
        this.currentSearch.orgSearchResults = null;
        this.currentSearch.orgSearchFailure = null;
        if (err.status === 404) {
          this.currentSearch.orgSearchFailure = this.$translate.instant('helpdesk.noSearchHits');
        } else if (err.status === 400) {
          const message: string = _.get(err.data, 'message');
          if (message && message.indexOf('Search phrase is too generic') !== -1) {
            this.currentSearch.orgSearchFailure = this.$translate.instant('helpdesk.tooManySearchResults');
          } else {
            this.currentSearch.orgSearchFailure = this.$translate.instant('helpdesk.badOrgSearchInput');
          }
        } else if (err.cancelled === true || err.timedout === true) {
          this.currentSearch.orgSearchFailure = this.$translate.instant('helpdesk.cancelled');
        } else {
          this.currentSearch.orgSearchFailure = this.$translate.instant('helpdesk.unexpectedError');
        }
      }).finally(() => {
        searchDone.resolve(this.stats(this.HelpdeskSplunkReporterService.ORG_SEARCH, this.currentSearch.orgSearchFailure || this.currentSearch.orgSearchResults));
      });
    } else {
      this.currentSearch.orgSearchFailure = this.$translate.instant('helpdesk.badOrgSearchInput');
      searchDone.resolve(this.stats(this.HelpdeskSplunkReporterService.ORG_SEARCH, this.currentSearch.orgSearchFailure));
    }
    return searchDone.promise;
  }

  public searchDevices(searchString, org) {
    let promises: any = [];
    const orgIsEntitledToCloudBerry = this.LicenseService.orgIsEntitledTo(org, this.Config.entitlements.room_system);
    const orgIsEntitledToHuron = this.LicenseService.orgIsEntitledTo(org, this.Config.entitlements.huron);

    this.searchingForDevices = orgIsEntitledToCloudBerry || orgIsEntitledToHuron;
    if (!(orgIsEntitledToCloudBerry || orgIsEntitledToHuron)) {
      this.currentSearch.deviceSearchFailure = this.$translate.instant(this.isCustomerHelpDesk ? 'helpdesk.noDeviceEntitlementsCustomerOrg' : 'helpdesk.noDeviceEntitlements');
    }
    if (orgIsEntitledToCloudBerry) {
      promises.push(this.searchForCloudberryDevices(searchString, org));
    }
    if (orgIsEntitledToHuron) {
      promises = promises.concat(this.searchForHuronDevices(searchString, org));
    }
    return promises;
  }

  public searchForCloudberryDevices(searchString, org) {
    const searchDone = this.$q.defer();
    this.searchingForCloudberryDevices = true;
    this.HelpdeskService.searchCloudberryDevices(searchString, org.id, this.searchResultsLimit).then((res) => {
      if (this.currentSearch.deviceSearchResults) {
        res = this.currentSearch.deviceSearchResults.concat(res);
      }
      this.currentSearch.deviceSearchResults = _.sortBy(res, (device: any) => {
        return device.displayName ? device.displayName.toLowerCase() : '';
      });
      this.setOrgOnDeviceSearchResults(this.currentSearch.deviceSearchResults);
      this.HelpdeskSearchHistoryService.saveSearch(this.currentSearch);
      this.searchHistory = this.HelpdeskSearchHistoryService.getAllSearches();
    }).catch(() => {
      this.currentSearch.deviceSearchFailure = this.$translate.instant('helpdesk.unexpectedError');
    }).finally(() => {
      this.searchingForCloudberryDevices = false;
      this.searchingForDevices = this.searchingForHuronDevices || this.searchingForHuronDevicesMatchingNumber;
      searchDone.resolve(this.stats(this.HelpdeskSplunkReporterService.DEVICE_SEARCH_CLOUDBERRY, this.currentSearch.deviceSearchResults || this.currentSearch.deviceSearchFailure));
    });
    return searchDone.promise;
  }

  public searchForHuronDevices(searchString, org) {
    const searchDone = this.$q.defer();

    this.searchingForHuronDevices = true;
    this.HelpdeskHuronService.searchDevices(searchString, org.id, this.searchResultsLimit).then((res) => {
      if (this.currentSearch.deviceSearchResults) {
        res = this.currentSearch.deviceSearchResults.concat(res);
      }
      this.currentSearch.deviceSearchResults = _.sortBy(res, function (device: any) {
        return device.displayName ? device.displayName.toLowerCase() : '';
      });
      this.setOrgOnDeviceSearchResults(this.currentSearch.deviceSearchResults);
      this.HelpdeskHuronService.setOwnerAndDeviceDetails(_.take(this.currentSearch.deviceSearchResults, this.currentSearch.deviceLimit));
      this.HelpdeskSearchHistoryService.saveSearch(this.currentSearch);
      this.searchHistory = this.HelpdeskSearchHistoryService.getAllSearches();
    }).catch((err) => {
      if (err.status === 404) {
        this.currentSearch.deviceSearchFailure = this.$translate.instant('helpdesk.huronNotActivated');
      } else {
        this.currentSearch.deviceSearchFailure = this.$translate.instant('helpdesk.unexpectedError');
      }
    }).finally(() => {
      this.searchingForHuronDevices = false;
      this.searchingForDevices = this.searchingForCloudberryDevices || this.searchingForHuronDevicesMatchingNumber;
      searchDone.resolve(this.stats(this.HelpdeskSplunkReporterService.DEVICE_SEARCH_HURON_NUMBER, this.currentSearch.deviceSearchResults || this.currentSearch.deviceSearchFailure));
    });

    const search2Done = this.$q.defer();
    this.searchingForHuronDevicesMatchingNumber = true;
    this.HelpdeskHuronService.findDevicesMatchingNumber(searchString, org.id, this.searchResultsLimit).then( (res) => {
      if (this.currentSearch.deviceSearchResults) {
        res = this.currentSearch.deviceSearchResults.concat(res);
      }
      this.currentSearch.deviceSearchResults = _.sortBy(res, function (device: any) {
        return device.displayName ? device.displayName.toLowerCase() : '';
      });
      this.setOrgOnDeviceSearchResults(this.currentSearch.deviceSearchResults);
      this.HelpdeskHuronService.setOwnerAndDeviceDetails(_.take(this.currentSearch.deviceSearchResults, this.currentSearch.deviceLimit));
      this.HelpdeskSearchHistoryService.saveSearch(this.currentSearch);
      this.searchHistory = this.HelpdeskSearchHistoryService.getAllSearches();
    }).catch((err) => {
      if (err.status === 404) {
        this.currentSearch.deviceSearchFailure = this.$translate.instant('helpdesk.huronNotActivated');
      } else {
        this.currentSearch.deviceSearchFailure = this.$translate.instant('helpdesk.unexpectedError');
      }
    }).finally(() => {
      this.searchingForHuronDevicesMatchingNumber = false;
      this.searchingForDevices = this.searchingForCloudberryDevices || this.searchingForHuronDevices;
      search2Done.resolve(this.stats(this.HelpdeskSplunkReporterService.DEVICE_SEARCH_HURON, this.currentSearch.deviceSearchResults || this.currentSearch.deviceSearchFailure));
    });
    return [searchDone.promise, search2Done.promise];
  }

  public searchOrders(searchString) {
    const searchDone = this.$q.defer();
    this.searchingForOrders = true;
    this.HelpdeskService.searchOrders(searchString).then((res) => {
      let orders = this.HelpdeskService.filterOrders(res);
      if (orders.length === 0) {
        this.currentSearch.orderSearchResults = null;
        this.currentSearch.orderSearchFailure = this.$translate.instant('helpdesk.noSearchHits');
      } else {
        orders = this.sortOrdersForDisplay(orders);
        this.currentSearch.orderSearchResults = orders;
        this.currentSearch.orderSearchFailure = null;
      }
      this.searchingForOrders = false;
      this.HelpdeskSearchHistoryService.saveSearch(this.currentSearch);
      this.searchHistory = this.HelpdeskSearchHistoryService.getAllSearches();
    }).catch ((err) => {
      this.searchingForOrders = false;
      this.currentSearch.orderSearchResults = null;
      this.currentSearch.orderSearchFailure = null;
      if (err.status === 404) {
        const errorCode = _.get(err.data, 'errorCode');
        // Compare the error code with 'Order not found' (400117)
        if (errorCode === 400117) {
          this.currentSearch.orderSearchFailure = this.$translate.instant('helpdesk.noSearchHits');
        } else {
          this.currentSearch.orderSearchFailure = this.$translate.instant('helpdesk.badOrderSearchInput');
        }
      } else if (err.cancelled === true || err.timedout === true) {
        this.currentSearch.orderSearchFailure = this.$translate.instant('helpdesk.cancelled');
      } else {
        this.currentSearch.orderSearchFailure = this.$translate.instant('helpdesk.unexpectedError');
      }
    }).finally(() => {
      searchDone.resolve(this.stats(this.HelpdeskSplunkReporterService.ORDER_SEARCH, this.currentSearch.orderSearchFailure || this.currentSearch.orderSearchResults));
    });
    return searchDone.promise;
  }

  public initSearchWithOrgFilter(org) {
    this.lookingUpOrgFilter = true;
    this.searchingForDevices = false;
    this.searchingForUsers = false;
    if (this.HelpdeskService.noOutstandingRequests()) {
      this.searchString = '';
      this.currentSearchClear();
      this.HelpdeskService.getOrg(org.id).then((fullOrg) => {
        this.lookingUpOrgFilter = false;
        this.currentSearch.orgFilter = fullOrg;
      }, _.noop);
    } else {
      this.HelpdeskService.cancelAllRequests().then( () => {
        this.searchString = '';
        this.currentSearchClear();
        this.HelpdeskService.getOrg(org.id).then((fullOrg) => {
          this.lookingUpOrgFilter = false;
          this.currentSearch.orgFilter = fullOrg;
        }, _.noop);
      });
    }
  }

  public initSearchWithoutOrgFilter() {
    this.searchString = '';
    this.currentSearchClear();
  }

  public showUsersResultPane() {
    return this.searchingForUsers || this.currentSearch.userSearchResults || this.currentSearch.userSearchFailure;
  }

  public showOrgsResultPane() {
    return this.searchingForOrgs || this.currentSearch.orgSearchResults || this.currentSearch.orgSearchFailure;
  }

  public showOrdersResultPane() {
    return this.searchingForOrders || this.currentSearch.orderSearchResults || this.currentSearch.orderSearchFailure;
  }

  public showDeviceResultPane() {
    return this.currentSearch.orgFilter && (this.searchingForDevices || this.currentSearch.deviceSearchResults || this.currentSearch.deviceSearchFailure);
  }

  public showMoreResults(type) {
    switch (type) {
      case 'user':
        this.currentSearch.userLimit += this.searchResultsPageSize;
        this.HelpdeskService.findAndResolveOrgsForUserResults(
          this.currentSearch.userSearchResults,
          this.currentSearch.orgFilter,
          this.currentSearch.userLimit);
        break;
      case 'org':
        this.currentSearch.orgLimit += this.searchResultsPageSize;
        break;
      case 'order':
        this.currentSearch.orderLimit += this.searchResultsPageSize;
        break;
      case 'device':
        this.currentSearch.deviceLimit += this.searchResultsPageSize;
        this.HelpdeskHuronService.setOwnerAndDeviceDetails(_.take(this.currentSearch.deviceSearchResults, this.currentSearch.deviceLimit));
        break;
    }
  }

  public setOrgOnDeviceSearchResults(deviceSearchResults) {
    _.each(deviceSearchResults, (device) => {
      device.organization = {
        id: this.currentSearch.orgFilter.id,
        displayName: this.currentSearch.orgFilter.displayName,
      };
    });
  }

  public sortOrdersForDisplay(orders) {
    const sorted: any = [];
    const serviceIdKeys: any = [];
    _.forEach(orders,  (order) => {
      if (!(_.includes(serviceIdKeys, order.serviceId))) {
        serviceIdKeys.push(order.serviceId);
        sorted.push(order);
      }
    });
    return sorted;
  }

  public arrowNavigation($event, index, locator) {
    switch ($event.keyCode) {
      // UP/DOWN arrows allow for navigating list, skipping the search icon when it is present
      // Tabbing will follow tab order and include the search icon when it is present
      case this.KeyCodes.UP:
        if (index > 0) {
          const previousIndex = index - 1;
          this.AccessibilityService.setFocus(this.$element, '.' + locator + '-card-' + previousIndex + ' article');
        }
        break;
      case this.KeyCodes.DOWN:
        const nextIndex = index + 1;
        this.AccessibilityService.setFocus(this.$element, '.' + locator + '-card-' + nextIndex + ' article');
        break;
    }
  }

  public keyPressHandler(event) {
    if (!this.AccessibilityService.isVisible(this.AccessibilityService.MODAL)) {
      const S = 83;
      const activeElement = this.$element.find(event.target);
      const inputFieldHasFocus = activeElement[0]['id'] === 'searchInput';
      if (inputFieldHasFocus && !(event.keyCode === this.KeyCodes.ESCAPE || event.keyCode === this.KeyCodes.ENTER)) {
        return; // if not escape and enter, nothing to do
      }

      switch (event.keyCode) {
        case this.KeyCodes.ESCAPE:
          if (inputFieldHasFocus) {
            this.initSearchWithoutOrgFilter();
          } else {
            this.$element.find('#searchInput').focus().select();
          }
          break;

        case S:
          const orgLink = JSON.parse(activeElement.find('a')[0]['name']);
          // TODO: Avoid throwing console error when element not found !
          if (orgLink) {
            this.initSearchWithOrgFilter(orgLink);
          }
          break;
      }
    }
  }

  public setSearchFieldFocus() {
    if (this.HelpdeskService.checkIfMobile()) {
      this.$element.find('#searchInput').blur();
    } else {
      this.$element.find('#searchInput').focus();
    }
  }

  public stats(searchType, details) {
    return {
      searchType: searchType,
      details: details,
    };
  }

  public reportSearchSummary(searchString, res, startTime, orgId) {
    this.HelpdeskSplunkReporterService.reportStats(searchString, res, startTime, orgId);
  }
}

angular
  .module('Squared')
  .controller('HelpdeskController', HelpdeskController);
