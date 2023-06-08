import { Box, TextField } from "@mui/material";

function CommissionDesc(props) {
  const { id, label, onChange, value } = props;

  return (
    <>
      <TextField
        data-testid={id}
        label={label}
        onChange={onChange}
        value={value}
        rows={4}
        multiline
        fullWidth
      />
    </>
  );
}

export default CommissionDesc;
