import styled from "@emotion/styled";
import { Box, Stack, TextField } from "@mui/material";

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
  }, 
  "& div.MuiAutocomplete-endAdornment .MuiSvgIcon-root": {
    color: "#EA526F"
  }
}));

function UploadTextBoxes(props) {
  const { title, desc, handleTitleChange, handleDescChange } = props;
  return (
    <>
      <Box data-testid="upload-boxes">
        <Stack>
          <CustomTextField
            autoFocus
            data-testid="title"
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            multiline
            value={title}
            inputProps={{ "data-testid": "title-input" }}
            onChange={handleTitleChange}
            required={true}
          />
          <CustomTextField
            data-testid="desc"
            margin="dense"
            variant="outlined"
            label="Description"
            fullWidth
            multiline
            value={desc}
            onChange={handleDescChange}
          />
        </Stack>
      </Box>
    </>
  );
}

export default UploadTextBoxes;
