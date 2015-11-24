(function () {
  'use strict';

  angular
    .module('Core')
    .controller('OverviewCtrl', OverviewCtrl);

  /* @ngInject */
  function OverviewCtrl($scope, Log, Authinfo, $translate, $state, ReportsService, Orgservice, ServiceDescriptor, ServiceStatusDecriptor, Config) {
    var vm = this;

    vm.pageTitle = $translate.instant('overview.pageTitle');

    vm.cards = [
      new MessageCard(),
      new MeetingCard(),
      new CallCard(),
      new RoomSystemCard()
    ];

    vm.userCard = new UserCard();
    vm.hybridCard = new HybridServicesCard();

    _.each(vm.cards, function (card) {
      if (card.licenseEventHandler) {
        card.licenseEventHandler(Authinfo.getLicenses());
      }
    });

    vm.statusPageUrl = Config.getStatusPageUrl();

    vm.openConvertModal = function () {
      $state.go('users.convert', {});
    };

    _.each(['oneOnOneCallsLoaded', 'groupCallsLoaded', 'conversationsLoaded', 'activeRoomsLoaded'], function (eventType) {
      $scope.$on(eventType, function (event, response) {
        _.each(vm.cards, function (card) {
          if (card.reportDataEventHandler) {
            card.reportDataEventHandler(event, response);
          }
        });
      });
    });

    ReportsService.getOverviewMetrics(true);

    Orgservice.getOrg(function (orgData) {
      _.each(vm.cards, function (card) {
        if (card.orgEventHandler) {
          card.orgEventHandler(orgData);
        }
      });
      vm.userCard.orgEventHandler(orgData);
    });
    Orgservice.getUnlicensedUsers(vm.userCard.unlicensedUsersHandler);

    ReportsService.healthMonitor(function (data, status) {
      if (data.success) {
        _.each(vm.cards, function (card) {
          if (card.healthStatusUpdatedHandler) {
            card.healthStatusUpdatedHandler(data);
          }
        });
      } else {
        Log.error("Get health status failed. Status: " + status);
      }
    });

    ServiceDescriptor.services(function (err, services) {
      if (!err) {
        if (vm.hybridCard.hybridStatusEventHandler) {
          vm.hybridCard.hybridStatusEventHandler(services);
        }
      }
    });

    vm.isCalendarAcknowledged = true;
    vm.isCallAcknowledged = true;

    Orgservice.getHybridServiceAcknowledged().then(function (response) {
      if (response.status === 200 && response.data.items) {
        vm.isCalendarAcknowledged = !!_.chain(response.data.items).find({
          id: 'sqared-fusion-cal'
        }).get('acknowledged', true).value();
        vm.isCallAcknowledged = !!_.chain(response.data.items).find({
          id: 'sqared-fusion-uc'
        }).get('acknowledged', true).value();
      } else {
        Log.error("Error in GET service acknowledged status");
      }
    });

    vm.setupNotDone = function () {
      return !!(!Authinfo.isSetupDone() && Authinfo.isCustomerAdmin());
    };

    ServiceStatusDecriptor.servicesInOrgWithStatus().then(vm.hybridCard.adminOrgServiceStatusEventHandler);

  }

  function mapStatus(oldStatus, componentStatus) {
    if (oldStatus == 'error') return 'error';
    if (componentStatus == "partial_outage" || oldStatus == 'warning') return "warning";
    if (componentStatus == "operational") return "success";
    return "error";
  }

  function isntCancelledOrSuspended(license){
    return !(license.status === 'CANCELLED' || license.status === 'SUSPENDED');
  }

  function meeetingHealthEventHandler(card, data) {
    _.each(data.components, function (component) {
      if (component.name == 'Media/Calling') {
        card.healthStatus = mapStatus(card.healthStatus, component.status);
      }
    });
  }

  function MessageCard() {
    var card = this;
    this.icon = 'icon-circle-message';
    this.desc = 'overview.cards.message.desc';
    this.name = 'overview.cards.message.title';
    this.currentTitle = 'overview.cards.message.currentTitle';
    this.previousTitle = 'overview.cards.message.previousTitle';
    this.trial = false;
    this.enabled = false;

    this.reportDataEventHandler = function (event, response) {

      if (!response.data.success) return;
      if (event.name == 'conversationsLoaded' && response.data.spanType == 'week' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[response.data.data.length - 1].count);
        card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
      }
    };

    this.healthStatusUpdatedHandler = function messageHealthEventHandler(data) {
      _.each(data.components, function (component) {
        if (component.name == 'Mobile Clients' || component.name == 'Rooms' || component.name == 'Web and Desktop Clients') {
          card.healthStatus = mapStatus(card.healthStatus, component.status);
        }
      });
    };

    this.licenseEventHandler = function (licenses) {
      this.allLicenses = licenses;
      card.trial = _.any(filterLicenses(licenses), {
        'isTrial': true
      });

      if (filterLicenses(licenses).length > 0) {
        card.enabled = true; //don't disable if no licenses in case test org..
      }
    };

    function filterLicenses(licenses) {
      return _.filter(licenses, function (l) {
        return l.licenseType === 'MESSAGING' && isntCancelledOrSuspended(l);
      });
    }
    this.orgEventHandler = function (data) {
      if (data.success && data.isTestOrg && this.allLicenses && this.allLicenses.length === 0) {
        card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
      }
    };
  }

  function MeetingCard() {
    var card = this;
    this.icon = 'icon-circle-group';
    this.desc = 'overview.cards.meeting.desc';
    this.name = 'overview.cards.meeting.title';
    this.cardClass = 'meetings';
    this.notEnabledText = 'overview.cards.meeting.notEnabledText';
    this.notEnabledFooter = 'overview.contactPartner';
    this.trial = false;
    this.enabled = false;
    this.settingsUrl = '';
    this.healthStatusUpdatedHandler = _.partial(meeetingHealthEventHandler, card);

    this.reportDataEventHandler = function (event, response) {
      if (!response.data.success) return;
      if (event.name === 'groupCallsLoaded' && response.data.spanType === 'month' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[response.data.data.length - 1].count);
        card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
      }
    };

    this.licenseEventHandler = function (licenses) {
      this.allLicenses = licenses;

      card.trial = _.some(filterLicenses(licenses), {
        'isTrial': true
      });

      var hasSites = _.some(licenses, function (l) {
        return l.siteUrl;
      });

      this.settingsUrl = hasSites ? '#/site-list' : '';

      if (filterLicenses(licenses).length > 0) {
        card.enabled = true; //don't disable if no licenses in case test org..
      }
    };

    this.orgEventHandler = function (data) {
      if (data.success && data.isTestOrg && this.allLicenses && this.allLicenses.length === 0) {
        card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
      }
    };

    function filterLicenses(licenses) {
      return _.filter(licenses, function (l) {
        //    (['CF', 'EE', 'MC', 'SC', 'TC', 'EC']).contains(l.offername);
        return l.licenseType === 'CONFERENCING' && isntCancelledOrSuspended(l);
      });
    }
  }

  //list: https://sqbu-github.cisco.com/WebExSquared/wx2-admin-service/blob/master/common/src/main/java/com/cisco/wx2/atlas/common/bean/order/OfferCode.java

  function CallCard() {
    var card = this;
    this.icon = 'icon-circle-call';
    this.desc = 'overview.cards.call.desc';
    this.name = 'overview.cards.call.title';
    this.cardClass = 'people';
    this.trial = false;
    this.enabled = false;
    this.notEnabledText = 'overview.cards.call.notEnabledText';
    this.notEnabledFooter = 'overview.contactPartner';
    this.settingsUrl = '#/hurondetails/settings';
    this.healthStatusUpdatedHandler = _.partial(meeetingHealthEventHandler, card);
    this.reportDataEventHandler = function (event, response) {
      if (!response.data.success) return;
      if (event.name == 'oneOnOneCallsLoaded' && response.data.spanType == 'month' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[response.data.data.length - 1].count);
        card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
      }
    };

    this.licenseEventHandler = function (licenses) {
      this.allLicenses = licenses;

      card.trial = _.any(filterLicenses(licenses), {
        'isTrial': true
      });

      if (filterLicenses(licenses).length > 0) {
        card.enabled = true; //don't disable if no licenses in case test org..
      }
    };

    this.orgEventHandler = function (data) {
      if (data.success && data.isTestOrg && this.allLicenses && this.allLicenses.length === 0) {
        card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
      }
    };

    function filterLicenses(licenses) {
      return _.filter(licenses, function (l) {
        //  return l.offerName === 'CO'
        return l.licenseType === 'COMMUNICATION' && isntCancelledOrSuspended(l);
      });
    }
  }

  function RoomSystemCard() {
    var card = this;
    this.icon = 'icon-circle-telepresence';
    this.desc = 'overview.cards.roomSystem.desc';
    this.name = 'overview.cards.roomSystem.title';
    this.cardClass = 'gray';
    this.enabled = false;
    this.trial = false;
    this.notEnabledText = 'overview.cards.roomSystem.notEnabledText';
    this.notEnabledFooter = 'overview.contactPartner';
    this.currentTitle = 'overview.cards.roomSystem.currentTitle';
    this.previousTitle = 'overview.cards.roomSystem.previousTitle';
    this.settingsUrl = '#/devices';

    this.healthStatusUpdatedHandler = function roomSystemHealthEventHandler(data) {
      var room = _.find(data.components, {
        name: 'Rooms'
      });
      if (room) {
        card.healthStatus = mapStatus(card.healthStatus, room.status);
      }
    };

    this.reportDataEventHandler = function (event, response) {

      if (!response.data.success) return;
      if (event.name == 'activeRoomsLoaded' && response.data.spanType == 'week' && response.data.intervalCount >= 2) {
        card.current = Math.round(response.data.data[response.data.data.length - 1].count);
        card.previous = Math.round(response.data.data[response.data.data.length - 2].count);
      }
    };

    this.licenseEventHandler = function (licenses) {
      this.allLicenses = licenses;
      card.trial = _.some(filterLicenses(licenses), {
        'isTrial': true
      });

      if (filterLicenses(licenses).length > 0) {
        card.enabled = true; //don't disable if no licenses in case test org..
      }
    };

    function filterLicenses(licenses) {
      return _.filter(licenses, function (l) {
        return l.offerName === 'SD' && isntCancelledOrSuspended(l); //SD = Shared Devices
      });
    }
    this.orgEventHandler = function (data) {
      if (data.success && data.isTestOrg && this.allLicenses && this.allLicenses.length === 0) {
        card.enabled = true; //If we are a test org and allLicenses is empty, enable the card.
      }
    };
  }

  function UserCard() {
    var card = this;

    this.unlicensedUsersHandler = function (data) {
      if (data.success) {
        card.usersToConvert = (data.resources || []).length; // for now use the length to get the count as there is a bug in CI and totalResults is not accurate.
      }
    };

    this.orgEventHandler = function (data) {
      if (data.success) {
        card.ssoEnabled = data.ssoEnabled || false;
        card.dirsyncEnabled = data.dirsyncEnabled || false;
      }
    };
  }

  function HybridServicesCard() {
    var card = this;
    this.icon = 'icon-circle-data';
    this.enabled = true;
    this.notEnabledText = 'overview.cards.hybrid.notEnabledText';
    this.notEnabledAction = '#overview';
    this.notEnabledActionText = 'overview.cards.hybrid.notEnabledActionText';
    this.hybridStatusEventHandler = function (services) {
      card.services = services;
      card.populateServicesWithHealth();
    };

    this.adminOrgServiceStatusEventHandler = function (data) {
      card.servicesStatus = data.status;
      card.populateServicesWithHealth();
    };

    this.populateServicesWithHealth = function () {
      if (card.services && card.servicesStatus) {
        _.each(card.services, function (service) {
          service.healthStatus = (serviceToTypeMap[service.id] && card.servicesStatus && card.servicesStatus[serviceToTypeMap[service.id]]) ? 'success' : 'warning';
        });
      }
    };

    var serviceToTypeMap = {};

    serviceToTypeMap['squared-fusion-mgmt'] = "c_mgmt";
    serviceToTypeMap['squared-fusion-uc'] = "c_ucmc";
    serviceToTypeMap['squared-fusion-cal'] = "c_cal";
    serviceToTypeMap['squared-fusion-media'] = "mf_mgmt";
    //:  "cs_mgmt",  not mapped
    serviceToTypeMap['center-context'] = "cs_context";
    //"d_openj"  not mapped
  }
})();
