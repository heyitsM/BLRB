import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/Header";
import { Typography, Box, Stack } from "@mui/material";
import Button from "@mui/material/Button";
import * as profileAPI from "../api/Profile.js";
import * as userAPI from "../api/user.js";
import * as commissionAPI from "../api/commission.js";

const buttonStyle = {
  maxWidth: "300px",
  maxHeight: "50px",
  minWidth: "100px",
  minHeight: "50px",
  fontSize: "16px",
};

function PaymentFailed() {
  const [user, setUser] = useState(null);
  const [artist, setArtist] = useState(null);
  const [commission, setCommission] = useState(null);
  const [profile, setProfile] = useState(null)
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const commissionId = localStorage.getItem("commission-id");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (userId && token && commissionId) {
          let profile = await profileAPI.getProfile(token, userId);
          setProfile(profile.data);

          let user = await userAPI.getUser(token, userId);
          setUser(user.data);

          let commission_resp = await commissionAPI.getCommission(token, commissionId);
          setCommission(commission_resp.data);

          let artist = await userAPI.getUser(token, commission_resp.data.artist_id);
          setArtist(artist.data);
        } else {
          navigate("/forbidden", { replace: true });
        }
      } catch (err) {
        localStorage.removeItem("user-id");
        localStorage.removeItem("commission-id");
        localStorage.removeItem("user-token");
        console.log(
          "ERROR: Unfortunately this error was encountered. Please try to sign in again!",
          err
        );
        window.alert("ERROR: Unfortunately an error was encountered getting your account information. Please try to sign in again!")
        navigate("/", { replace: true });
      }
    })();
  }, []);

  const handleOnClick = () => {
    navigate("/commission-log", { replace: true });
  };

  return (
    <>
      { commission && artist
        ? 
        <>
      <Header />
      <Stack spacing={2} direction="column" alignItems="center">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          direction="column"
          py={10}
          margin={10}
        >
          <Typography align="center" variant="h4" color="primary">
          There was an error processing payment for your commission. Please try
          again later.
          </Typography>
        </Box>

        <Button variant="contained" style={buttonStyle} onClick={handleOnClick}>
          Go to Commission Logs
        </Button>
      </Stack>
    </>
        : null
      }
    </>
  );
}

export default PaymentFailed;
