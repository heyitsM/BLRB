
import { useState } from "react";
import { Box, Button, TextField, Stack, Typography } from "@mui/material";
import ConfirmationDialog from "./ConfirmationDialog.jsx";
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
      borderColor: "#EA526F"
    },
    "&.Mui-focused fieldset": {
      borderRadius: 20,
      borderColor: "#EA526F"
    }
  }
}));

function CommissionForm(props) {
  const { artist, commissionRules, setAlert, setAlertOpen, setAlertMsg } = props;
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleOnRequest() {
    if (title === "" || description === "") {
      setAlertMsg("You must enter a title and description to submit a commission!");
      setAlertOpen(true)
      setAlert(true)
      return;
    }

    setConfirm(true);
  }

  const clearFields = () => {
    setTitle("");
    setDescription("");
    setNotes("");
  };

  async function handleOnCancel() {
    clearFields();
  };

  return (
    <>
      <Box
        style={{
          maxWidth: "100%",
        }}
        py={2}
      >
        <Stack spacing={2} justifyContent={"center"}>
          <Box>
            <Typography variant="h6">
              Some Commission Rules
            </Typography>
            <Typography color={"#bdbdbd"} sx={{ fontStyle: 'italic' }}>
              {commissionRules === "" || !commissionRules ? "This artist has chosen not to specify commission rules." : commissionRules}
            </Typography>
          </Box>

          <CustomTextField
            data-testid="title-field"
            label="Title"
            required
            onChange={(e) => setTitle(e.target.value)}
            value={title}
            multiline
            inputProps={{ "data-testid": "title-input" }}
            rows={1}
            fullWidth
          />
          <CustomTextField
            data-testid="desc-field"
            label="Description of Commission"
            rows={4}
            multiline
            required
            inputProps={{ "data-testid": "desc-input" }}
            onChange={(e) => setDescription(e.target.value)}
            value={description}
            helperText="Give a description that's as general or specific as you'd like! 😀"
          />
          <CustomTextField
            data-testid="notes-field"
            label="Notes"
            multiline
            rows={4}
            onChange={(e) => setNotes(e.target.value)}
            inputProps={{ "data-testid": "notes-input" }}
            value={notes}
            helperText="Give some of your do's and don'ts (e.g. style, theme, characters etc. 😉 "
          />
        </Stack>
      </Box>
      <ConfirmationDialog
        keepMounted          
        data-testid="confirmation-dialog"
        title={title}
        desc={description}
        notes={notes}
        artist_id={artist.id}
        artist_email={artist.email}
        commissioner_id={localStorage.getItem('user-id')}
        confirm={confirm}
        setConfirm={setConfirm}
        setTitle={setTitle}
        setDescription={setDescription}
        setNotes={setNotes}
        artistName={artist.username}
      />
      <Box display="flex" alignItems="center" justifyContent="center" py={4}>
        <Box px={2}>
          <Button
            data-testid="cancel-button"
            variant="outlined"
            onClick={handleOnCancel}
          >
            Cancel
          </Button>
        </Box>
        <Box px={2}>
          <Button
            data-testid="request-button"
            variant="contained"
            color="tertiary"
            onClick={handleOnRequest}
          >
            Request
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default CommissionForm;
