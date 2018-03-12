export enum OfferName {
  MS = 'MS',           // Messaging
  CF = 'CF',           // Conferencing
  EE = 'EE',           // Enterprise Edition (WebEx)
  MC = 'MC',           // Meeting Center (WebEx)
  SC = 'SC',           // Support Center (WebEx)
  TC = 'TC',           // Training Center (WebEx)
  EC = 'EC',           // Event Center (WebEx)
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
}

export enum AdvancedMeetingOfferName {
  CMR = OfferName.CMR, // Collaboration Meeting Room (WebEx)
  EC = OfferName.EC,   // Event Center (WebEx)
  EE = OfferName.EE,   // Enterprise Edition (WebEx)
  MC = OfferName.MC,   // Meeting Center (WebEx)
  SC = OfferName.SC,   // Support Center (WebEx)
  TC = OfferName.TC,   // Training Center (WebEx)
}
