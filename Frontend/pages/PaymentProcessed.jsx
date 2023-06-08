import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Typography, Box, Stack, Grid } from "@mui/material";
import Button from "@mui/material/Button";
import * as userAPI from "../api/user.js";
import * as commissionAPI from "../api/commission.js";
import * as emailAPI from "../api/email.js";
import img from "../images/ArtStationBackground55.jpg"

function PaymentProcessed() {
  const [user, setUser] = useState(null);
  const [artist, setArtist] = useState(null);
  const [commission, setCommission] = useState(null);
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem("user-token");
  const userId = localStorage.getItem("user-id");
  const commissionId = localStorage.getItem("commission-id");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        if (userId && commissionId && token) {
          let user = (await userAPI.getUser(token, userId)).data;
          setUser(user)

          let commission = (await commissionAPI.getCommission(token, commissionId)).data;
          setCommission(commission)

          let artist = (await userAPI.getUser(token, commission.artist_id)).data;
          setArtist(artist)
          
          await commissionAPI.updateCommission(token, {id: commissionId, status:"PAID"});
          await emailAPI.emailOnPaymentConfirmation(token, {
            req_name:user.first_name, 
            req_email:user.email, 
            pro_name:artist.first_name, 
            pro_email:artist.email, 
            price:commission.price, 
            commission_id:commission.id
          });
        } else {
          throw Error("problem getting information!")
        }
      } catch (err) {
        navigate("/commission-log")
      }
    })();
  }, []);

  const handleOnClick = async () => {
    navigate("/commission-log", { replace: true });
  };

  return (
   <>
  { (commission && artist) ? 
    <>
      <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{
                height:"100vh",
                width:"100vw",
                backgroundPosition:"center",
                backgroundImage:`url(${img})`
            }}
        >
            <Box
                display="flex"
                padding={4}
                sx={{
                  width:"70vw",
                }}
                justifyItems="flex-start"
                alignItems="flex-start"
                bgcolor='background.default'
                borderRadius='12px'
            >
                <Grid
                    container
                    direction={"column"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    spacing={2}
                >
                    <Grid item mb={2}>
                        <Typography variant="h1" fontWeight={"bold"}>
                           Congrats!
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography display={"inline"} variant="h5">
                          {`You have successfully paid for your `}
                        </Typography>
                        <Typography display={"inline"} variant="h5" color={"primary"}>
                          {`$${commission.price}`}
                        </Typography>
                        <Typography display={"inline"} variant="h5">
                          {` commission request to `}
                        </Typography>
                        <Typography display={"inline"} variant="h5" sx={{ fontStyle: 'italic' }} color={"primary"}>
                          {`${artist.username}`} 
                        </Typography>
                        <Typography display={"inline"} variant="h5">
                          {` entitled `} 
                        </Typography>
                        <Typography display={"inline"} variant="h5" sx={{ fontStyle: 'italic' }} color={"primary"}  >
                          {`${commission.title}!`} 
                        </Typography>
                        <Typography textAlign={"center"} variant="h5">
                          {`You will recieve a confirmation email shortly.`} 
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            value={"professional"}
                            sx={{
                              ":hover": {
                                bgcolor: "primary.main",
                                variant:"contained",
                                color:"#121212"
                              }
                            }}
                            onClick={handleOnClick}
                        >
                            <Typography variant="h4">
                                Let's head back home!
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    </>
  : <>Error</>}
   </> )
}

export default PaymentProcessed;
