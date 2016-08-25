(function () {
  'use strict';

  var mockData = {
    users: [{
      "active": true,
      "id": "ddb4dd78-26a2-45a2-8ad8-4c181c5b3f0a",
      "organization": {
        id: "ce8d17f8-1734-4a54-8510-fae65acc505e"
      },
      "userName": "tom.vasset@cisco.com",
      "displayName": "Tom Vasset (tvasset)",
      "phoneNumbers": [{
        "type": "work",
        "value": "+47 67 51 14 67"
      }, {
        "type": "mobile",
        "value": "+47 92 01 30 30"
      }],
      "url": "whatever.com"
    }, {
      "active": false,
      "id": "335bf4a2-a09c-45ba-a72a-e3f1de613295",
      "organization": {
        "id": "ce8d17f8-1734-4a54-8510-fae65acc505e"
      },
      "userName": "jayScott@marvel.com",
      "displayName": "Jay Scott (mock)",
      "phoneNumbers": [],
      "url": "whatever.com"
    }, {
      "active": true,
      "id": "2f4c85f7-e827-4b28-b567-0e49693b3f75",
      "organization": {
        "id": "ce8d17f8-1734-4a54-8510-fae65acc505e"
      },
      "userName": "shamim.pirzada+marvelenduser@gmail.com",
      "displayName": "Shamim (mock)",
      "phoneNumbers": [],
      "url": "whatever.com"
    }],
    user: {
      "id": "b78903e2-39e6-45fa-af0f-5d31de45934f",
      "userName": "tvasset@cisco.com",
      "name": {
        "givenName": "Tom",
        "familyName": "Vasset"
      },
      "emails": [{
        "value": "tvasset@cisco.com",
        "type": "work",
        "primary": true
      }],
      "displayName": "Tom Vasset (tvasset)",
      "meta": {
        "created": "2012-06-15T20:49:58.903Z",
        "uri": "https://identity.webex.com/identity/scim/1eb65fdf-9643-417f-9974-ad72cae0e10f/v1/Users/b78903e2-39e6-45fa-af0f-5d31de45934f"
      },
      "schemas": ["urn:scim:schemas:core:1.0", "urn:scim:schemas:extension:cisco:commonidentity:1.0"],
      "entitlements": ["squared-fusion-cal", "atlas-portal", "squared-fusion-ec", "webex-messenger", "webex-squared", "squared-call-initiation",
        "spark", "squared-fusion-uc", "squared-fusion-mgmt", "squared-syncup", "files", "squared-room-moderation", "cisco-knowledge",
        "meetings", "ciscouc", "cloudmeetings"
      ],
      "licenseID": ['EC_cc6c1a2c-20d6-460d-9f55-01fc85d52e04_25_go.webex.com', 'EE_fa6c1a2c-20d6-460d-9f55-01fc85d52e04_25_ciscosales.webex.com',
        'MC_f36c1a2c-20d6-460d-9f55-01fc85d52e04_100_go.webex.com', 'SC_b36c1a2c-20d6-460d-9f55-01fc85d52e04_100_go.webex.com',
        'MC_f36c1a2c-20d6-460d-9f55-01fc85d52e04_100_ciscosales.webex.com', 'TC_a36c1a2c-20d6-460d-9f55-01fc85d52e04_100_ciscosales.webex.com',
        'MS_62b343df-bdd5-463b-8895-d07fc3a94832', 'CO_f36c1a2c-20d6-460d-9f55-01fc85d52e04', 'CF_a36c1a2c-20d6-460d-9f55-01fc85d52e04'
      ],
      "photos": [{
        "type": "thumbnail",
        "value": "https://1efa7a94ed216783e352-c62266528714497a17239ececf39e9e2.ssl.cf1.rackcdn.com/V1~b1403a2d9a639ca7700dae70fd5a18f8~NxFT-HKtSbK02T8H-kQZGg==~80"
      }, {
        "type": "photo",
        "value": "https://1efa7a94ed216783e352-c62266528714497a17239ececf39e9e2.ssl.cf1.rackcdn.com/V1~b1403a2d9a639ca7700dae70fd5a18f8~NxFT-HKtSbK02T8H-kQZGg==~1600"
      }],
      "ims": [{
        "type": "xmpp",
        "value": "tvasset@cisco.com",
        "primary": false
      }, {
        "type": "webex-squared-jid",
        "value": "tvasset@cisco.com",
        "primary": false
      }, {
        "type": "webex-messenger-jid",
        "value": "tvasset@cisco.com",
        "primary": false
      }],
      "phoneNumbers": [{
        "type": "work",
        "value": "+47 67 51 1463"
      }],
      "department": "554023321",
      "roles": ["atlas-portal.partner.helpdesk", "id_full_admin"],
      "trainSiteNames": ["ciscosales.webex.com", "go.webex.com"],
      "sipAddresses": [{
        "type": "enterprise",
        "value": "tvasset@cisco.com",
        "primary": false
      }, {
        "type": "cloud-calling",
        "value": "tvasset@cisco.ciscospark.com",
        "primary": false
      }],
      "active": true,
      "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f"
    },
    userStatuses: [{
      "userId": "b78903e2-39e6-45fa-af0f-5d31de45934f",
      "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
      "serviceId": "squared-fusion-cal",
      "entitled": true,
      "state": "notActivated"
    }, {
      "userId": "b78903e2-39e6-45fa-af0f-5d31de45934f",
      "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
      "serviceId": "squared-fusion-ec",
      "entitled": true,
      "state": "activated"
    }, {
      "userId": "b78903e2-39e6-45fa-af0f-5d31de45934f",
      "orgId": "1eb65fdf-9643-417f-9974-ad72cae0e10f",
      "serviceId": "squared-fusion-uc",
      "entitled": true,
      "state": "error",
      "description": {
        "key": "c_cal.0",
        "defaultMessage": "Woops, this aint workin. Ya need ta help me out here man!"
      }
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
      "services": [
        "squared-fusion-cal",
        "webex-squared",
        "squared-fusion-mgmt",
        "squared-fusion-cal",
        "squared-fusion-uc",
        "squared-fusion-ec",
        "ciscouc",
        "cloudMeetings",
        "spark-room-system"
      ],
      "contact": "tywin.lannister@kingslanding.com",
      "domains": ["kingslanding.com", "kingslanding2.com"],
      "manages": ["bc1d8493-69a7-4ba7-a0c0-62abf1b57ac6"],
      "dirsyncEnabled": true,
      "ssoEnabled": true
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
    },
    webExSites: [{
      "siteUrl": "mock1.webex.com"
    }, {
      "siteUrl": "mock2.webex.com"
    }],
    serviceOrder: {
      "orderingTool": "Fancy Ordering Tool"
    },
    licenses: [{
      "offerCode": "MS",
      "type": "MESSAGING",
      "name": "Messaging",
      "status": "ACTIVE",
      "volume": 100,
      "isTrial": true,
      "usage": 10,
      "trialExpiresInDays": 200
    }, {
      "offerCode": "MS",
      "type": "MESSAGING",
      "name": "Messaging",
      "status": "SUSPENDED",
      "volume": 1000,
      "isTrial": true,
      "usage": 300,
      "trialExpiresInDays": 0
    }, {
      "offerCode": "MS",
      "type": "MESSAGING",
      "name": "Messaging",
      "status": "ACTIVE",
      "volume": 50,
      "isTrial": true,
      "usage": 10,
      "trialExpiresInDays": 100
    }, {
      "offerCode": "MC",
      "type": "CONFERENCING",
      "name": "Meeting Center",
      "status": "ACTIVE",
      "volume": 150,
      "isTrial": false,
      "usage": 10,
      "capacity": 25,
      "siteUrl": "mock.webex.com"
    }, {
      "offerCode": "TC",
      "type": "CONFERENCING",
      "name": "Training Center",
      "status": "ACTIVE",
      "volume": 250,
      "isTrial": false,
      "usage": 250,
      "capacity": 25,
      "siteUrl": "mock.webex.com"
    }, {
      "offerCode": "TC",
      "type": "CONFERENCING",
      "name": "Training Center",
      "status": "PENDING",
      "volume": 1000,
      "isTrial": false,
      "usage": 250,
      "capacity": 25,
      "siteUrl": "mock.webex.com"
    }, {
      "offerCode": "CMR",
      "type": "CONFERENCING",
      "name": "Training Center",
      "status": "ACTIVE",
      "volume": 250,
      "isTrial": false,
      "usage": 250,
      "siteUrl": "mock.webex.com"
    }, {
      "offerCode": "CF",
      "type": "CONFERENCING",
      "name": "Conferencing",
      "status": "ACTIVE",
      "volume": 100,
      "isTrial": true,
      "trialExpiresInDays": 49
    }, {
      "offerCode": "CO",
      "type": "COMMUNICATION",
      "name": "Communication",
      "status": "SUSPENDED",
      "volume": 1000,
      "trialExpiresInDays": 100,
      "isTrial": true,
      "usage": "950"
    }, {
      "offerCode": "SD",
      "type": "SHARED_DEVICES",
      "name": "Shared Devices",
      "status": "ACTIVE",
      "volume": 50,
      "isTrial": false,
      "usage": 40
    }, {
      "offerCode": "SD",
      "type": "SHARED_DEVICES",
      "name": "Shared Devices",
      "status": "SUSPENDED",
      "volume": 100,
      "isTrial": false,
      "usage": 0
    }],
    hybridServices: [{
      "id": "squared-fusion-mgmt",
      "enabled": true,
      "status": "error"
    }, {
      "id": "squared-fusion-cal",
      "enabled": true,
      "status": "ok"
    }, {
      "id": "squared-fusion-uc",
      "enabled": true,
      "status": "warning"
    }, {
      "id": "squared-fusion-ec",
      "enabled": false
    }],
    unlicenseduserscount: 50,
    huronDevicesForUser: [{
      uuid: "28236784-0f09-4daa-89d6-750f315a921d",
      name: "SEP1122334455",
      model: 'Cisco 7841',
      description: 'This is a mock description',
      deviceStatus: {
        status: 'Online',
      }
    }, {
      uuid: "66236784-0f09-4daa-89d6-750f315a921d",
      name: "SEP5566778899",
      model: 'Cisco 8861',
      description: '',
      deviceStatus: {
        status: 'Offline',
      }
    }],
    huronUserNumbers: {
      "uuid": "d2839ea3-6ad8-4d43-bfe7-cccaec09ef6f",
      "url": "https://cmi.huron-int.com/api/v1/voice/customers/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/users/d2839ea3-6ad8-4d43-bfe7-cccaec09ef6f",
      "firstName": "Tom",
      "lastName": "Vasset",
      "userName": "tvasset@cisco.com",
      "numbers": [{
        "url": "https://cmi.huron-int.com/api/v1/voice/customers/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/users/d2839ea3-6ad8-4d43-bfe7-cccaec09ef6f/directorynumbers/faa07921-6ed8-4e2b-99f9-08c457fe4c18",
        "internal": "1234",
        "external": "+14084744520",
        "uuid": "faa07921-6ed8-4e2b-99f9-08c457fe4c18",
        "dnUsage": "primary"
      }, {
        "url": "https://cmi.huron-int.com/api/v1/voice/customers/7e88d491-d6ca-4786-82ed-cbe9efb02ad2/users/d2839ea3-6ad8-4d43-bfe7-cccaec09ef6f/directorynumbers/baa07921-6ed8-4e2b-99f9-08c457fe4c18",
        "internal": "2345",
        "external": null,
        "uuid": "baa07921-6ed8-4e2b-99f9-08c457fe4c18",
        "dnUsage": "shared",
        "users": ['d2839ea3-6ad8-4d43-bfe7-cccaec09ef6f', '74c2ca8d-99ca-4bdf-b6b9-a142d503f024']
      }]
    },
    huronDeviceSearchResult: [{
      "uuid": "17a6e2be-0e22-4ae9-8a29-f9ab05b5da09",
      "url": null,
      "name": "SEP1CDEA7DBF740",
      "description": "373323613@qq.com (Cisco 8861 SIP)",
      "product": "Cisco 8861",
      "model": "Cisco 8861",
      "ownerUser": {
        "uuid": "74c2ca8d-99ca-4bdf-b6b9-a142d503f024",
        "userId": "58852083@qq.com"
      }
    }, {
      "uuid": "18a6e2be-0e22-4ae9-8a29-f9ab05b5da09",
      "url": null,
      "name": "SEP74A02FC0A15F",
      "description": "58852083 (Cisco 8865 SIP)",
      "product": "Cisco 8865",
      "model": "Cisco 8865",
      "ownerUser": {
        "uuid": "74c2ca8d-99ca-4bdf-b6b9-a142d503f024",
        "userId": "58852083@qq.com"
      }
    }],
    huronDevice: {
      "uuid": "17a6e2be-0e22-4ae9-8a29-f9ab05b5da09",
      "url": null,
      "name": "SEP1CDEA7DBF740",
      "description": "373323613@qq.com (Cisco 8861 SIP)",
      "product": "Cisco 8861",
      "model": "Cisco 8861",
      "ownerUser": {
        "uuid": "74c2ca8d-99ca-4bdf-b6b9-a142d503f024",
        "userId": "58852083@qq.com"
      },
      "registrationStatus": "registered"
    },
    huronDeviceNumbers: [{
      "directoryNumber": {
        "uuid": "0472df70-779b-4819-8c35-a2f7abc69fe8",
        "pattern": "2900"
      },
      "e164Mask": "+14084744520",
      "dnUsage": 'primary'
    }, {
      "directoryNumber": {
        "uuid": "3472df70-779b-4819-8c35-a2f7abc69fe8",
        "pattern": "3300"
      },
      "e164Mask": null,
      "dnUsage": 'shared',
      "users": ['d2839ea3-6ad8-4d43-bfe7-cccaec09ef6f', '74c2ca8d-99ca-4bdf-b6b9-a142d503f024']
    }],
    huronDevicesForNumber: [{
      "endpoint": {
        "uuid": "c498a32e-8b95-4e38-aa70-2a8c90b1f0f4",
        "name": "SEP5ABCD7DB89F6"
      },
      "e164Mask": null,
      "uuid": "4f7f009b-ef6a-4115-bbc0-00852cafcd2f"
    }, {
      "endpoint": {
        "uuid": "69f85c9c-4581-4fb0-80ee-b4af193701f0",
        "name": "SEP1CDEA7DA89D3"
      },
      "e164Mask": "+4797100288",
      "uuid": "1df077dc-8983-42a1-9e47-5d58ee711aae"
    }],
    huronNumberSearch: {
      "numbers": [{
        "uuid": "4edbff96-da50-40f1-bca8-5b15486a6be9",
        "number": "+14084744527",
        "type": "external",
        "directoryNumber": {
          "uuid": "26cd541b-0978-4677-a237-7b3f2a514a1a"
        }
      }, {
        "uuid": "f5897251-4c58-43d5-8527-16d36543504a",
        "number": "2027",
        "type": "internal",
        "directoryNumber": {
          "uuid": "a85a7321-cdf6-4cd0-be3c-611da264c8ef"
        }
      }]
    },
    huronUsersUsingNumber: [{
      "user": {
        "uuid": "46f5c4bf-8756-4220-b124-6852d8b4c7a9",
        "userId": "karcisco+tsic-cust1user2@gmail.com"
      },
      "dnUsage": "Undefined",
      "uuid": "f5897251-4c58-43d5-8527-16d36543504a"
    }, {
      "user": {
        "uuid": "943e7651-8646-4c3b-9770-7143c116cce0",
        "userId": "karcisco+tsic-cust1user1@gmail.com"
      },
      "dnUsage": "Undefined",
      "uuid": "3bc624c5-a47e-460d-b8cc-12ee3642cea5"
    }],
    logs: {
      search: [{
        filename: "logFile1",
        timestamp: "2016-01-25T11:46:24.757Z",
        platform: "wx2-osx"
      }, {
        filename: "logFile2",
        timestamp: "2016-02-04T11:02:48.354Z"
      }, {
        filename: "logFile3",
        timestamp: "2016-02-08T09:18:54.238Z",
        platform: "wx2-osx"
      }, {
        filename: "logFile4",
        timestamp: "2016-01-25T11:19:19.443Z",
        platform: "wx2-osx"
      }],
      download: "http://someverylongurl.txt"
    }
  };
  angular.module('Squared').constant('HelpdeskMockData', mockData);
}());
