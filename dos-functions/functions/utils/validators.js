const isEmpty = string => {
  if (string.trim() === '') return true;
  else return false;
};

const isEmail = email => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

let emptyMsg = 'Must not be empty';

exports.validateSignupData = data => {
  let errors = {};

  if (isEmpty(data.firstName)) errors.firstName = emptyMsg;
  if (isEmpty(data.lastName)) errors.lastName = emptyMsg;

  if (isEmpty(data.email)) errors.email = emptyMsg;
  else if (!isEmail(data.email)) errors.email = 'Must be a valid email address';

  if (isEmpty(data.password)) errors.password = emptyMsg;
  if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords must match';

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateLoginData = data => {
  let errors = {};

  if (isEmpty(data.email)) errors.email = emptyMsg;
  if (isEmpty(data.password)) errors.password = emptyMsg;

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateProjectData = data => {
  let errors = {};

  if (isEmpty(data.code)) errors.code = emptyMsg;
  if (isEmpty(data.name)) errors.name = emptyMsg;
  if (isEmpty(data.growthProg)) errors.growthProg = emptyMsg;
  if (isEmpty(data.logo)) errors.logo = emptyMsg;
  if (isEmpty(data.iframeSrc)) errors.iframeSrc = emptyMsg;
  if (isEmpty(data.status)) errors.status = emptyMsg;
  //if (isEmpty(data.tags)) errors.tags = emptyMsg;

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};
