(function () {
  'use strict';

  module.exports = ProvisioningService;
  /* @ngInject */
  function ProvisioningService() {
    /*
     * Variables.
     */
    var results = [];

    /*
     * Get Orders.
     * TODO: connect to the back-end once it's ready (back-end team)
     */
    function getOrders() {
      results = [{
        orderNumber: '3468364384638',
        customerName: 'Designit Oslo',
        customerMail: 'osl-infrastructure@designit.com',
        partnerName: 'Cisco',
        partnerMail: 'svanneyg@cisco.com',
        manualTask: '200 - This is sample text',
        status: 'Pending',
        statusCode: '0',
        received: '24-05-2017',
        actions: '...',
        site: [
          {
            siteUrl: 'designitoslo.webex.com',
            action: 'LOV:New, Modify, Cancel, Transfer, Suspend, Resume',
            timeZoneId: '',
            countryCode: '',
            specialHandlingRequired: 'LOV: None(empty string), Government, EarlyAdopter, Developer',
            primaryLanguage: 'en-us',
            additionalLanguage: '',
          },
        ],
      }, {
        orderNumber: '8484478473871',
        customerName: 'Designit Aarhus',
        customerMail: 'aar-infrastructure@designit.com',
        partnerName: 'Cisco',
        partnerMail: 'contacr@cisco.com',
        manualTask: '300 - This is sample text',
        status: 'Pending',
        statusCode: '0',
        received: '24-05-2017',
        actions: '...',
        site: [],
      }, {
        orderNumber: '4873483748373',
        customerName: 'This is a test',
        customerMail: 'test@gmail.com',
        partnerName: 'Cisco',
        partnerMail: 'svanneyg@cisco.com',
        manualTask: '500 - This is sample text',
        status: 'In Progress',
        statusCode: '1',
        received: '24-05-2017',
        actions: '...',
        site: [],
      }, {
        orderNumber: '9348734666437',
        customerName: 'Random company',
        customerMail: 'random@company.com',
        partnerName: 'Designit',
        partnerMail: 'osl@designit.com',
        manualTask: '200 - This is sample text',
        status: 'Completed',
        statusCode: '2',
        received: '24-05-2017',
        completionDate: '04-07-2017',
        actions: '...',
        site: [
          {
            siteUrl: 'abc.webex.com',
            action: 'LOV:New, Modify, Cancel, Transfer, Suspend, Resume',
            timeZoneId: '',
            countryCode: '',
            specialHandlingRequired: 'LOV: None(empty string), Government, EarlyAdopter, Developer',
            primaryLanguage: 'en-us',
            additionalLanguage: '',
          },
          {
            siteUrl: 'xyz.webex.com',
            action: 'LOV:New, Modify, Cancel, Transfer, Suspend, Resume',
            timeZoneId: '',
            countryCode: '',
            specialHandlingRequired: 'LOV: None(empty string), Government, EarlyAdopter, Developer',
            primaryLanguage: 'en-us',
            additionalLanguage: '',
          },
        ],
        serviceItems: {
          audio: [
            {
              productName: 'WX',
              serviceName: 'LOV:TSP, WEBEX',
              action: 'New',
              siteUrl: '',
              audioBroadcast: 'True',
              callBack: 'True',
              callBackInternational: 'True',
              callinToll: 'True',
              callinTollFree: 'True',
              callinGlobal: 'True',
              cloudConnectedAudio: 'True',
              integratedVOIP: 'True',
              sipInOut: 'False',
            },
            {
              productName: 'ABC 123',
              serviceName: 'LOV:TSP, WEBEX',
              action: 'New',
              siteUrl: 'abc.webex.com',
              audioBroadcast: 'True',
              callBack: 'True',
              callBackInternational: 'True',
              callinToll: 'True',
              callinTollFree: 'True',
              callinGlobal: 'True',
              cloudConnectedAudio: 'True',
              integratedVOIP: 'True',
              sipInOut: 'False',
            },
            {
              productName: 'ABC 000',
              serviceName: 'LOV:TSP, WEBEX',
              action: 'New',
              siteUrl: 'abc.webex.com',
              audioBroadcast: 'True',
              callBack: 'True',
              callBackInternational: 'True',
              callinToll: 'True',
              callinTollFree: 'True',
              callinGlobal: 'True',
              cloudConnectedAudio: 'True',
              integratedVOIP: 'True',
              sipInOut: 'False',
            },
          ],
          conferencing: [
            {
              productName: 'WX',
              serviceName: 'MC',
              action: 'New',
              siteUrl: 'abc.webex.com',
              attendeeCapacity: '8',
              attendeeOverage: 'True',
              licenseVolume: '',
              licenseOverage: 'True',
              licenseModel: 'HOSTS/PORTS/MINUTES/Cloud Shared Meeting',
            },
            {
              productName: 'WX',
              serviceName: 'EC',
              action: 'New',
              siteUrl: 'xyz.webex.com',
              attendeeCapacity: '8',
              attendeeOverage: 'True',
              licenseVolume: '',
              licenseOverage: 'True',
              licenseModel: 'HOSTS/PORTS/MINUTES/Cloud Shared Meeting',
            },
          ],
          storage: [
            {
              productName: 'CLOUD',
              serviceName: 'ST',
              storageCapacity: '1000',
              storageOverage: 'True',
              action: 'New',
            },
            {
              productName: 'CLOUD',
              serviceName: 'ST',
              storageCapacity: '1000',
              storageOverage: 'True',
              action: 'New',
              siteUrl: 'abc.webex.com',
            },
          ],
          cmr: [
            {
              productName: 'WX',
              serviceName: 'CMR',
              cmr: 'True',
              cmrCapacity: '',
              cmrLicenseVolume: '',
              siteUrl: 'abc.webex.com',
              action: 'New',
            },
          ],
        },
      }];

      return results;
    }

    /*
     * Search for orders
     * TODO: connect to the back-end once it's ready (back-end team)
     */
    function searchForOrders() {
      results = [
        {
          orderNumber: '3158364666638',
          customerName: 'This is a placeholder search result',
          customerMail: 'placeholder@searchresult.com',
          partnerName: 'Example',
          partnerMail: 'example@placeholder.com',
          manualTask: '200 - This is sample text',
          status: 'Pending',
          statusCode: '0',
          received: '24-05-2017',
          actions: '...',
          site: [
            {
              siteUrl: 'designitoslo.webex.com',
              action: 'LOV:New, Modify, Cancel, Transfer, Suspend, Resume',
              timeZoneId: '',
              countryCode: '',
              specialHandlingRequired: 'LOV: None(empty string), Government, EarlyAdopter, Developer',
              primaryLanguage: 'en-us',
              additionalLanguage: '',
            },
          ],
        },
        {
          orderNumber: '3468364384638',
          customerName: 'This is a placeholder search result',
          customerMail: 'placeholder@searchresult.com',
          partnerName: 'Example',
          partnerMail: 'example@placeholder.com',
          manualTask: '200 - This is sample text',
          status: 'Completed',
          statusCode: '2',
          received: '24-05-2017',
          actions: '...',
          site: [
            {
              siteUrl: 'designitoslo.webex.com',
              action: 'LOV:New, Modify, Cancel, Transfer, Suspend, Resume',
              timeZoneId: '',
              countryCode: '',
              specialHandlingRequired: 'LOV: None(empty string), Government, EarlyAdopter, Developer',
              primaryLanguage: 'en-us',
              additionalLanguage: '',
            },
          ],
        },
      ];
      return results;
    }

    /*
     * Update status of an order.
     * TODO: connect to the back-end once it's ready (back-end team)
     */
    function updateOrderStatus(order, category) {
      var categories = ['Pending', 'In Progress', 'Completed'];
      return _.map(results, function (r) {
        if (r.orderNumber === order.orderNumber) {
          r.statusCode = category;
          r.status = categories[category];
        }
        return r;
      });
    }

    var service = {
      getOrders: getOrders,
      searchForOrders: searchForOrders,
      updateOrderStatus: updateOrderStatus,
    };

    return service;
  }
}());
