/* global parseAddress */
(function () {
  'use strict';

  angular.module('Huron')
    .factory('PstnServiceAddressService', PstnServiceAddressService);

  /* @ngInject */
  function PstnServiceAddressService($q, TerminusLookupE911Service, TerminusCustomerSiteService) {
    var service = {
      lookupAddress: lookupAddress,
      getAddress: getAddress,
      updateAddress: updateAddress,
      listCustomerSites: listCustomerSites,
      createCustomerSite: createCustomerSite
    };

    // Mapping of terminus to huron address object keys
    var addressMapping = {
      address1: 'streetAddress',
      address2: 'unit',
      city: 'city',
      state: 'state',
      zip: 'zip'
    };

    // Terminus service address data structure
    var serviceAddressMapping = {
      serviceName: 'name',
      serviceStreetNumber: 'number',
      serviceStreetDirection: 'prefix',
      serviceStreetName: 'street',
      serviceStreetSuffix: 'type',
      serviceAddressSub: 'unit',
      serviceCity: 'city',
      serviceState: 'state',
      serviceZip: 'zip'
    };

    return service;

    function formatServiceAddress(_address) {
      // copy address for manipulation
      var address = angular.copy(_address);
      // create a parseable address
      var parseableAddress = _.chain([address.streetAddress, address.unit, address.city, address.state, address.zip]).compact().join(', ').value();
      // merge in parsed street address values
      _.merge(address, parseAddress.parseAddress(parseableAddress));
      // transform a return object based on our mapping structure
      var serviceAddress = _.transform(serviceAddressMapping, function (result, val, key) {
        // Set mapped value, default to empty string if not found
        result[key] = _.get(address, val, '');
      });
      return serviceAddress;
    }

    function formatAddressFromServiceAddress(serviceAddress) {
      // Convert terminus service address object to parsed huron address object
      var parsedAddress = mapKeys(serviceAddress, serviceAddressMapping);
      // Append the full street address // TODO better way to reconstruct?
      var parsedStreetAddress = [parsedAddress.number, parsedAddress.prefix, parsedAddress.street, parsedAddress.type];
      // Remove empty values and convert to string
      parsedAddress.streetAddress = _.chain(parsedStreetAddress).reject(_.isEmpty).join(' ').value();
      // Filter the parsedAddress for properties that should exist in the addressMapping
      var address = _.pick(parsedAddress, function (val, key) {
        // parsed address key should exist in addressMapping value
        return _.contains(addressMapping, key);
      });
      return address;
    }

    function mapKeys(address, keyMapping) {
      return _.mapKeys(address, function (value, key) {
        return keyMapping[key];
      });
    }

    function getTerminusAddress(address) {
      return mapKeys(address, _.invert(addressMapping));
    }

    function getHuronAddress(address) {
      return mapKeys(address, addressMapping);
    }

    function lookupAddress(address) {
      // format terminus payload and omit empty strings
      var searchPayload = getTerminusAddress(_.omit(address, _.isEmpty));
      return TerminusLookupE911Service.save({}, searchPayload).$promise
        .then(function (response) {
          var address = _.get(response, 'addresses[0]');
          if (address) {
            // Remove response value if None
            if (address.address2 === 'None') {
              delete address.address2;
            }
            // format response back to huron model
            return getHuronAddress(address);
          }
        });
    }

    function getAddress(customerId) {
      return listCustomerSites(customerId)
        .then(function (sites) {
          // Get service address from site and format to huron address object
          var serviceAddress = _.get(sites, '[0].serviceAddress');
          if (serviceAddress) {
            return formatAddressFromServiceAddress(serviceAddress);
          }
        });
    }

    function listCustomerSites(customerId) {
      return TerminusCustomerSiteService.query({
          customerId: customerId
        }).$promise
        .then(function (sites) {
          var promises = [];
          // Lookup each site and add the serviceAddress to original response
          _.forEach(sites, function (site) {
            var promise = getCustomerSite(customerId, site.uuid)
              .then(function (siteDetail) {
                site.serviceAddress = siteDetail.serviceAddress;
                return site;
              });
            promises.push(promise);
          });
          return $q.all(promises);
        });
    }

    function getCustomerSite(customerId, siteId) {
      return TerminusCustomerSiteService.get({
        customerId: customerId,
        siteId: siteId
      }).$promise;
    }

    function createCustomerSite(customerId, name, address) {
      var payload = {
        name: name,
        serviceAddress: {}
      };
      address.name = name;
      payload.serviceAddress = formatServiceAddress(address);
      return TerminusCustomerSiteService.save({
        customerId: customerId
      }, payload).$promise;
    }

    function updateSite(customerId, siteId, site) {
      return TerminusCustomerSiteService.update({
        customerId: customerId,
        siteId: siteId
      }, site).$promise;
    }

    function updateAddress(customerId, address) {
      var site = {
        serviceAddress: formatServiceAddress(address)
      };
      return listCustomerSites(customerId)
        .then(function (sites) {
          var siteId = _.get(sites, '[0].uuid');
          if (siteId) {
            site.serviceAddress.serviceName = _.get(sites, '[0].name');
            return updateSite(customerId, siteId, site);
          } else {
            return $q.reject('Site not found');
          }
        });
    }

  }
})();
