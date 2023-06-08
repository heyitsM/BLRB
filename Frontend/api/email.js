import axios from "axios";
import { config } from "../../Backend/Constants.js";

const BASE_URL = config.url;

//integrated
async function emailOnUserSignup(token, { email, name }) {
  const response = await axios.post(`${BASE_URL}/usercreation`, {
    email,
    name,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

//integrated
async function emailOnCommissionStart(token, {
  req_name,
  req_email,
  pro_name,
  pro_email,
  commission_id,
}) {
  const response = await axios.post(`${BASE_URL}/requeststarted`, {
    req_name,
    req_email,
    pro_name,
    pro_email,
    commission_id,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

//after artist clicks the deny request button
async function emailOnArtistDenial(token, {
  req_name,
  req_email,
  pro_name,
  pro_email,
  commission_id,
}) {
  const response = await axios.post(`${BASE_URL}/requestdenied`, {
    req_name,
    req_email,
    pro_name,
    pro_email,
    commission_id,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

//after artist clicks the accept button and sets the price
async function emailOnArtistAcceptance(token, {
  req_name,
  req_email,
  pro_name,
  pro_email,
  price,
  commission_id,
}) {
  const response = await axios.post(`${BASE_URL}/requestaccepted`, {
    req_name,
    req_email,
    pro_name,
    pro_email,
    price,
    commission_id,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

//after customer is redirected to the payment confirmation page
async function emailOnPaymentConfirmation(token, {
  req_name,
  req_email,
  pro_name,
  pro_email,
  price,
  commission_id,
}) {
  const response = await axios.post(`${BASE_URL}/paymentconfirmed`, {
    req_name,
    req_email,
    pro_name,
    pro_email,
    commission_id,
    price,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

//when customer cancels the commission
async function emailOnCommissionerCancellation(token, {
  req_name,
  req_email,
  pro_name,
  pro_email,
  commission_id,
}) {
  const response = await axios.post(`${BASE_URL}/paymentcanceled`, {
    req_name,
    req_email,
    pro_name,
    pro_email,
    commission_id,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

//when artist clicks the done/finished/whatever button
async function emailOnCommissionComplete(token, {
  req_name,
  req_email,
  pro_name,
  pro_email,
  commission_id,
}) {
  const response = await axios.post(`${BASE_URL}/commissioncomplete`, {
    req_name,
    req_email,
    pro_name,
    pro_email,
    commission_id,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.data;
}

export {
  emailOnUserSignup,
  emailOnCommissionStart,
  emailOnArtistDenial,
  emailOnArtistAcceptance,
  emailOnPaymentConfirmation,
  emailOnCommissionerCancellation,
  emailOnCommissionComplete,
};
