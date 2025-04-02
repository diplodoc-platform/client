import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    Cancel,
    CancelStatic,
    CancelTokenStatic,
} from 'axios';
import get from 'lodash/get';
import set from 'lodash/set';

const getMethods = ['delete', 'get', 'head', 'options'] as const;
const postMethods = ['post', 'put', 'patch'] as const;

function getCsrfMetaTag(): HTMLMetaElement | null {
    return document.querySelector('meta[name=csrf-token]');
}

function setCsrfHeader(config: AxiosRequestConfig) {
    const csrfMetaTag = getCsrfMetaTag();
    if (csrfMetaTag) {
        set(config, "headers['x-csrf-token']", csrfMetaTag?.content);
    }
}

function updateCsrfToken(response: AxiosResponse) {
    const token = get(response, "headers['x-csrf-token']");
    if (!token) {
        return;
    }

    const csrfMetaTag = getCsrfMetaTag();
    if (csrfMetaTag) {
        csrfMetaTag.content = token;
    }
}

type GetMethod = (
    url: AxiosRequestConfig['url'],
    config?: AxiosRequestConfig,
) => Promise<AxiosResponse>;

type GetMethodsList = {
    [K in (typeof getMethods)[number]]: GetMethod;
};

type PostMethod = (
    url: AxiosRequestConfig['url'],
    data: AxiosRequestConfig['data'],
    config?: AxiosRequestConfig,
) => Promise<AxiosResponse>;

type PostMethodsList = {
    [K in (typeof postMethods)[number]]: PostMethod;
};

type ApiMethods = GetMethodsList & PostMethodsList;

class AxiosWrapper implements ApiMethods {
    Cancel: CancelStatic = axios.Cancel;
    CancelToken: CancelTokenStatic = axios.CancelToken;
    isCancel: (value: unknown) => value is Cancel = axios.isCancel;
    innerAxios: AxiosInstance;

    delete!: GetMethod;
    get!: GetMethod;
    head!: GetMethod;
    options!: GetMethod;

    post!: PostMethod;
    put!: PostMethod;
    patch!: PostMethod;

    constructor(options = {}) {
        const defaultOptions = {
            withCredentials: true,
            headers: {},
            xsrfCookieName: '',
        };

        const axiosOption = {...defaultOptions, ...options};
        this.innerAxios = axios.create(axiosOption);

        getMethods.forEach((method) => {
            this[method] = (url, config) =>
                this.request({
                    ...config,
                    method,
                    url,
                });
        });

        postMethods.forEach((method) => {
            this[method] = (url, data, config) =>
                this.request({
                    ...config,
                    method,
                    url,
                    data,
                });
        });
    }

    getUri(config: AxiosRequestConfig) {
        return this.innerAxios.getUri(config);
    }

    async request<TData>(config: AxiosRequestConfig = {}) {
        let response;
        try {
            if (
                config.method &&
                (postMethods as readonly string[]).includes(config.method.toLowerCase())
            ) {
                setCsrfHeader(config);
            }
            response = await this.innerAxios.request<TData>(config);
        } catch (err) {
            if (err instanceof AxiosError && err.response && err.response.status === 419) {
                updateCsrfToken(await this.get('/csrf'));
                setCsrfHeader(config);
                response = await this.innerAxios.request<TData>(config);
            } else {
                throw err;
            }
        }
        return response;
    }
}

export default new AxiosWrapper();
