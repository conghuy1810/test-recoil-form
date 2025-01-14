/* eslint-disable no-template-curly-in-string */
import CreateNewIcon from 'assets/icon/folder_open.svg';
import VpbIcon from 'assets/icon/vpb.svg';
import BagIcon from 'assets/icon/office_bag.svg';
import DocumentIcon from 'assets/icon/Document.svg';
import ChartIcon from 'assets/icon/chart.svg';

export const ROOT_URI = process.env.ROOT_URI;
// export const ROOT_URI = 'https://cards.vpbank.com.vn/api';
export const URL = process.env.URL;
export const TOKEN_KEY = 'token';
export const ROLE_KEY = 'role';
export const USERNAME_KEY = 'username';
export const LOGIN_KEY = 'login';

export const PATH_ROUTE = {
  login: '/login',
  workList: '/work-list/:status/:key',
  appDetail: '/app-detail/:id',
  export: '/export',
  listAllApp: '/work-list/application',
  dnd: '/drag_drop',
};

export const ALL_SUBSTATUS_BY_STATUS = [
  {
    name: 'Hồ sơ mới',
    child: null,
    subStatus: 'Processing',
    status: 'VPBCheck',
    // menu: '/work-list/application',
    menu: '/work-list/vpbcheck/processing',
    icon: CreateNewIcon,
    option: { sendToPartner: '' },
  },
  {
    child: [
      {
        subStatus: 'Reject',
        name: 'Từ chối',
        key: 'Reject',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: 'all' },
      },
      {
        subStatus: 'Cancel',
        name: 'Đã hủy',
        key: 'Cancel',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: 'all' },
      },
      {
        subStatus: ['Approve', 'Reject', 'Cancel'],
        name: 'Lỗi gửi kết quả',
        key: 'fail_to_send',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: 'false' },
      },
    ],
    subStatus: null,
    name: 'VPBank thẩm định',
    status: 'VPBCheck',
    icon: VpbIcon,
    option: {},
  },
  {
    child: [
      {
        subStatus: 'Processing',
        name: 'Đang thẩm định',
        key: 'Processing',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: '' },
      },
      {
        subStatus: 'HardReject',
        name: 'Hard reject',
        key: 'HardReject',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: '' },
      },
      {
        subStatus: 'SoftReject',
        name: 'Soft reject',
        key: 'SoftReject',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: '' },
      },
    ],
    subStatus: null,
    name: 'Đối tác thẩm định',
    status: 'PartnerCheck',
    icon: BagIcon,
    option: {},
  },
  {
    child: [
      {
        subStatus: 'Processing',
        name: 'Đang xử lý',
        key: 'Processing',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: '' },
      },
      {
        subStatus: ['Success', 'FailNEO'],
        name: 'Thành công',
        key: 'Success',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: 'all' },
      },
      {
        subStatus: 'FailCIF',
        name: 'Lỗi tạo CIF',
        key: 'FailCIF',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: '' },
      },
      {
        subStatus: 'FailFATCA',
        name: 'Lỗi tạo FATCA',
        key: 'FailFATCA',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: '' },
      },
      {
        subStatus: 'FailCASA',
        name: 'Lỗi tạo CASA',
        key: 'FailCASA',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: '' },
      },
      {
        subStatus: 'FailBNPL',
        name: 'Lỗi tạo BNPL limit',
        key: 'FailBNPL',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: '' },
      },
      {
        subStatus: 'FailCard',
        name: 'Lỗi tạo thẻ',
        key: 'FailCard',
        menu: '/work-list/${status}/${key}',
        option: { sendToPartner: '' },
      },
      // {
      //   subStatus: 'approve_fail_to_send',
      //   name: 'Lỗi gửi kết quả',
      //   key: 'approve_fail_to_send',
      //   menu: '/work-list/${status}/${key}',
      //   option: { sendToPartner: 'false' },
      // },
    ],
    subStatus: null,
    name: 'Hoàn thiện hồ sơ',
    status: 'Approve',
    icon: DocumentIcon,
    option: {},
  },
  {
    name: 'Export báo cáo',
    child: null,
    subStatus: null,
    status: 'Export',
    icon: ChartIcon,
    menu: '/export',
    option: {},
  },
  {
    name: 'Export báo cáo',
    child: null,
    subStatus: null,
    status: 'Export',
    icon: ChartIcon,
    menu: '/drag_drop',
    option: {},
  },
];
export const MAP_PARTNER = {
  SPL: 'Shopee',
};
export const CONST_RELATIONSHIP = {
  1: 'Vợ chồng',
  3: 'Con cái',
  2: 'Bố mẹ',
  4: 'Anh chị em ruột',
  5: 'Họ hàng',
  6: 'Bạn bè',
  7: 'Đồng nghiệp',
  8: 'Khác',
};
