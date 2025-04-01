import {AxiosRequestConfig, AxiosResponse} from 'axios';

import axios from './axiosWrapper';

export function checkResponseStatus(response: AxiosResponse) {
    const {status, data} = response;

    if (status >= 400 || !data) {
        // eslint-disable-next-line no-console
        console.error('Response data:', response);

        throw new Error(`Request error with code ${status}`);
    }
}

export async function request<TData>({method, url, data, headers, params}: AxiosRequestConfig) {
    const response = await axios.request<TData>({
        method,
        data,
        url,
        params,
        headers,
    });
    checkResponseStatus(response);

    return response.data;
}
