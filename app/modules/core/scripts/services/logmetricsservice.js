(function () {
  'use strict';

  angular.module('Core')
    .service('LogMetricsService', LogMetricsService);

  /* @ngInject */
  function LogMetricsService($http, Authinfo, Config, Log, UrlConfig) {

    function LogMetricEvent(eventAction, eventType, status, elapsedTime, units, data) {
      this.logStatus = status;
      this.eventAction = eventAction;
      this.eventType = eventType;
      this.units = units;
      this.time = moment().utc().format();
      this.elapsedTime = elapsedTime;
      if (data !== null)
        this.data = data;
    }

    return {
      eventAction: {
        buttonClick: 'BUTTONCLICK',
        pageLoad: 'PAGELOAD',
        keyInputs: 'KEYINPUTS'
      },

      eventType: {
        inviteUsers: 'INVITEUSERS',
        partnerLogin: 'PARTNERLOGIN',
        partnerCustomersPage: 'PARTNERCUSTOMERSPAGE',
        trialPage: 'TRIALPAGE',
        trialDidPage: 'TRIALDIDPAGE',
        trialDidEntered: 'TRIALDIDENTERED',
        trialStarted: 'TRIALSTARTED',
        trialEdited: 'TRIALEDITED',
        organizationPage: 'ORGANIZATIONPAGE',
        organizationCreated: 'ORGANIZATIONCREATED',
        customerLogin: 'CUSTOMERLOGIN',
        customerOverviewPage: 'CUSTOMEROVERVIEWPAGE',
        customerUsersListPage: 'CUSTOMERUSERSLISTPAGE',
        customerDevicesPage: 'CUSTOMERDEVICESPAGE',
        customerReportsPage: 'CUSTOMERREPORTSPAGE',
        customerSupportPage: 'CUSTOMERSUPPORTPAGE',
        customerAccountPage: 'CUSTOMERACCOUNTPAGE',
        customerInviteUsersPage: 'CUSTOMERINVITEUSERSPAGE',
        userOnboardEmailSent: 'USERONBOARDEMAILSENT',
        convertUsers: 'CONVERTUSERS',
        bulkUsers: 'BULKUSERS',
        bulkCsvUsers: 'BULKCSVUSERS',
        bulkDirSyncUsers: 'BULKDIRSYNCUSERS',
        domainManageAdd: 'DOMAINADD',
        domainManageRemove: 'DOMAINREM',
        domainManageVerify: 'DOMAINVER',
        domainManageInstructions: 'DOMAININST',
        helpdeskSearch: 'HELPDESKSEARCH',
        helpdeskOperation: 'HELPDESKOPERATION'
      },

      getEventAction: function (eAction) {
        return this.eventAction[eAction];
      },

      getEventType: function (eType) {
        return this.eventType[eType];
      },

      logMetrics: function (msg, eType, eAction, status, startLog, units, data) {
        var metricUrl = UrlConfig.getLogMetricsUrl();
        var events = [];
        Log.debug(msg);

        if (eType !== undefined && eAction !== undefined) {
          var endLog = moment();
          var elapsedTime = moment(endLog, 'DD/MM/YYYY HH:mm:ss').diff(moment(startLog, 'DD/MM/YYYY HH:mm:ss'));

          events[0] = new LogMetricEvent(eAction, eType, status, elapsedTime, units, data);
          var logsMetricEvent = {
            metrics: events
          };
          Log.debug(logsMetricEvent);
          if (Config.isProd()) {
            $http.post(metricUrl, logsMetricEvent);
          }
        } else {
          Log.error('Invalid eventAction/eventType.');
        }
      },

      logMetricsState: function (state) {
        var msg = null;
        var eType = null;
        var stateFound = true;

        switch (state.name) {
        case 'trialAdd.info':
          msg = "In trial page";
          eType = this.getEventType('trialPage');
          break;
        case 'trialAdd.addNumbers':
          msg = "In trial DID page";
          eType = this.getEventType('trialDidPage');
          break;
        case 'organization-overview.add.info':
          msg = "In organization creation page";
          eType = this.getEventType('organizationPage');
          break;
        case 'overview':
          msg = "In customer overview page";
          eType = this.getEventType('customerOverviewPage');
          break;
        case 'devices':
          if (Authinfo.isCustomerAdmin()) {
            msg = "In customer devices page";
            eType = this.getEventType('customerDevicesPage');
          } else {
            stateFound = false;
          }
          break;
        case 'reports':
          msg = "In customer reports page";
          eType = this.getEventType('customerReportsPage');
          break;
        case 'support':
          msg = "In customer support page";
          eType = this.getEventType('customerSupportPage');
          break;
        case 'profile':
          if (Authinfo.isCustomerAdmin()) {
            msg = "In customer account page";
            eType = this.getEventType('customerAccountPage');
          } else {
            stateFound = false;
          }
          break;
        case 'users.add':
          msg = "In invite users page";
          eType = this.getEventType('customerInviteUsersPage');
          break;
        default:
          stateFound = false;
          break;
        }

        if (stateFound && (msg !== null) && (eType !== null)) {
          this.logMetrics(msg, eType, this.eventAction['buttonClick'], 200, moment(), 1, null);
        }
      }

    };
  }
})();
