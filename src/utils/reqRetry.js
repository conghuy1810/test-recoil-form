/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import axios from 'axios';
import { toast } from 'react-toast';
import * as _get from 'lodash/get';
import axiosRetry from 'axios-retry';
import { ROOT_URI, TOKEN_KEY, ROLE_KEY } from './constants';

export const API_TIMEOUT = 1000 * 30;
// const ROOT_URI = process.env.ROOT_URI;
const instanceRetry = axios.create({
  baseURL: ROOT_URI,
  // timeout: API_TIMEOUT,
});
axiosRetry(instanceRetry, {
  retries: 3, // number of retries
  retryDelay: retryCount => {
    return retryCount * 1000; // time interval between retries
  },
  retryCondition: error => {
    // if retry condition is not specified, by default idempotent requests are retried
    const deleteSpace = (error?.response?.data?.errorMessage || '').replaceAll(
      ' ',
      ''
    );
    return (
      (deleteSpace.indexOf('timeout') !== -1 ||
        deleteSpace.indexOf('timedout') !== -1) &&
      error?.response?.data?.errorCode === 'BAD_REQUEST'
    );
  },
});

const sendRequest = ({
  url,
  method,
  params,
  data,
  apiName = '',
  isGetHeader,
  headers = {},
  showNoti,
  notiOption,
}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return instanceRetry({
    url,
    method,
    params,
    data,
    headers: {
      ...headers,
      Authorization: token,
      'Access-Control-Allow-Origin': '*',
    },
    // mode: 'no-cors',
  })
    .then(response =>
      !isGetHeader
        ? handleSuccess(response.data, apiName, response, showNoti, notiOption)
        : handleSuccess(response, apiName, response, showNoti, notiOption)
    )
    .catch(error => handleError(error, apiName, showNoti, notiOption));
};

const sendDownloadRequest = ({
  url,
  method,
  params,
  data,
  apiName = '',
  isGetHeader,
  headers = {},
}) =>
  instanceRetry({
    url,
    method,
    params,
    data,
    responseType: 'blob',
    headers: {
      ...headers,
      Authorization:
        process.browser && localStorage.getItem(TOKEN_KEY)
          ? `${localStorage.getItem(TOKEN_KEY)}`
          : '',
      'Access-Control-Allow-Origin': '*',
    },
    // mode: 'no-cors',
  })
    .then(response => {
      const url1 = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url1;
      const fileName = `${apiName}_${new Date().toLocaleDateString()}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
    })
    .catch(error => handleError(error, apiName));

export const download = ({
  url,
  params = {},
  apiName,
  isGetHeader,
  showNoti = false,
}) =>
  sendDownloadRequest({
    url,
    params,
    method: 'GET',
    apiName,
    isGetHeader,
    showNoti,
  });

export const get = ({
  url,
  params = {},
  apiName,
  isGetHeader,
  showNoti = false,
  notiOption,
}) =>
  sendRequest({
    url,
    params,
    method: 'GET',
    apiName,
    isGetHeader,
    showNoti,
    notiOption,
  });

export const post = ({
  url,
  params,
  data,
  apiName,
  headers,
  showNoti = false,
  notiOption,
  isGetHeader,
}) =>
  sendRequest({
    url,
    params,
    data,
    method: 'POST',
    apiName,
    headers,
    showNoti,
    notiOption,
    isGetHeader,
  });

export const put = ({
  url,
  params,
  data,
  apiName,
  showNoti = false,
  notiOption,
}) =>
  sendRequest({
    url,
    params,
    data,
    method: 'PUT',
    apiName,
    showNoti,
    notiOption,
  });

export const deleteData = ({
  url,
  params,
  data,
  apiName,
  showNoti = false,
  notiOption,
}) =>
  sendRequest({
    url,
    params,
    data,
    method: 'DELETE',
    apiName,
    showNoti,
    notiOption,
  });

const handleSuccess = (respond, apiName, response, showNoti, notiOption) => {
  let message = '';
  if (apiName) {
    message = `${apiName} is succeed`;
  }
  if (response) {
    if (response.headers.userrole) {
      localStorage.setItem(ROLE_KEY, response.headers.userrole);
      localStorage.setItem(ROLE_KEY, response.headers.userrole);
    }
  }
  if (showNoti && notiOption?.messageSuccess) {
    toast.success(notiOption?.messageSuccess, {
      // backgroundColor: '#028547',
      // color: 'white',
    });
  }
  return Promise.resolve(respond);
};

const handleError = (error, apiName, showNoti, notiOption) => {
  let message = `Something went wrong`;
  if (error.response) {
    if (error.response.data) {
      message =
        _get(error, 'response.data.description') ||
        error.response.data.error ||
        error.response.data.message;
    }
  }
  if (apiName) {
    message = `${apiName} ${_get(error, 'response.data.description')}`;
  }
  if (showNoti) {
    if (error.response?.data?.message === 'Hồ sơ chưa đủ document') {
      toast.error(error.response?.data?.message);
    } else if (error.response?.data?.message === 'Hồ sơ chưa được kyc') {
      toast.error(notiOption?.messageNotKYC);
    } else {
      // toast.error(errDetect[error.response?.data?.id]);
      toast.error(error.response?.data?.description);
    }
  }
  return Promise.reject(error);
};
