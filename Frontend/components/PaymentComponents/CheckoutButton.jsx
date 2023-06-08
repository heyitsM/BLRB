import {
  createPaymentLink,
} from "../../api/payments.js";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { Container } from "@mui/material";
import {CircularProgress} from "@mui/material";

export default function CheckoutButton(props) {
  const { artist, commission, commissioner, isClicked, setIsClicked } = props;
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const [paymentLink, setPaymentLink] = useState("");
  const [paymentLinkInfo, setPaymentLinkInfo] = useState("");
  const [checkout, setCheckout] = useState(true);

  useEffect(() => {
    (async () => {
      setIsClicked(true);
      await createPaymentLink(token, {
        amount: commission.price * 100,
        quantity: 1,
        username: artist.first_name,
        id: artist.id,
      }) // will not be using id parameter- will convert createPaymentLink to depend on username instead
        .then((data) => {
          setIsClicked(false);
          setPaymentLink(data.url);
        })
        .catch((err) => {
          setIsClicked(false);
          setCheckout(false);
        });
    })();
  }, []);

  const handleOnClick = () => {
    setIsClicked(true)
    localStorage.setItem("commission-id", commission.id);
  };

  let checkBody = <Button disabled>Checkout</Button>;

  if (checkout) {
    checkBody = (
      <a href={paymentLink}>
        <Button 
          variant="contained"
          color="tertiary"
          size="large"
          sx={{
            margin:1,
            "&.Mui-disabled": {
              background: "#2a2a2a",
              color: "#c0c0c0",
            }
          }}
          disabled={isClicked ? true : false}
          onClick={handleOnClick}>{isClicked ? <CircularProgress color="white" /> : "Checkout"}</Button>
      </a>
    );
  }

  return <>{checkBody}</>;
}
