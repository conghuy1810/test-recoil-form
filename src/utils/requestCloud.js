/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
import axios from 'axios';
import { toast } from 'react-toast';
import * as _get from 'lodash/get';
import { TOKEN_KEY, ROLE_KEY } from './constants';

export const API_TIMEOUT = '30000';
// const ROOT_URI = process.env.ROOT_URI;
const instance = axios.create({
  baseURL: 'https://jarvis-api-sit.vpbank.com.vn/stream/v2',
  // timeout: API_TIMEOUT,
});

// const token =
//   'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIrODQsMDk4OTg3ODc2NSIsImNyZWRpdENhcmRJZCI6IjcyNTI2MDI3NDUxNTMiLCJsc3RDcmVkaXRDYXJkSWQiOiIiLCJhdXRoIjoiUk9MRV9VU0VSIiwiZGF0ZSI6IjIwMjItMDMtMTVUMTI6MTU6NTQuNDgiLCJwaG9uZV9udW1iZXIiOiIwOTg5ODc4NzY1IiwibW9iaWxlX2lkIjoiNzI1MjYwMjc0NTE1NCIsInBob25lX3Byb3ZpZGUiOiJudWxsIiwiZW5kX2RhdGVfbW9iaWxlIjoibnVsbCIsImxpbWl0IjoiMCIsImV4cCI6MTY0NzMyNDk1NH0.iJ3yKSIoSRGxzImCLcC3cr1UCYAioWgeZFOaMATHnQOpkbsxNxT5LVi1TC6CV1DZ6owtTo7U4JdP7iPjkgMFoA';
// // add cookie for get document

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
  return instance({
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
}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  return instance({
    url,
    method,
    params,
    data,
    responseType: 'blob',
    headers: {
      ...headers,
      Authorization: token,
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
};

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
}) => {
  return sendRequest({
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
};

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
    // toast.error(errDetect[error.response?.data?.id]);
    toast.error(
      `${error.response?.data?.error} - ${error.response?.data?.description}`
    );
  }
  return Promise.reject(error);
};
