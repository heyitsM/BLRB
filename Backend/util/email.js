import { config } from '../Constants.js';

export const creation = (name, email) => {
    const body = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>Thank you so much for creating an account with us, ${name}!</h1>
                    You created an account on BLRB with email ${email}! Click <a style='color:#EA526F' href='${config.frontend_url}/my-profile'>here</a> 
                     to go to your profile, or click <a style='color:#EA526F' href='${config.frontend_url}/explore'>here</a> to go to our explore page. 
                     We hope you enjoy using our website!<br /><br /> Here's a little more information about the main functions of BLRB:<br />
                    <ol>
                        <li><strong style='color:#EA526F'>Our commissions process: </strong>One 
                            important part of our website is our onboard
                            commissions capability. On our website, you
                            are able to commission artists, or purchase
                            commissions from an artist.</li>
                        <li><strong style='color:#EA526F'>Our artists: </strong>We value artists
                            and their needs, so much of the functionality
                            is set up in a way to make your experience as 
                            efficient as possible. This includes the capability to
                            post your portfolio, which can be found as a tab on
                            your profile page. This also includes the capability
                            to post your resume, which can also be found as a tab on 
                            your profile page. Both functionalities can be used to
                            showcase your skills to recruiters, and the portfolio 
                            can also be used to showcase your talents to the wider 
                            community, potentially to help you gain commissions or
                            just to share some of your best work!</li>
                        <li><strong style='color:#EA526F'>Our community: </strong>Another
                            important part of our website is our interest
                            in fostering a community of artists, recruiters,
                            and people who are interested in art. To that end,
                            posting functionality is available to everyone!</li>
                    </ol>
                    Thanks again for joining BLRB. We hope you like it here!<br /><br />
                    Best,<br /><br /><strong style='color:#EA526F'>The BLRB Team</strong>
                </div>`
    return body;
}

export const requeststarted = (req_name, req_email, pro_name, pro_email, commission_id) => {
    const body1 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: You requested a commission!</h1>
                    Hello ${req_name},<br />
                    You opened a commission with ${pro_name}! Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Artist name:</strong> ${pro_name}<br /><br />
                    For further information about the commissions process, look below! <br />
                    <h3>Commissions Process</h3>
                    <ol>
                        <li><strong style='color:#EA526F'>Step 1: Opening a Commission </strong>
                            The first step is opening a commission, which you have done.
                        </li>
                        <li><strong style='color:#EA526F'>Step 2: Getting Commission Price</strong>
                            After opening a commission, the artist will either approve or deny your commission.
                            If your commission is denied, you will be notified, and you may request a new commission 
                            with alterations or you may request a commission with a different artist.
                        </li>
                        <li><strong style='color:#EA526F'>Step 3: Paying the Price </strong>
                            After a price is set, you either have the option to cancel the commission or to pay the price
                            of the commission! At this step, you will be sent to Stripe, our payment processing service,
                            to pay for your commissions.
                        </li>
                    </ol>
                </div>`;
    const body2 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: ${req_name} requested a commission from you!</h1>
                    Hello ${pro_name},<br />
                    ${req_name} opened a commission with you! Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details, and to approve/deny the request. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Commisisoner name:</strong> ${req_name}<br /><br />
                    For further information about the commissions process, look below! <br />
                    <h3>Commissions Process</h3>
                    <ol>
                        <li><strong style='color:#EA526F'>Step 1: Approving or Denying a Commission</strong>
                            Once you have a commission request, go to your dashboard and look at the commission details.
                            If you would like to accept, go ahead and accept/set price of the commission.
                        </li>
                        <li><strong style='color:#EA526F'>Step 2: Creating the art</strong>
                            After the commissioner has paid for the commission, begin making the art!
                        </li>
                        <li><strong style='color:#EA526F'>Step 3: Sending the art to the commissioner </strong>
                            After you are done doing the work, send it off to the commissioner! We will give you the pertinent information
                            before this step in order to allow you to send it to them, typically by email.
                        </li>
                    </ol>
                </div>`;
    return [body1, body2];
}

export const requestdenied = (req_name, req_email, pro_name, pro_email, commission_id) => {
    const body1 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: Your commission request was denied</h1>
                    Hello ${req_name},<br />
                    Your commission with ${pro_name} was denied! Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Artist name:</strong> ${pro_name}<br /><br />
                    If you would like to re-open a commission, feel free! Just change some of the details. Otherwise, try out another artist!
                </div>`;
    const body2 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: You denied ${req_name}'s commission request</h1>
                    Hello ${pro_name},<br />
                    You denied ${req_name}'s commission request. Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Commisisoner name:</strong> ${req_name}<br /><br />
                </div>`;
    return [body1, body2];
}

export const requestaccepted = (req_name, req_email, pro_name, pro_email, price, commission_id) => {
    const body1 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: Your commission request was accepted!</h1>
                    Hello ${req_name},<br />
                    Your commission request for ${pro_name} was accepted, and the price was set at ${price}! 
                    Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details, and to pay for the commission. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Artist name:</strong> ${pro_name}<br /><br />

                    For further information about the commissions process, look below! <br />
                    <h3>Commissions Process</h3>
                    <ol>
                        <li><strong style='color:#bdbdbd'>Step 1: Opening a Commission </strong>
                            The first step is opening a commission, which you have done.
                        </li>
                        <li><strong style='color:#bdbdbd'>Step 2: Getting Commission Price</strong>
                            After opening a commission, the artist will either approve or deny your commission.
                            If your commission is denied, you will be notified, and you may request a new commission 
                            with alterations or you may request a commission with a different artist. Otherwise, if it is accepted (which it was),
                            you should check your commission log <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> to
                            see the price that was set.
                        </li>
                        <li><strong style='color:#EA526F'>Step 3: Paying the Price </strong>
                            After a price is set, you either have the option to cancel the commission or to pay the price
                            of the commission! At this step, you will be sent to Stripe, our payment processing service,
                            to pay for your commissions.
                        </li>
                    </ol>
                </div>`;
    const body2 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: You accepted a commission request from ${req_name}!</h1>
                    Hello ${pro_name},<br />
                    You recently accepted a commission from ${req_name} and set the price at ${price}! 
                    Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Commisisoner name:</strong> ${req_name}<br /><br />
                </div>`;
    return [body1, body2];
}

export const paymentconfirmed = (req_name, req_email, pro_name, pro_email, commission_id, price) => {
    const body1 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: You paid for a commission!</h1>
                    Hello ${req_name},<br />
                    You paid \$${price} for a commission with ${pro_name}! Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Artist name:</strong> ${pro_name}<br /><br />
                    <strong style='color:#EA526F'>Price:</strong> ${price}<br /><br />
                    <h3>Next steps</h3>
                    Now that you've completed the payment process for this commission, you will be contacted by the artist with the art when they are finished! So, make sure
                    that you're checking your email.
                </div>`;
    const body2 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: ${req_name} paid for your commission!</h1>
                    Hello ${pro_name},<br />
                    ${req_name} paid for the commissionn! Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Commisisoner name:</strong> ${req_name}<br /><br />
                    <strong style='color:#EA526F'>Price:</strong> ${price}<br /><br />
                    <h3>Next steps</h3>
                    Now that the commissioner has paid for their request, begin working on the art! If you wish to contact the commissioner with updates, or have completed
                    work on the art, please email them at ${req_email}.
                </div>`;
    return [body1, body2];
}

export const paymentcanceled = (req_name, req_email, pro_name, pro_email, commission_id) => {
    const body1 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: You canceled a commission!</h1>
                    Hello ${req_name},<br />
                    You canceled a commission with ${pro_name}, after they set the price. Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Artist name:</strong> ${pro_name}<br /><br />
                </div>`;
    const body2 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: ${req_name} canceled a commission from you!</h1>
                    Hello ${pro_name},<br />
                    ${req_name} canceled a commission from you! Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details.<br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Commisisoner name:</strong> ${req_name}<br /><br />
                </div>`;
    return [body1, body2];
}

export const commissioncomplete = (req_name, req_email, pro_name, pro_email, commission_id) => {
    const body1 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: Your commission is complete!</h1>
                    Hello ${req_name},<br />
                    Your commission from ${pro_name} was marked as complete! Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Artist name:</strong> ${pro_name}<br /><br />
                    
                    If you haven't recieved the art from the commissioner, please reach out to them with this email: ${pro_email}
                </div>`;
    const body2 = `<div style='font-family:sans-serif; background-color:#121212; color:#bdbdbd; padding-top:20px; padding-bottom:30px; padding-right:10px; padding-left:10px;'>
                    <h1 style='color:#EA526F'>BLRB: You completed ${req_name}'s commission!</h1>
                    Hello ${pro_name},<br />
                    You completed ${req_name}'s commission! Click <a style='color:#EA526F' href='${config.frontend_url}/commission-log'>here</a> 
                    to see commission details. <br /><br />
                    Here is some information about your commission for your records:<br /><br />
                    <strong style='color:#EA526F'>Commission ID:</strong> ${commission_id}<br />
                    <strong style='color:#EA526F'>Commisisoner name:</strong> ${req_name}<br /><br />
                    
                    If you haven't already sent the art to the commissioner, please do so now by sending it to this email: ${req_email}
                </div>`;
    return [body1, body2];
}