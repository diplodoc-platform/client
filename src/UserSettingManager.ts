import storage from './storage';

export default class UserSettingManager {
    private defaultSettings: object;
    private settingsNames: string[];
    private settings: object | null;

    constructor(defaultSettings: object, settings: object | null = null) {
        this.defaultSettings = defaultSettings;
        this.settingsNames = Object.keys(defaultSettings) || [];
        this.settings = settings;
    }

    async updateSetting(settingName: string, value: unknown) {
        if (this.settings) {
            const isValidProperty =
                this.isKeyOfObject(settingName, this.settings) &&
                this.isValidValueForKey(this.settings, settingName, value);

            if (isValidProperty) {
                this.settings[settingName] = value;
            }
        }

        return storage.set(settingName, value);
    }

    getSetting(settingName: string) {
        return storage.get(settingName);
    }

    removeSetting(settingName: string) {
        return storage.remove(settingName);
    }

    getSettings() {
        if (this.settings) {
            return this.settings;
        }

        const newSettings = this.settingsNames.reduce((res: object, settingName: string) => {
            const storageValue = storage.get(settingName);

            if (storageValue !== null) {
                const isValidProperty =
                    this.isKeyOfObject(settingName, res) &&
                    this.isValidValueForKey(res, settingName, storageValue);

                if (isValidProperty) {
                    res[settingName] = storageValue;
                }
            }

            return res;
        }, this.settings || this.defaultSettings);

        this.settings = newSettings;

        return newSettings;
    }

    private isKeyOfObject(key: string, obj: object): key is keyof typeof obj {
        return key in obj;
    }

    private isValidValueForKey<T extends Object, K extends keyof T>(
        obj: T,
        key: K,
        value: unknown,
    ): value is T[K] {
        return typeof value === typeof obj[key];
    }
}
