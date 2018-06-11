export enum OfferName {
  MS = 'MS',           // Webex Teams
  CF = 'CF',           // Webex Meetings
  EE = 'EE',           // Enterprise Edition (WebEx)
  MC = 'MC',           // Webex Meetings
  SC = 'SC',           // Webex Support
  TC = 'TC',           // Webex Training
  EC = 'EC',           // Webex Events
  CO = 'CO',           // Communication
  SD = 'SD',           // Spark Room System
  SB = 'SB',           // Spark Board
  CMR = 'CMR',         // Collaboration Meeting Room (WebEx)
  CDC = 'CDC',         // Care Digital Channel
  CVC = 'CVC',         // Care Voice Channel
  MSGR = 'MSGR',       // WebEx Messenger (as of 2017-05-17, managed externally and not managed by Atlas)
  MGMTPRO = 'MGMTPRO', // IT Pro Pack
  TSP = 'TSP',         // Telephony Service Provider
  CCASP = 'CCASP',     // Cloud Connected Audio - Service Partners
  CCAUser = 'CCAUser', // Cloud Connected Audio - User
}

export enum AdvancedMeetingOfferName {
  CMR = OfferName.CMR, // Collaboration Meeting Room (WebEx)
  EC = OfferName.EC,   // Webex Events
  EE = OfferName.EE,   // Enterprise Edition (WebEx)
  MC = OfferName.MC,   // Webex Meetings
  SC = OfferName.SC,   // Webex Support
  TC = OfferName.TC,   // Webex Training
}

export enum OfferType {
  COMMUNICATION = 'COMMUNICATION',
  CONFERENCING = 'CONFERENCING',
  MESSAGING = 'MESSAGING',
}

export enum WebexMeetingOfferName {
  EC = OfferName.EC,   // Webex Events
  EE = OfferName.EE,   // Enterprise Edition (WebEx)
  MC = OfferName.MC,   // Webex Meetings
  SC = OfferName.SC,   // Webex Support
  TC = OfferName.TC,   // Webex Training
}
