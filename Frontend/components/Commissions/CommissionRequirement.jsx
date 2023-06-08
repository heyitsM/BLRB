import styled from "@emotion/styled";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";

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
}));

export default function CommissionRequirement(props) {
  const {
    commissionRules,
    handleCommissionRulesOnEdit,
    enableEdit,
    handleOnEdit,
    handleOnSet,
  } = props;

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="flex-start"
      mt={2}
    >
      <Grid item xs={6}>
        <Typography variant={"h6"}>
          Set your specific requirements for commissions (do's and don'ts)
        </Typography>
      </Grid>
      <Grid item xs={5}>
        {enableEdit ? (
          <>
            <Box width={"100%"}>
              <Typography variant={"subtitle1"}>{commissionRules}</Typography>
              <Button 
                variant="contained"
                color="tertiary"
                size="large" 
                onClick={handleOnEdit}
              >Edit</Button>
            </Box>
          </>
        ) : (
          <Box width={"100%"}>
            <Grid
              container
              direction="column"
              alignItems={"center"}
              spacing={2}
            >
              <Grid item>    
                <CustomTextField
                  id="outlined-multiline-static"
                  label="Commission Rules"
                  multiline
                  fullWidth
                  minRows={4}
                  maxRows={7}
                  value={commissionRules}
                  onChange={handleCommissionRulesOnEdit}
                />
              </Grid>
              <Grid item>    
                <Button  
                  variant="contained"
                  color="tertiary"
                  size="large" 
                  onClick={handleOnSet}
                  sx={{
                    mr:2
                  }}
                > Confirm</Button>
                <Button  
                  variant="outlined"
                  color="primary"
                  size="large" 
                  onClick={handleOnEdit}
                >Cancel</Button>
              </Grid>
            </Grid>      
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
