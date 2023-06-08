import { Box, TextField } from "@mui/material";

function ShortTextInput(props) {
  const { label, id, onChange, value } = props;

  return (
    <>
      <Box>
        <TextField
          autoFocus
          margin="dense"
          label={label}
          fullWidth
          variant="standard"
          multiline
          value={value}
          onChange={onChange}
          required={true}
          id={id}
        />
      </Box>
    </>
  );
}

export default ShortTextInput;
