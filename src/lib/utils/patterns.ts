export const triadicArabicName = /((\p{Script=Arabic})+ ){2,}(\p{Script=Arabic})+/u;
export const egyptianPhoneNumber = /^01[0125]\d{8}$/;
export const emailPattern =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
export const usernamePattern = /^\w{3,15}$/;
