import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import * as portfolioAPI from "../../api/portfolio.js";
import Tags from "../Tags.jsx";
import NonEditableFields from "./NonEditableDialogField.jsx";
import styled from "@emotion/styled";

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
    }
  }
}));

function PortfolioDialog(props) {
  const { user, profile, userId, editable, setIsImageListUpdated, onClose, open, targetImage } = props;
  const [title, setTitle] = useState(targetImage.title);
  const [desc, setDesc] = useState(targetImage.description);
  const [tags, setTags] = useState(targetImage.tags);
  const [badMsgalert, setBadMsgAlert] = useState(false);
  const [badMsgOpen, setBadMsgOpen] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const token = localStorage.getItem("user-token");

  useEffect(() => {
    if (targetImage || targetImage.keys.length !== 0) {
      setTitle(targetImage.title);
      setDesc(targetImage.description);
      setTags(targetImage.tags);
    }
  }, [targetImage]);

  const handleCancel = () => {
    setBadMsgAlert(false);
    setBadMsgOpen(false);
    setDeleteOpen(false);
    setDeleteAlert(false);
    setAlertMsg("");
    onClose();
  };

  const confirmationAlert = () => {
    setBadMsgAlert(false);
    setAlertMsg(
      "Are you sure you want to delete this portfolio item? This action is permanent."
    );
    setDeleteOpen(true);
    setDeleteAlert(true);
  };

  const handleEdit = async (value) => {
    if (title === "" || !title) {
      setDeleteAlert(false);
      setAlertMsg("Portfolio items must have a title, please try again!");
      setBadMsgOpen(true);
      setBadMsgAlert(true);
    } else {
      const description = desc;
      setBadMsgAlert(false);
      setDeleteAlert(false);
      setAlertMsg("");
      await portfolioAPI
        .updatePortfolioItem(token, targetImage.id, { title, description, tags })
        .then(() => {
          setIsImageListUpdated(true);
          onClose();
        })
        .catch((e) => {
          setAlertMsg(`Error: ${e.message}`);
          setBadMsgAlert(true);
        });
    }
  };

  const handleDelete = async (value) => {
    await portfolioAPI
      .deletePortfolioItem(token, targetImage.id)
      .then(() => {
        setBadMsgAlert(false);
        setDeleteAlert(false);
        setAlertMsg("");
        setIsImageListUpdated(true);
        onClose();
      })
      .catch((e) => {
        setAlertMsg(`Error: ${e.message}`);
        setBadMsgAlert(true);
      });
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleDescChange = (event) => {
    setDesc(event.target.value);
  };

  return (
    <>
      {badMsgalert ? (
        <Snackbar
          sx={{ zIndex: 500000 }}
          open={badMsgOpen} 
          anchorOrigin={{ vertical: 'top', horizontal: 'center'}} 
          autoHideDuration={4000} 
          onClose={() => { setBadMsgOpen(false); setBadMsgAlert(false); }}
        >
          <Alert
            sx={{ marginTop: "2em" }}
            variant="filled"
            severity="error"
            color="error"
            data-testid="empty-title-alert"
          >
            {alertMsg}
          </Alert>
        </Snackbar>
        ) : (
          <></>
        )}
      {deleteAlert ? (
        <Snackbar
          sx={{ zIndex: 500000 }}
          open={deleteOpen} 
          anchorOrigin={{ vertical: 'top', horizontal: 'center'}} 
          onClose={() => { setDeleteOpen(false); setDeleteAlert(false); }}
        >
          <Alert
            sx={{ marginTop: "2em" }}
            variant="filled"
            severity="warning"
            data-testid="delete-alert"
            action={
              <>
                <IconButton
                  aria-label="close"
                  data-testid="confirm-delete"
                  color="inherit"
                  size="small"
                  onClick={handleDelete}
                >
                  <CheckIcon fontSize="inherit" />
                </IconButton>

                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setDeleteAlert(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </>
            }
          >
            {alertMsg}
          </Alert>
        </Snackbar>
      ) : (
        <></>
      )}
      <Dialog
        sx={{ zIndex:40000}}
        data-testid="img-dialog"
        onClose={onClose}
        open={open}
        maxWidth={"xl"}
      >
        {editable ? 
          <DialogContent>
            <Box
              display={"flex"}
              justifyContent={"center"}
              mb={1}
              margin={1}
            >
              <Typography variant="h5">
                Update Portfolio Item
              </Typography>
            </Box>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="flex-start"
            >
              <Grid item>
                <img
                  data-testid={"image"}
                  src={`${targetImage.img}`}
                  style={{ height: "70vh" }}
                  alt={targetImage.title}
                  loading="lazy"
                />
              </Grid>
              <Grid marginLeft={"1em"} item>
                <Grid
                  container
                  direction={"column"}
                  spacing={2}
                >
                  <Grid item>
                    <CustomTextField
                      autoFocus
                      margin="dense"
                      label="Title"
                      fullWidth
                      variant="outlined"
                      multiline
                      data-testid="title"
                      value={title}
                      inputProps={{ "data-testid": "title-input" }}
                      onChange={handleTitleChange}
                    />
                  </Grid>
                  <Grid item>
                    <CustomTextField
                      autoFocus
                      margin="dense"
                      label="Description"
                      fullWidth
                      data-testid="desc"
                      variant="outlined"
                      multiline
                      inputProps={{ "data-testid": "description-input" }}
                      autoComplete={"true"}
                      value={desc}
                      onChange={handleDescChange}
                    />
                  </Grid>
                  <Grid item>
                    <Tags tags={targetImage.tags} setTags={setTags} />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </DialogContent>
          :
          <DialogContent>
            <Grid
              container
              direction={"row"}
              alignItems="flex-start"
            >
              <Grid item marginRight={2}>
                <img
                  data-testid={"image"}
                  src={`${targetImage.img}`}
                  style={{ height: "60vh" }}
                  alt={targetImage.title}
                  loading="lazy"
                />
              </Grid>
              <Grid item>
                <NonEditableFields user={user} profile={profile} targetImage={targetImage}/>
              </Grid>
            </Grid>
          </DialogContent>
        }
        <DialogActions>
          {editable ? (
            <>
              <Button 
                data-testid="cancel-button" 
                variant="outlined"
                color="primary"
                size="large"
                sx={{
                  ":hover": {
                    bgcolor: "primary.main",
                    variant:"contained",
                    color:"#121212"
                  }
                }}
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button 
                variant="outlined"
                color="tertiary"
                size="large"
                sx={{
                  ":hover": {
                    bgcolor: "tertiary.main",
                    variant:"contained",
                    color:"#121212"
                  }
                }}
                data-testid="edit-button" 
                onClick={handleEdit}
              >
                Finish Editting
              </Button>
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                data-testid="delete-button"
                onClick={confirmationAlert}
                sx={{ fontSize:"25px"}}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </>
          ) : null}
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PortfolioDialog;
