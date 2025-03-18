/* eslint-disable no-console */
export default {
    set: (key: string, payload) => {
        try {
            return localStorage.setItem(key, JSON.stringify(payload));
        } catch (error) {
            console.error('Error setting localstorage item', error);
        }
    },

    get: (key: string) => {
        try {
            const value = localStorage.getItem(key);

            if (value) {
                return JSON.parse(value);
            }

            console.warn(`Item with key "${key}" not found in localStorage.`);
            return null;
        } catch (error) {
            console.error(`Error retrieving item from localstorage`, error);
        }
    },

    remove: (key: string) => {
        try {
            return localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing localstorage item', error);
        }
    },

    clear: () => {
        try {
            return localStorage.clear();
        } catch (error) {
            console.error('Error clearing localstorage', error);
        }
    },
};
