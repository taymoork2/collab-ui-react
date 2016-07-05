(function () {
  'use strict';

  var tabs = [{
    tab: 'overviewTab',
    icon: 'icon-home',
    title: 'tabs.overviewTab',
    state: 'overview',
    link: '/overview'
  }, {
    tab: 'overviewTab',
    icon: 'icon-home',
    title: 'tabs.overviewTab',
    state: 'partneroverview',
    link: '/partner/overview'
  }, {
    tab: 'customerTab',
    icon: 'icon-user',
    title: 'tabs.customerTab',
    state: 'partnercustomers',
    link: '/partner/customers'
  }, {
    tab: 'userTab',
    icon: 'icon-user',
    title: 'tabs.userTab',
    state: 'users',
    link: '/users'
  }, {
    tab: 'servicesTab',
    icon: 'icon-cloud',
    title: 'tabs.servicesTab',
    feature: 'atlas-services-overview',
    state: 'services-overview',
    link: 'services/overview'
  }, {
    tab: 'servicesTab',
    icon: 'icon-cloud',
    title: 'tabs.servicesTab',
    feature: "!atlas-services-overview",
    subPages: [{
      title: 'tabs.conferencing',
      desc: 'tabs.conferencingDesc',
      state: 'site-list',
      link: '#site-list'
    }, {
      title: 'tabs.huronLineDetailsTab',
      desc: 'tabs.huronLineDetailsTabDesc',
      state: 'huronsettings',
      link: '#hurondetails/settings'
    }, {
      title: 'tabs.careTab',
      desc: 'tabs.careTabDesc',
      state: 'care.Features',
      link: '#careDetails/features'
    }, {
      title: 'tabs.fusionDetailsTab',
      desc: 'tabs.fusionDetailsTabDesc',
      state: 'fusion',
      link: '#fusion'
    }, {
      title: 'tabs.expresswayManagementServiceTab',
      desc: 'tabs.expresswayManagementServiceTabDesc',
      state: 'management-service',
      link: '#services/expressway-management'
    }, {
      title: 'tabs.calendarServiceTab',
      desc: 'tabs.calendarServiceTabDesc',
      state: 'calendar-service',
      link: '#services/calendar'
    }, {
      title: 'tabs.callServiceTab',
      desc: 'tabs.callServiceTabDesc',
      state: 'call-service',
      link: '#services/call'
    }, {
      title: 'tabs.MediafusionDetailsTab',
      desc: 'tabs.MediafusionDetailsTabDesc',
      //state: 'mediafusionconnector',
      //link: '#mediafusionconnector'
      state: 'media-service',
      link: '#mediaservice'
    }, {
      title: 'tabs.messengerTab',
      desc: 'tabs.messengerTabDesc',
      state: 'messenger',
      link: '#messenger'
    }]
  }, {
    tab: 'deviceTab',
    icon: 'icon-devices',
    title: 'tabs.deviceTab',
    state: 'devices',
    link: '/devices'
  }, {
    tab: 'reportTab',
    icon: 'icon-bars',
    title: 'tabs.reportTab',
    state: 'reports',
    link: '/reports'
  }, {
    tab: 'reportTab',
    icon: 'icon-bars',
    title: 'tabs.reportTab',
    state: 'partnerreports',
    link: '/partner/reports'
  }, {
    tab: 'supportTab',
    icon: 'icon-support',
    title: 'tabs.supportTab',
    link: '/support/status',
    state: 'support.status'
  }, {
    tab: 'accountTab',
    icon: 'icon-sliders',
    title: 'tabs.accountTab',
    state: 'profile',
    link: '/profile'
  }, {
    tab: 'settingsTab',
    icon: 'icon-sliders',
    title: 'tabs.settingsTab',
    state: 'settings',
    feature: "atlas-settings-page",
    link: '/settings'
  }, {
    tab: 'organizationTab',
    icon: 'icon-admin',
    title: 'tabs.organizationTab',
    state: 'organizations',
    link: '/organizations'
  }, {
    // DEPRECATED - REPLACE WITH FEATURE TOGGLES - DO NOT ADD MORE PAGES UNDER developmentTab
    tab: 'developmentTab',
    icon: 'icon-tools',
    title: 'tabs.developmentTab',
    hideProd: true,
    subPages: [{
      title: 'tabs.callRoutingTab',
      desc: 'tabs.callRoutingTabDesc',
      state: 'callrouting',
      link: '#callrouting'
    }, {
      title: 'tabs.mediaOnHoldTab',
      desc: 'tabs.mediaOnHoldTabDesc',
      state: 'mediaonhold',
      link: '#mediaonhold'
    }, {
      title: 'tabs.metricsDetailsTab',
      //desc: 'tabs.metricsDetailsTabDesc',
      state: 'media-service-v2',
      link: '#mediaserviceV2'
    }]
  }];

  angular
    .module('Core')
    .value('tabConfig', tabs);

}());
