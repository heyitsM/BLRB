import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useState } from "react";
import * as commissionAPI from "../../api/commission.js";
import * as userAPI from "../../api/user.js";
import * as emailAPI from "../../api/email.js";

function ConfirmationDialog(props) {
  const {
    id,
    title,
    desc,
    notes,
    confirm,
    setConfirm,
    artist_id,
    commissioner_id,
    artist_email,
    setTitle,
    setDescription,
    setNotes,
    artistName,
  } = props;

  const [firstStep, setFirstStep] = useState(true);
  const token = localStorage.getItem("user-token");

  const handleClose = () => {
    setConfirm(false);
  };

  async function handleOk() {
    if (firstStep) {
      const commission = await commissionAPI.createCommission(token, {
        artist_id,
        commissioner_id,
        title,
        description: desc,
        notes,
      });
      const commissioner = await userAPI.getUser(token, commissioner_id);
      await emailAPI.emailOnCommissionStart(token, {
        req_name: commissioner.data.first_name,
        req_email: commissioner.data.email,
        pro_name: artistName,
        pro_email: artist_email,
        commission_id: commission.data.id,
      });
      setFirstStep(!firstStep);
      setTitle("");
      setDescription("");
      setNotes("");
    } else {
      setConfirm(false);
      setFirstStep(!firstStep);
    }
  }

  if (firstStep) {
    return (
      <>
        <Dialog
          data-testid={"confirmation-dialog"}
          open={confirm}
          sx={{ "& .MuiDialog-paper": { width: "100%" } }}
          maxWidth="lg"
        >
          <DialogTitle align="center" sx={{fontWeight:"bold", typography:"h4", color:"primary.main" }}>Please Confirm Commission Request</DialogTitle>
          <DialogContent>
            <>
              <Typography variant="h5" fontWeight={"bold"} color={"primary"}>Title:</Typography>
              <Typography ml={2} variant="subtitle" sx={{ display:"inline" }} fontStyle={"italic"} color={"#bdbdbd"}>{title}</Typography>
            </>
            <>
              <Typography variant="h5" fontWeight={"bold"} color={"primary"}>Description:</Typography>
              <Typography ml={2} variant="subtitle" sx={{ display:"inline" }} fontStyle={"italic"} color={"#bdbdbd"}>{desc}</Typography>
            </>
            <>
              { notes === "" ? <></> :
                <>
                  <Typography variant="h5" fontWeight={"bold"} color={"primary"}>Notes:</Typography>
                  <Typography ml={2} variant="subtitle" sx={{ display:"inline" }} fontStyle={"italic"} color={"#bdbdbd"}>{notes}</Typography>
                </>
              }
            </>
          </DialogContent>
          <DialogActions sx={{ justifyContent:"center"}}>
            <Button
              data-testid="confirmation-cancel-button"
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
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button 
              data-testid="confirmation-ok-button" 
              variant="contained"
              color="tertiary"
              size="large"
              sx={{
                margin:1,
                ":hover": {
                  bgcolor: "tertiary.main",
                  variant:"contained",
                  color:"#121212"
                }
              }}
              onClick={handleOk}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
  if (!firstStep) {
    return (
      <>
        <Dialog
          data-testid={"submission-dialog"}
          open={confirm}
          sx={{ "& .MuiDialog-paper": { width: "100%" } }}
          maxWidth="lg"
        >
          <DialogTitle align="center" sx={{fontWeight:"bold", typography:"h4", color:"primary.main" }}>Commission Request Sent!</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {`Your commission request to ${artistName} has been sent! You will receieve an email confirmation shortly. When the commission request is approved, 
              you will receive details regarding the next steps for your commission.`}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent:"center"}}>
            <Button data-testid="confirmation-ok-button" 
              variant="contained"
              color="tertiary"
              size="large" onClick={handleOk}>Ok</Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}

export default ConfirmationDialog;
