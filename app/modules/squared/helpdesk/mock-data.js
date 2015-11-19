(function () {
  'use strict';

  var mockData = {
    users: [{
      "id": "ddb4dd78-26a2-45a2-8ad8-4c181c5b3f0a",
      "organization": {
        id: "ce8d17f8-1734-4a54-8510-fae65acc505e"
      },
      "userName": "tom.vasset+marvelhelpdesk@gmail.com",
      "displayName": "Tom Vasset (mock)",
      "phoneNumbers": [{
        "type": "work",
        "value": "+47 67 51 14 67"
      }, {
        "type": "mobile",
        "value": "+47 92 01 30 30"
      }]
    }, {
      "id": "335bf4a2-a09c-45ba-a72a-e3f1de613295",
      "organization": {
        "id": "ce8d17f8-1734-4a54-8510-fae65acc505e"
      },
      "userName": "jayScott@marvel.com",
      "displayName": "Jay Scott",
      "phoneNumbers": []
    }, {
      "id": "2f4c85f7-e827-4b28-b567-0e49693b3f75",
      "organization": {
        "id": "ce8d17f8-1734-4a54-8510-fae65acc505e"
      },
      "userName": "shamim.pirzada+marvelenduser@gmail.com",
      "displayName": "Shamim",
      "phoneNumbers": []
    }],
    orgs: [{
      "id": "ce8d17f8-1734-4a54-8510-fae65acc505e",
      "displayName": "Marvel Partners (Mock)",
      "isPartner": true
    }, {
      "id": "bc1d8493-69a7-4ba7-a0c0-62abf1b57ac6",
      "displayName": "Autobots",
      "isPartner": false
    }],
    org: {
      "id": "ce8d17f8-1734-4a54-8510-fae65acc505e",
      "displayName": "Marvel Partners (Mock)",
      "isPartner": true,
      "entitlements": [
        "squared-fusion-cal",
        "webex-squared",
        "squared-fusion-mgmt"
        ],
      "contact": "MOCK tywin.lannister@kingslanding.com",
      "claimedDomains": ["MOCK kingslanding.com", "MOCK kingslanding2.com"],
      "partners": ["MOCK Drogon Solutions", "MOCK Red Keep Global"],
      "administratorUsers": ["MOCK Lannister Administrator 1", "MOCK Lannister Administrator 2"]
    },
    devices: {
      "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/94b3e13c-b1dd-5e2a-9b64-e3ca02de51d3": {
        "displayName": "Testing DR",
        "cisUuid": "f50d76ed-b6d3-49fb-9b40-8cf4d993b7f6",
        "url": "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/94b3e13c-b1dd-5e2a-9b64-e3ca02de51d3",
        "createTime": "2015-11-12T13:16:36.274Z",
        "serial": "FTT1927036F",
        "mac": "18:8B:9D:D4:52:02",
        "product": "Cisco TelePresence SX10",
        "state": "CLAIMED",
        "remoteSupportUser": {
          "username": "remotesupport",
          "token": "CiFhqu7+cTK6PTWqhlecj8dLMy3FtObgyn57aqZK3mnCcnPJdjBfcG01Q2sSyJjlaqinlTpa+Huw3XMunS7r8QLc4B365ku46s7l8R8vS8Xnqjxb8CeCjbCERVYRRRX6OxvgRriAD5F0n3zipQV992ZOckWSJAYLz+MHqICBfIZKD2JhfNdgPEn3PyKceIZhQgUpXqKRUcg7MIByC+TImrj97TWNgHkr2hg5cQ/0H3pHNmDH9poF2w1ECmUhcux8PDYm0Vp0KXlXatHcjdjYGhd6h6xN/yhl2FL3JAX6J6G6TTI/xBXZZuFydDPyBRP+8i3EcgJPSPfty7/9taty9A==",
          "expiryTime": "2038-01-19T03:14:07.000Z"
        }
      },
      "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/56c6a1f4-1e9d-50fc-b560-21496452ba72": {
        "displayName": "manyhus-sx20",
        "cisUuid": "1f2c2b8e-463e-40db-b07c-c6ed2cea0284",
        "url": "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/56c6a1f4-1e9d-50fc-b560-21496452ba72",
        "createTime": "2015-10-13T12:34:24.680Z",
        "serial": "FTT173601WA",
        "mac": "E8:ED:F3:B5:DB:8F",
        "product": "Cisco TelePresence SX20",
        "state": "CLAIMED"
      },
      "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/07a6cda9-9b11-5155-8de6-571841c41235": {
        "displayName": "Stian Pedersen SX20-1",
        "cisUuid": "c7d087b5-3b8b-482b-b0ae-1fa230ae778b",
        "url": "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/07a6cda9-9b11-5155-8de6-571841c41235",
        "createTime": "2015-10-29T09:50:35.310Z",
        "serial": "FTT1617001T",
        "mac": "00:50:60:07:13:1B",
        "product": "Cisco TelePresence SX20",
        "state": "CLAIMED",
        "status": {
          "cisUuid": "c7d087b5-3b8b-482b-b0ae-1fa230ae778b",
          "url": "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/07a6cda9-9b11-5155-8de6-571841c41235",
          "wdmUrl": "https://locus-a.wbx2.com/locus/api/v1/devices/c68b9b40-bd3e-4487-8969-066a7d0eeec5",
          "webSocketUrl": "wss://mercury-connection-a.wbx2.com/v1/apps/wx2/registrations/d7a0f348-8f44-4ec7-8c8a-19bb7b103b1d/messages",
          "product": "Cisco TelePresence SX20",
          "connectionStatus": "CONNECTED",
          "lastConnectionTime": "2015-11-17T15:14:44.252Z",
          "events": [{
            "type": "ip",
            "level": "INFO",
            "description": "10.47.117.191",
            "createTime": "2015-11-17T12:56:09"
          }, {
            "type": "software",
            "level": "INFO",
            "description": "ce 8.1.0 PreAlpha0 362bb7e 2015-11-16",
            "createTime": "2015-11-17T12:56:09"
          }, {
            "type": "upgradeChannel",
            "level": "INFO",
            "description": "Stable",
            "createTime": "2015-11-17T12:56:09"
          }, {
            "type": "noupgrade",
            "level": "WARNING",
            "description": "Device is set up to not receive automatic updates",
            "createTime": "2015-11-17T12:56:09"
          }],
          "level": "WARNING",
          "duration": 14400
        }
      },
      "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/7cdf6cbe-6f84-5338-9064-87a20ec6f9c8": {
        "displayName": "schnappi test",
        "cisUuid": "824d3dfe-7143-4f04-af15-2f5e5659d596",
        "url": "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/7cdf6cbe-6f84-5338-9064-87a20ec6f9c8",
        "createTime": "2015-11-02T17:08:13.783Z",
        "serial": "FTT192203AZ",
        "mac": "DC:EB:94:B5:0F:44",
        "product": "Cisco TelePresence SX10",
        "state": "CLAIMED",
        "remoteSupportUser": {
          "username": "",
          "token": "",
          "expiryTime": "1970-01-01T00:00:00.000Z"
        },
        "status": {
          "cisUuid": "824d3dfe-7143-4f04-af15-2f5e5659d596",
          "url": "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/7cdf6cbe-6f84-5338-9064-87a20ec6f9c8",
          "wdmUrl": "https://locus-a.wbx2.com/locus/api/v1/devices/c0e8d2bc-8cf0-4e47-ba5a-fbf4b3933861",
          "webSocketUrl": "wss://mercury-connection-a.wbx2.com/v1/apps/wx2/registrations/723c07c4-b93d-44f4-a46d-7f2fbed9ba60/messages",
          "product": "Cisco TelePresence SX10",
          "connectionStatus": "CONNECTED",
          "lastConnectionTime": "2015-11-17T15:14:44.252Z",
          "events": [{
            "type": "ip",
            "level": "INFO",
            "description": "10.47.117.205",
            "createTime": "2015-11-17T12:01:15"
          }, {
            "type": "software",
            "level": "INFO",
            "description": "ce 8.1.0 PreAlpha0 f54673d 2015-11-09",
            "createTime": "2015-11-17T12:01:15"
          }, {
            "type": "upgradeChannel",
            "level": "INFO",
            "description": "Beta",
            "createTime": "2015-11-17T12:01:15"
          }, {
            "type": "noupgrade",
            "level": "WARNING",
            "description": "Device is set up to not receive automatic updates",
            "createTime": "2015-11-17T12:01:15"
          }],
          "level": "WARNING",
          "duration": 14400
        }
      },
      "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/c1641e38-4782-52ad-8953-e3e3f3aee5c0": {
        "displayName": "Ellie",
        "cisUuid": "28236784-0f09-4daa-89d6-750f315a921d",
        "url": "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/c1641e38-4782-52ad-8953-e3e3f3aee5c0",
        "createTime": "2015-11-11T10:48:52.075Z",
        "serial": "FTT1927036B",
        "mac": "18:8B:9D:D4:51:DE",
        "product": "Cisco TelePresence SX10",
        "state": "CLAIMED",
        "remoteSupportUser": {
          "username": "remotesupport",
          "token": "WhdUeq679Axmgl46Y/RMjpBGi2fLdF+g6oxXlN5/Fdm3Lb+5i6vHtRam66AifofWguZBOLO/3421JcyzM49J0/5OTMmxBsslJWh791deibafk+zPEBfIwrz80op2j9OVNIdNk1Qcq6Yo3+dYAqU9iCJxq1qtQ4Rd7gw8e9jX6WHwONav2RN10XFZkjtwSpwqcKu0+9OhZvxu5+MXdxsb1c8F+x163UGquDnM0KEGd+WsougEXSH6nJo7Nfnas1pFN7bk3Q71HE9mtNv1QXn9S3ZSikmSLR8xJtgjUxmFkPEm2CAQ7Wq/brv2xYO0S6O0Oec/iikqGhFjBxRLJuBLRQ==",
          "expiryTime": "2038-01-19T03:14:07.000Z"
        }
      },
      "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/93f1001c-b4c1-5f4f-a831-c93d3ecd5a6b": {
        "displayName": "tcp-error2",
        "cisUuid": "017624b2-6451-4e70-9404-3f6a53b58efa",
        "url": "https://csdm-a.wbx2.com/csdm/api/v1/organization/4214d345-7caf-4e32-b015-34de878d1158/devices/93f1001c-b4c1-5f4f-a831-c93d3ecd5a6b",
        "createTime": "2015-10-07T07:52:11.352Z",
        "serial": "FTT1847028B",
        "mac": "E4:C7:22:6C:08:7B",
        "product": "Cisco TelePresence SX10",
        "state": "CLAIMED"
      }
    }
  };
  angular.module('Squared').constant('HelpdeskMockData', mockData);
}());
