import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import { useEffect, useState } from "react";
import CheckoutButton from "../PaymentComponents/CheckoutButton";
import * as commissionAPI from "../../api/commission.js";
import * as emailAPI from "../../api/email.js";
import styled from "@emotion/styled";
import CloseIcon from '@mui/icons-material/Close';

const CustomTextField = styled(TextField)((theme) =>( {
  "& label.Mui-focused": {
    color: "#EA526F"
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#EA526F"  
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderRadius: 20,
      borderColor: "#bdbdbd"
    },
    "&:hover fieldset": {
      borderColor: "#ffffff"
    },
    "&.Mui-focused fieldset": {
      borderRadius: 20,
      borderColor: "#EA526F"
    },
  }, 
  "& .MuiInputBase-input.Mui-disabled": {
    WebkitTextFillColor:"#bdbdbd",
    borderRadius: 20,
    borderColor: "#bdbdbd"
  }, 
  "& .MuiInputBase-input.Mui-disabled:hover fieldset": {
    borderRadius: 20,
    borderColor: "#bdbdbd !important"
  }, 
  "& .Mui-disabled .MuiOutlinedInput-notchedOutline": {
    borderColor: "#bdbdbd !important"
  },
  "& label.Mui-disabled": {
    color: "#bdbdbd"
  },    

}));

export default function CommissionDialog(props) {
  const {
    enableCommissionerView: commissionerView,
    artist,
    commissioner,
    commission,
    open,
    handleClose,
  } = props;
  const [displaySetPriceField, setDisplayPriceField] = useState();
  const [isClicked, setIsClicked] = useState(false);
  const token = localStorage.getItem("user-token");
  const [price, setPrice] = useState(0.0);

  useEffect(() => {
    setPrice(0.0);
    setDisplayPriceField(
      commission.status === "REQUESTED" && !commissionerView ? true : false
    );
  }, [open]);

  const displayButton = () => {
    if (commission.status === "REQUESTED" && commissionerView) {
      return (
        <DialogActions style={{ alignItems:"center", justifyContent:"center"}}>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Typography variant="h6">
              Please wait for the artist to accept or deny
            </Typography>
          </Box>
        </DialogActions>
      );
    } else if (commission.status === "PAID" && !commissionerView) {
      return (
        <DialogActions  style={{ alignItems:"center", justifyContent:"center"}}>
          <Box display="flex" alignItems="center" justifyContent="center">
            <Button
              variant="outlined"
              color="tertiary"
              size="large"
              fullWidth
              disabled={isClicked ? true : false}
              sx={{
                ":hover": {
                  bgcolor: "tertiary.main",
                  variant:"contained",
                  color:"#121212"
                }, 
                "&.Mui-disabled": {
                  background: "#2a2a2a",
                  color: "#c0c0c0",
                },
                fontSize:"20px"
              }}
             onClick={handleOnComplete}> {isClicked ? <CircularProgress color="white" /> : "Mark as Complete"}</Button>
          </Box>
        </DialogActions>
      );
    } else if (commission.status === "PAID" && commissionerView) {
      return (
        <DialogActions style={{ alignItems:"center", justifyContent:"center"}}>
          <Typography variant="h5">
            Your artist is making your commission right now!
          </Typography>
        </DialogActions>
      );
    } else {
      return (
       <></>
      );
    }
  };

  const handleOnComplete = async () => {
    setIsClicked(true)
    await commissionAPI.updateCommission(token, {
      id: commission.id,
      status: "COMPLETED",
    });
    await emailAPI.emailOnCommissionComplete(token, {
      req_name: commissioner.first_name,
      req_email: commissioner.email,
      pro_name: artist.first_name,
      pro_email: artist.email,
      commission_id: commission.id,
    });
    setIsClicked(false)
    handleClose();
  };

  const handleDisplayPrice = () => {
    if (displaySetPriceField && !commissionerView) {
      return (
        <Box
          display={"flex"}
        >
          <CustomTextField
            value={price}
            onChange={handlePriceOnEdit}
            type="number"
            disabled={isClicked ? true : false}
            InputProps={{ startAdornment:(<InputAdornment position="start">$</InputAdornment>) }}
            label="Amount"
          />
          <Button 
            variant="outlined"
            color="primary"
            size="large"
            sx={{
              margin:1,
              "&.Mui-disabled": {
                background: "#2a2a2a",
                color: "#c0c0c0",
              }
            }}
            disabled={isClicked ? true : false}
            onClick={async () => {handleArtistDeny();}} 
          >
            Deny
          </Button>
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
            disabled={(isClicked || parseInt(price) === 0 || isNaN(price)) ? true : false}
            onClick={handleSetPrice}
          >
            {isClicked ? <CircularProgress color="white" /> : "Set"}
          </Button>
        </Box>
      );
    } else if (commission.status === "REQUESTED" && commissionerView) {
      return (
        <Typography fontSize={"20px"} color={"#bdbdbd"} sx={{ wordWrap:"break-word", fontStyle: 'italic' }}>
          Please wait for the artist to set the price!
        </Typography>
      );
    } else if (commission.status === "PENDING" && commissionerView) {
      return (
        <>
          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography fontSize={"24px"} mr={15}>
                {"$" + parseFloat(commission.price).toFixed(2)}
              </Typography>
            </Grid>
            <Grid item>
              <CheckoutButton
                artist={artist}
                commission={commission}
                commissioner={commissioner}
                isClicked={isClicked}
                setIsClicked={setIsClicked}
              />
              <Button 
                variant="outlined"
                color="primary"
                size="large"
                sx={{
                  margin:1,
                  ":hover": {
                    bgcolor: "primary.main",
                    variant:"contained",
                    color:"#121212"
                  },
                  "&.Mui-disabled": {
                    background: "#2a2a2a",
                    color: "#c0c0c0",
                  }
                }}
                disabled={isClicked ? true : false}
                onClick={handleCommissionerDeny} 
              >
                Deny
              </Button>
            </Grid>
          </Grid>
        </>
      );
    } else if (commission.price) {
      return (
        <Typography fontSize={"20px"} sx={{ wordWrap:"break-word", fontStyle: 'italic' }}>
          {"$" + parseFloat(commission.price).toFixed(2)}
        </Typography>
      );
    } else if (false) {
    }
  };

  // TODO: api call to set status to deny.
  const handleArtistDeny = async () => {
    try {
      setIsClicked(true);
      await commissionAPI.updateCommission(token, {
        id: commission.id,
        status: "REJECTED",
      });
      await emailAPI.emailOnArtistDenial(token, {
        req_name: commissioner.first_name,
        req_email: commissioner.email,
        pro_name: artist.first_name,
        pro_email: artist.email,
        commission_id: commission.id,
      });
      setIsClicked(false);
      handleClose();
    } catch (e) {
      window.alert("There was an error denying this commission please try again!")
      console.log(e);
      setIsClicked(false);
      handleClose();
    }
  };

  const handleCommissionerDeny = async () => {
    isClicked(true)
    await commissionAPI.updateCommission(token, {
      id: commission.id,
      status: "REJECTED",
    });
    await emailAPI.emailOnCommissionerCancellation(token, {
      req_name: commissioner.first_name,
      req_email: commissioner.email,
      pro_name: artist.first_name,
      pro_email: artist.email,
      commission_id: commission.id,
    });
    isClicked(false)
    handleClose();
  };

  const handlePriceOnEdit = (event) => {
    setPrice(parseFloat(event.target.value));
  };

  // TODO: API call to update status and set price.
  const handleSetPrice = async (event) => {
    try {
      setIsClicked(true)

      if (parseInt(price) === 0) {
        setIsClicked(false)
        return;
      }

      await commissionAPI.updateCommission(token, {
        id: commission.id,
        price: parseInt(price),
        status: "PENDING",
      });

      await emailAPI.emailOnArtistAcceptance(token, {
        req_name: commissioner.first_name,
        req_email: commissioner.email,
        pro_name: artist.first_name,
        pro_email: artist.email,
        price,
        commission_id: commission.id,
      });
      setIsClicked(false);
      handleClose();
    } catch (err) {
      setIsClicked(false)
      console.log("ensure price is an float type");
    }
  };

  return (
    <Dialog 
      open={open}  
      scroll="body" 
      onClose={ (event, reason) => { if (reason && reason == "backdropClick" && isClicked ) { return; }  handleClose()}} 
      fullWidth 
      maxWidth="lg" 
      sx={{ zIndex:40000 }}
    >
      <DialogTitle sx={{ m: 2, p: 2 }}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
          color="primary"
          >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="h4" fontWeight={"bold"} margin={2} textAlign={"center"}>
          Commission Details
        </Typography>
        {displayButton()}
        <Box
          display={"flex"}
        >
          <Grid
            container
            direction="column"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Grid container data-testid="Names" marginY={2} item>
              <Grid
                container
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Grid item xs={3} >
                  <Typography fontSize={"20px"} variant="h4" fontWeight={"bold"} color={"primary"}  sx={{ wordWrap:"break-word" }}>
                    {commissionerView ? `Artist's Name` : `Commissioner's Name`}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize={"20px"} variant="h4" sx={{ wordWrap:"break-word", fontStyle: 'italic' }}>
                    {commissionerView ? `${artist.first_name} ${artist.last_name}` : `${commissioner.first_name} ${commissioner.last_name}`}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Divider sx={{ width:"100%"}}/>

            <Grid container data-testid="Email" marginY={2} item>
              <Grid
                container
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Grid item xs={3} >
                  <Typography fontSize={"20px"} variant="h4" fontWeight={"bold"} color={"primary"}  sx={{ wordWrap:"break-word" }}>
                    {commissionerView ? `Artist's Email` : `Commissioner's Email`}
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography fontSize={"20px"} variant="h4" sx={{ wordWrap:"break-word", fontStyle: 'italic' }}>
                    {commissionerView ? `${artist.email}` : `${commissioner.email}`}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Divider sx={{ width:"100%"}}/>

            <Grid container data-testid="Description" marginY={2} item>
              <Grid
                container
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Grid item xs={3} >
                  <Typography fontSize={"20px"} variant="h4" fontWeight={"bold"} color={"primary"}  sx={{ wordWrap:"break-word" }}>
                    {commissionerView ? `Description` : `Description`}
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography fontSize={"20px"} variant="h4" sx={{ wordWrap:"break-word", fontStyle: 'italic' }}>
                    {commission.description}  
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Divider sx={{ width:"100%"}}/>

            <Grid container data-testid="Notes" marginY={2} item>
              <Grid
                container
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Grid item xs={3} >
                  <Typography fontSize={"20px"} variant="h4" fontWeight={"bold"} color={"primary"}  sx={{ wordWrap:"break-word" }}>
                    {commissionerView ? `Extra Notes` : `Extra Notes`}
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography fontSize={"20px"} variant="h4" sx={{ wordWrap:"break-word", fontStyle: 'italic' }}>
                    {commission.notes}
                  </Typography>      
                </Grid>
              </Grid>
            </Grid>
            <Divider sx={{ width:"100%"}}/>

            <Grid container data-testid="Price" marginY={2} item>
              <Grid
                container
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Grid item xs={3} >
                  <Typography fontSize={"20px"} variant="h4" fontWeight={"bold"} color={"primary"}  sx={{ wordWrap:"break-word" }}>
                    Price
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  {handleDisplayPrice()}
                </Grid>
              </Grid>
            </Grid>
            <Divider sx={{ width:"100%"}}/>

             <Grid container data-testid="Status" marginY={2} item>
              <Grid
                container
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Grid item xs={3} >
                  <Typography fontSize={"20px"} variant="h4" fontWeight={"bold"} color={"secondary"}  sx={{ wordWrap:"break-word" }}>
                    Status
                  </Typography>
                </Grid>
                <Grid item xs={9}>
                  <Typography fontSize={"20px"} variant="h4" color={"secondary"} sx={{ wordWrap:"break-word", fontStyle: 'italic' }}>
                    {commission.status}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Divider sx={{ width:"100%"}}/>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
