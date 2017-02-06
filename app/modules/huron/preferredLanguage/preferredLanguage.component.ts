import { PreferredLanguageService } from './preferredLanguage.service';
import { Notification } from 'modules/core/notifications';

class PreferredLanguage implements ng.IComponentController {
    private placesId: string;
    private hasSparkCall: boolean;
    public preferredLanguageOptions: any[];
    public preferredLanguage: any;
    public placesPreferredLanguage: string;
    public defaultPreferredLanugage: string;
    public plIsLoaded: boolean = false;
    public prefLanguageSaveInProcess: boolean = false;
    public onPrefLanguageChange: boolean = false;

    /* @ngInject */
    constructor(
        private $translate: ng.translate.ITranslateService,
        private Notification: Notification,
        private PreferredLanguageService: PreferredLanguageService,
    ) { }

    public $onInit(): void {
        if (this.hasSparkCall) {
            this.initPreferredLanguageData();
        }
    }

    private initPreferredLanguageData(): void {
        this.PreferredLanguageService.getSiteLevelLanguage().then(result => {
            this.initPlacesPreferredLanguage(result);
        })
        .catch((error) => {
            this.Notification.errorResponse(error, 'preferredLanguage.failedToFetchSiteLevelLanguage');
        });
    }

    private initPlacesPreferredLanguage(sitePreferredLanguage): void {
        this.preferredLanguageOptions = [];
        this.PreferredLanguageService.getSiteLanguages().then(languages => {
        this.PreferredLanguageService.getCmiPlaceInfo(this.placesId).then(result => {
            let organizationLanguage = this.PreferredLanguageService.getPreferredLanguage(languages, sitePreferredLanguage);
            this.defaultPreferredLanugage = this.defaultPreferredLanguage(organizationLanguage['label']);
            this.preferredLanguageOptions.push(this.defaultPreferredLanugage);
            this.preferredLanguageOptions = this.preferredLanguageOptions.concat(languages);
            this.placesPreferredLanguage = result['preferredLanguage'];
            this.preferredLanguage = this.placesPreferredLanguage ? this.PreferredLanguageService.getPreferredLanguage(languages, this.placesPreferredLanguage) : this.defaultPreferredLanugage;
            this.plIsLoaded = true;
        })
        .catch((error) => {
            this.Notification.errorResponse(error, 'preferredLanguage.failedToFetchCmiPlacesInfo');
        });
        })
        .catch((error) => {
        this.Notification.errorResponse(error, 'preferredLanguage.failedToFetchSiteLanguages');
        });
    }

    private defaultPreferredLanguage(organizationLevelLanguage): any {
        let defaultPrefix: string = this.$translate.instant('preferredLanguage.organizationSettingLabel');
        let translatedLanguageLabel: string = organizationLevelLanguage ?
                                            this.$translate.instant(organizationLevelLanguage) :
                                            'languages.englishAmerican';
        let defaultLanguage = {
        label: defaultPrefix + translatedLanguageLabel,
        value: '',
        };
        return defaultLanguage;
    }
}

export class PreferredLanguageComponent implements ng.IComponentOptions {
    public controller = PreferredLanguage;
    public templateUrl = 'modules/huron/preferredLanguage/preferredLanguage.html';
    public bindings = {
        placesId: '<',
        hasSparkCall: '<',
        onPrefLanguageChange: '=',
        prefLanguageSaveInProcess: '=',
        placesPreferredLanguage: '=',
        defaultPreferredLanugage: '=',
        preferredLanguage: '=',
        preferredLanguageOptions: '=',
    };
}
