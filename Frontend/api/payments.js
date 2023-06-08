import axios from "axios";
import { config } from "../../Backend/Constants.js";
import Stripe from "stripe";
import { getUserByUsername } from "./user.js";
const BASE_URL = config.url;
// const BASE_URL = "http://localhost:3000";
// const stripe = Stripe(process.env.REACT_APP_STRIPE_SECRET_SK);
// const stripe = Stripe("sk_test_51Mm0HnEbadkDfDP6BipcGp3uDpxuAXgJUExeNdmWndfAArF823dVWPTUAIdi67Ir46NWk7d2E2cawpgWm1JJFLgg000MHMLgOD");

// on click of button on artists page, lets them configure their stripe payment stuff
// given their user id, get their professional obj, therefore their stripe id, create a new url and return that for a redirect
// maybe do this onload of a page- then the reload_url can be the same url as the page
async function getOnboardingURL(token, id) {
  const response = await axios.get(`${BASE_URL}/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const professional = response.data.data.professionalArtistInfo;
  let accountLink = await axios.post(`${BASE_URL}/payments/setuplink`, {
    id: professional.stripeAccountID,
  }, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  accountLink = accountLink.data;
  // console.log(accountLink);
  return accountLink.url;
}

//will change param to username and then get username from url in page
//but for now using id because that isn't setup on my end
async function isAccountEnabled(token, id) {
  try {
    const response = await axios.get(`${BASE_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const professional_id =
      response.data.data.professionalArtistInfo.stripeAccountID;
    let account = await axios.post(`${BASE_URL}/payments/stripeconnected`, {
      id: professional_id,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    account = account.data;
    return account.details_submitted && account.charges_enabled;
  } catch (err) {
    return false;
  }
}

//will change param to username and then get username from url in page
//but for now using id because that isn't set up on my end
//returns the stripe account id
async function getConnectedAccount(token, id) {
  try {
    const response = await axios.get(`${BASE_URL}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const professional = response.data.data.professionalArtistInfo;
    return professional.stripeAccountID;
  } catch (err) {
    throw new Error(`Error retrieving connected account with id ${id}`);
  }
}

// // on click of checkout button in cart, creates a payment object
// // given the amount, currency, and connected_account_id, create and return the payment object
// async function createPaymentObject({ amount, currency, username, connected_account_id }) {
//     const response = await axios.post(`${BASE_URL}/payments`, {
//         amount,
//         currency,
//         connected_account_id
//     });
//     return response.data;
// }

//this assumes payment for the user with id id has been set up
//will change this to username once that is implemented
async function createPaymentLink(token, { amount, quantity, username, id }) {
  const connected_id = await getConnectedAccount(token, id);
  const isEnabled = await isAccountEnabled(token, id);
  if (!isEnabled) {
    throw new Error(
      "Associated professional account has not enabled payments."
    );
  }

  let product;
  let price;

  try {
    product = await axios.post(`${BASE_URL}/payments/product`, {
      username,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    product = product.data;
    let id = product.id;
    price = await axios.post(`${BASE_URL}/payments/price`, {
      amount,
      product_id: id,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    price = price.data;
  } catch (err) {
    throw Error("Could not create associated price");
  }

  try {
    const session = await axios.post(`${BASE_URL}/payments/createSession`, {
      price_id: price.id,
      quantity: quantity,
      connected_id: connected_id,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return session.data;
  } catch (err) {
    console.log(err);
    const paymentLink = await axios.post(
      `${BASE_URL}/payments/createPaymentLink`,
      {
        price_id: price.id,
        quantity: quantity,
        connected_id: connected_id,
      }, 
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    return paymentLink.data;
  }
}

export {
  getOnboardingURL,
  isAccountEnabled,
  getConnectedAccount,
  createPaymentLink,
};
