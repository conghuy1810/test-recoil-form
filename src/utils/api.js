import request from 'superagent';

import { navigateTo } from 'utils/history';
import _ from 'lodash';
import { get, post, deleteData, put, download } from './request';
import { get as getCloud, post as postCloud } from './requestCloud';
import { get as getRetry, post as postRetry } from './reqRetry';

import { TOKEN_KEY, ROOT_URI } from './constants';

export const URL = ROOT_URI;
const TIMEOUT = 5000000;

const storage = localStorage;
export const apiList = {
  updateStatusDetails: 'updateStatusDetails',
  documents: 'documents',
  login: '/applications/adminlogin',
  searchApp: `/bnpl-application`,
  getDetail: '/bnpl-application',
  export: '/bnpl-application/export',
  listDocs: '/bnpl-application/docs-type',
  submitFileT24: '/bnpl-application/submit-file-t24',
  listRecord: '/position',
  detailRecord: '/position/section/detail',
};

function callApi(
  endpoint,
  query = {},
  data = {},
  method = 'GET',
  timeout = TIMEOUT
) {
  const token = window.localStorage.getItem(TOKEN_KEY);
  const headers = {
    authorization: token,
  };
  headers['Content-Type'] = 'application/json';

  return new Promise((resolve, reject) => {
    request[method.toLowerCase()](endpoint)
      .query(query)
      .send(data)
      .set(headers)
      .timeout(timeout)
      .end((error, res) => {
        if (error) {
          if (error.statusCode === 401) {
            localStorage.removeItem(TOKEN_KEY);
            navigateTo('/');
          }
          if (res.status === 400 && !endpoint.includes('monitor-network')) {
            const errorStatus = _.get(res, 'body.status', '');
            if (errorStatus && errorStatus === 'Block') {
              // eslint-disable-next-line no-alert
              alert(
                `Lỗi network (${_.get(
                  res,
                  'body.code',
                  ''
                )}). Vui lòng gửi thông tin mã hồ sơ về hòm mail hotroccapp@vpbank.com.vn`
              );
              const errorObject = {
                url: endpoint,
                device: navigator && navigator.userAgent,
                sessionId: _.get(res, 'body.code', ''),
              };
              if (endpoint.includes('adminlogin')) {
                errorObject.provider = data.username;
              }
              // eslint-disable-next-line no-use-before-define
              // sendLogError(errorObject);
            }
          }
          reject(res || error);
        } else {
          resolve(res);
        }
      });
  });
}

export function getEndPoint(endpoint) {
  return URL + apiList[endpoint];
}

export const getToken = () => {
  return storage.getItem(TOKEN_KEY);
};

export const updateStatusDetails = payload => {
  return post({
    url: apiList.updateStatusDetails,
    data: payload,
    apiName: 'updateStatusDetails',
  });
};
export function document(id) {
  return callApi(
    `${getEndPoint('documents')}/${id}/documents`,
    null,
    null,
    'get'
  );
}

export const reqLogin = ({ isLdap = 1, password, username }) => {
  return post({
    url: apiList.login,
    data: { isLdap, password, username },
    apiName: 'reqLogin',
    isGetHeader: true,
  });
};
export const reqGetDetail = id => {
  return get({
    url: `${apiList.getDetail}/${id}`,
    apiName: 'reqGetDetail',
  });
};
export const reqSearchApp = ({
  page = '',
  pageSize = '',
  partnerID = 'SPL',
  applicationId = '',
  fullName = '',
  status = '',
  subStatus = '',
  nid = '', // số cccd/cmt
  phone = '',
  toDate = '',
  fromDate = '',
  sendToPartner = '',
  id = '',
  cif = '',
  casaAccountNumber = '',
  oldNid = '',
}) => {
  return get({
    url: `${
      apiList.searchApp
    }?page=${page}&pageSize=${pageSize}&partnerID=${partnerID}&applicationId=${applicationId}&fullName=${fullName}&status=${status}&subStatus=${subStatus}&nid=${nid}&phone=${phone}&toDate=${
      toDate === 'Invalid date' ? '' : toDate
    }&fromDate=${
      fromDate === 'Invalid date' ? '' : fromDate
    }&sendToPartner=${sendToPartner}&id=${id}&cif=${cif}&casaAccountNumber=${casaAccountNumber}&oldNid=${oldNid}`,
    apiName: 'reqSearchApp',
  });
};
export const reqExport = ({
  partnerID = '',
  applicationId = '',
  fullName = '',
  status = '',
  subStatus = '',
  nid = '',
  phone = '',
  toDate = '',
  fromDate = '',
  sendToPartner = '',
}) => {
  return download({
    url: `${
      apiList.export
    }?partnerID=${partnerID}&applicationId=${applicationId}&fullName=${fullName}&status=${status}
    &subStatus=${subStatus}&nid=${nid}&phone=${phone}&toDate=${
      toDate === 'Invalid date' ? '' : toDate
    }&fromDate=${
      fromDate === 'Invalid date' ? '' : fromDate
    }&sendToPartner=${sendToPartner}`,
    apiName: 'reqGetDetail',
  });
};
export const reqListDocs = id => {
  return get({
    url: `${apiList.listDocs}/${id}`,
    apiName: 'reqListDocs',
  });
};

export const reqSubmitFileT24 = appId => {
  return post({
    url: `${apiList.submitFileT24}?appId=${appId}`,
    apiName: 'reqSubmitFileT24',
  });
};
export const reqListRecord = ({ id = '' }) => {
  return getCloud({
    url: `${apiList.listRecord}?section-id=${id}`,
    apiName: 'reqListRecord',
  });
};

export const reqDetailRecord = id => {
  return getCloud({
    url: `${apiList.detailRecord}?session-id=${id}`,
    apiName: 'reqDetailRecord',
  });
};
