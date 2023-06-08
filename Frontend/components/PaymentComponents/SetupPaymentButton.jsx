import { getOnboardingURL, isAccountEnabled } from "../../api/payments.js";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";

export default function SetupPaymentButton(props) {
  const { role } = props;
  const [payUrl, setPayUrl] = useState("");
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");


  useEffect(() => {
    if (role === "PROFESSIONALY") {
      getOnboardingURL(token, userId).then((url) => {
        setPayUrl(url);
      });
    }
  });

  let paymentProcessing;

  if (role === "PROFESSIONALY") {
    paymentProcessing = (
      <a href={payUrl}>
        <Button 
          variant="outlined"
          color="secondary"
          fullWidth
          data-testid="payment-button"
          size="large"
          sx={{
              ":hover": {
                  bgcolor: "secondary.main",
                  variant:"contained",
                  color:"#121212"
              }
          }}
        >
          Click to See Payment Information
        </Button>
      </a>
    );
  }

  return <>{paymentProcessing}</>;
}
