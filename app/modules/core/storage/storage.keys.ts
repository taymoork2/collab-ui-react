export class StorageKeys {
  // Login Requested State
  public static readonly REQUESTED_STATE_NAME = 'storedState';
  public static readonly REQUESTED_STATE_PARAMS = 'storedParams';
  public static readonly REQUESTED_QUERY_PARAMS = 'queryParams';

  // Account specific query Parameters
  public static readonly SUBSCRIPTION_ID = 'subscriptionId';

  // Cross-launch specific parameters
  public static readonly CUSTOMER_ORG_ID = 'customerOrgId';
  public static readonly PARTNER_ORG_ID = 'partnerOrgId';

  // Login Query String Parameters
  public static readonly BMMP_ENV = 'bmmpEnv';

  // Idle Timeout
  public static readonly ACTIVE_TABS = 'ACTIVE_TABS';
  public static readonly LOGIN_MESSAGE = 'loginMessage';

  // Language settings
  public static readonly LANGUAGE = 'language';

  // Login strings
  public static readonly LOGOUT = 'logout';

  //care setup
  public static readonly CARE = {
    setUpStatus: 'setupCare',
  };
}
