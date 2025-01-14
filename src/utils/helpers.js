import queryString from 'query-string';
import _, { compact } from 'lodash';
import { TOKEN_KEY, ROLES, ROLE_KEY, ROOT_URI } from './constants';
import moment from 'moment';

export const queryParse = string => {
  return queryString.parse(string, { arrayFormat: 'comma' });
};
export const stringParse = query => {
  return queryString.stringify(query, {
    arrayFormat: 'comma',
    skipNull: true,
    skipEmptyString: true,
  });
};
export const trimAllWhiteSpaces = (string = '') => {
  if (string) {
    const replaceWhiteSpacesInsideString = string.replace(/\s+/g, ' ');
    return replaceWhiteSpacesInsideString.trim();
  }
  return null;
};

export const validateName = val => {
  if (val) {
    const listMatch = String(val || '').match(
      /([A-Za-z\sàáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũụủưứừửữựỳỵỷỹýÀÁÃẠẢĂẮẰẲẴẶÂẤẦẨẪẬÈÉẸẺẼÊỀẾỂỄỆĐÌÍĨỈỊÒÓÕỌỎÔỐỒỔỖỘƠỚỜỞỠỢÙÚŨỤỦƯỨỪỬỮỰỲỴỶỸÝ])/g
    );
    if (String(val || '').length !== listMatch.length) {
      return 'Không chứa kí tự đặc biệt và số';
    }
    return null;
  }
  return 'Không chứa kí tự đặc biệt và số';
};

export function validateString(
  value,
  errorMessage = 'error',
  alphaNumericOnly = false,
  specialCharacterNumer = false
) {
  value = value || '';
  if (value) {
    value = value.toString().trim();
  }
  let errors;
  const reg = /[0-9`~@!#$^%&*()_+=\\\-[\]';,./{}|"":<>?]/g;
  if (!value) {
    errors = errorMessage;
  } else if (alphaNumericOnly && !/^[a-zA-Z0-9]+$/i.test(value)) {
    errors = errorMessage;
  } else if (specialCharacterNumer && reg.test(value)) {
    errors = errorMessage;
  }

  return errors;
}

export function addError(error, key, value) {
  if (value) {
    if (!error) {
      error = {};
    }
    error[key] = value;
  }

  return error;
}

export function validatePhone(
  phone,
  errorMessage = 'error',
  withExt = false,
  mobile = true
) {
  let errors;
  let phoneNumber = _.isObject(phone)
    ? phone?.phoneNumber?.toString()
    : phone
    ? phone.toString()
    : '';
  const pattext = /^[0-9]*$/i;
  const patt = /^[0-9]*$/i;
  if (!phone) {
    errors = {
      countryCode: errorMessage,
      phoneNumber: errorMessage,
    };
    if (withExt) {
      errors.ext = errorMessage;
    }
    return errors;
  }

  if (!phoneNumber || patt.test(phoneNumber) === false) {
    errors = addError(errors, 'phoneNumber', errorMessage);
  }

  if (!phoneNumber || phoneNumber.substring(0, 2) === '00') {
    errors = addError(
      errors,
      'phoneNumber',
      'Xin lỗi quý khách, phần điền số điện thoại quý khách vừa điền không hợp lệ'
    );
  }
  if (mobile) {
    if (
      !phoneNumber ||
      (phoneNumber.substring(0, 1) === '0' && phoneNumber.length !== 10)
    ) {
      errors = addError(
        errors,
        'phoneNumber',
        'Xin lỗi quý khách, phần điền số điện thoại quý khách vừa điền không hợp lệ'
      );
    } else if (
      !phoneNumber ||
      (phoneNumber.substring(0, 1) !== '0' && phoneNumber.length !== 9)
    ) {
      errors = addError(
        errors,
        'phoneNumber',
        'Xin lỗi quý khách, phần điền số điện thoại quý khách vừa điền không hợp lệ'
      );
    }
  } else if (
    !phoneNumber ||
    ((phoneNumber.substring(0, 2) === '02' ||
      phoneNumber.substring(0, 2) === '01') &&
      phoneNumber.length !== 11)
  ) {
    errors = addError(
      errors,
      'phoneNumber',
      'Xin lỗi quý khách, phần điền số điện thoại quý khách vừa điền không hợp lệ'
    );
  } else if (
    !phoneNumber ||
    ((phoneNumber.substring(0, 1) === '2' ||
      (phoneNumber.substring(0, 1) === '0' &&
        phoneNumber.substring(0, 2) !== '02' &&
        phoneNumber.substring(0, 2) !== '01')) &&
      phoneNumber.length !== 10)
  ) {
    errors = addError(
      errors,
      'phoneNumber',
      'Xin lỗi quý khách, phần điền số điện thoại quý khách vừa điền không hợp lệ'
    );
  } else if (
    !phoneNumber ||
    (phoneNumber.substring(0, 1) !== '2' &&
      phoneNumber.substring(0, 1) !== '0' &&
      phoneNumber.substring(0, 2) !== '02' &&
      phoneNumber.substring(0, 2) !== '01' &&
      (phoneNumber.length < 7 || phoneNumber.length > 9))
  ) {
    errors = addError(
      errors,
      'phoneNumber',
      'Xin lỗi quý khách, phần điền số điện thoại quý khách vừa điền không hợp lệ'
    );
  }

  // const phoneAllows = mainStore.getState()?.AppContain?.phoneAllow;

  // if (
  //   phoneAllows &&
  //   phoneAllows.length > 0 &&
  //   mobile &&
  //   (phone?.phoneNumber || phone)
  // ) {
  //   if (
  //     phoneNumber &&
  //     phoneNumber.substring(1, 0) !== '0' &&
  //     phoneNumber.length < 15
  //   ) {
  //     phoneNumber = `0${phoneNumber}`;
  //   }
  //   const exist = phoneAllows.filter(
  //     p => p.phoneNumber === phoneNumber.substring(0, 3)
  //   );
  //   if (exist && exist.length <= 0) {
  //     errors = addError(
  //       errors,
  //       'phoneNumber',
  //       'Xin lỗi quý khách, phần điền số điện thoại quý khách vừa điền không hợp lệ'
  //     );
  //   }
  // }

  if (withExt) {
    if (phone && phone?.ext && pattext.test(phone?.ext) === false) {
      errors = addError(errors, 'ext', errorMessage);
    }
  }

  return errors;
}

export function validateEmail(email, errEmpty, errInvalid) {
  let errors;
  if (!email) {
    errors = errEmpty;
  } else if (
    !/^[a-zA-Z0-9!#$%&’*+/=?^_{|}~-]+(?:\.[a-zA-Z0-9!#$%&’*+/=?^_{|}~-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/i.test(
      email
    )
  ) {
    // eslint-disable-line
    errors = errInvalid;
  }

  return errors;
}

export function validatePassportCard({
  num = '',
  allowedType = [8, 9, 12],
  require = false,
  military = false,
  passport = false,
}) {
  // allowedType
  // 7: passport, 8, 9, 12, 13: cccd, cmnd
  if (!num && require) {
    return 'Bạn chưa nhập trường này';
  }
  const length = num?.length;
  if (!allowedType.includes(length)) {
    // return `Độ dài chỉ cho phép ${allowedType.toString()}`;
    return `Định dạng chưa chính xác, vui lòng kiểm tra lại`;
  }
  if (passport) {
    if (
      [9].includes(length) &&
      !/[0-9]{12}|[0-9]{9}/.test(num) &&
      !/[A-Za-z0-9][0-9]{8}/.test(num)
    ) {
      return `CCCD, CMND chỉ cho phép nhập chữ số`;
    }
  } else if ([9].includes(length) && !/[0-9]{12}|[0-9]{9}/.test(num)) {
    return `CCCD, CMND chỉ cho phép nhập chữ số`;
  }
  if (military) {
    if ([12].includes(length) && !/[0-9]{12}/.test(num)) {
      return `CCCD, CMND chỉ cho phép nhập chữ số hoặc chữ số`;
    }
    if ([8].includes(length) && !/[A-Za-z0-9][0-9]{7}/.test(num)) {
      return `CCCD, CMND quân đội, hộ chiếu chỉ cho phép nhập chữ số hoặc chữ cái`;
    }
  } else if ([12].includes(length) && !/[0-9a-zA-Z]{12}/.test(num)) {
    return `CCCD, CMND chỉ cho phép nhập chữ số hoặc chữ số`;
  }

  // if ([7].includes(length) && !/[0-9A-Za-z]{7}/.test(num)) {
  //   return `Hộ chiếu chỉ cho phép chữ số hoặc chữ cái`;
  // }
  return null;
}

export function validateTimeToServer(time) {
  return moment(time).format('YYYY-MM-DDThh:mm:ss');
}

export function getImageCard(id) {
  return `${ROOT_URI}/images/${id}`;
}

export function currencyFromNum(num) {
  if (num / 1000000 > 1000) {
    return `${num / 1000000000} tỉ đồng`;
  }
  return `${num / 1000000} triệu đồng`; /* $2,500.00 */
}

export function iOS() {
  const isIOS =
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document) ||
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return isIOS;
}
export const checkSafari = () => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  return isSafari;
};
export const checkChromeOrFireFox = () => {
  const isChrome = !!window.chrome;
  const isFirefox = typeof InstallTrigger !== 'undefined';
  return isChrome || isFirefox;
};

function waitFor(millSeconds) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, millSeconds);
  });
}

export async function retryPromiseWithDelay(promise, nthTry, delayTime) {
  try {
    const res = await promise;
    return res;
  } catch (e) {
    if (nthTry === 0) {
      return Promise.reject(e);
    }
    await waitFor(delayTime);
    return retryPromiseWithDelay(promise, nthTry - 1, delayTime);
  }
}

export function getNameFromFullName(name) {
  if (name) {
    return name
      .match(/\s\w/g)
      .reverse()
      .slice(0, 2)
      .join('')
      .replace(/\s/g, '');
  }
  return '';
}
export function nonAccentVietnamese(str) {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
  return str;
}

export const replaceText = val => {
  let str = '';
  const strTrim = String(val || '').trim();
  const arrSplit = String(strTrim).split(' ');

  if (_.isArray(arrSplit) && _.size(arrSplit)) {
    // eslint-disable-next-line no-return-assign
    arrSplit.forEach(item => {
      if (item) str += ` ${String(item).trim()}`;
    });

    str = String(str || '').trim();
  } else {
    str = strTrim;
  }

  return str;
};

export const validateLengthName = val => {
  if (val) {
    const arrSplit = String(replaceText(val)).split(' ');

    if (_.size(arrSplit) >= 2) return true;
    return false;
  }

  return true;
};

export const person = {
  set phoneNum(phone) {
    return phone && localStorage.setItem('phoneNum', phone);
  },
  get phoneNum() {
    return localStorage.getItem('phoneNum');
  },
  set username(phone) {
    return phone && localStorage.setItem('username', phone);
  },
  get username() {
    return localStorage.getItem('username');
  },
  set email(phone) {
    localStorage.setItem('userEmail', phone);
  },
  get email() {
    return localStorage.getItem('userEmail');
  },
  set userRole(role) {
    localStorage.setItem('role', role);
  },
  get userRole() {
    return localStorage.getItem('role');
  },
  set branchId(id) {
    localStorage.setItem('branchId', id);
  },
  get branchId() {
    return localStorage.getItem('branchId');
  },
  set channelId(id) {
    localStorage.setItem('channelId', id);
  },
  get channelId() {
    return localStorage.getItem('channelId');
  },
  set token(val) {
    if (val) {
      localStorage.setItem(TOKEN_KEY, val);
    }
  },
  set clearToken(val) {
    localStorage.setItem(TOKEN_KEY, val);
  },
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  set appId(appId) {
    return appId && localStorage.setItem('appId', JSON.stringify(appId));
  },
  get appId() {
    return localStorage.getItem('appId');
  },
  set userId(id) {
    localStorage.setItem('userId', id);
  },
  get userId() {
    return localStorage.getItem('userId');
  },
  set productType(id) {
    localStorage.setItem('productType', id);
  },
  get productType() {
    return localStorage.getItem('productType');
  },
  set login(id) {
    localStorage.setItem('login', id);
  },
  get login() {
    return localStorage.getItem('login');
  },
};
export function debounce(func, wait, immediate) {
  let timeout;

  return (...args) => {
    const context = this;

    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}