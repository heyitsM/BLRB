import { useState, useEffect } from "react";
import * as React from "react";
import EmailIcon from '@mui/icons-material/Email';
import { Avatar } from "@mui/material";

function MailTo(props) {
  const { email } = props;

  return (<>
    <Avatar data-testid="mail-button"
        size="small"
        sx={{
          bgcolor: "#121212",
          color:"tertiary.main",
          ":hover": {
            bgcolor: "tertiary.main",
            color:"#121212"
          }, 
          fontSize:"12px", 
        }}
        onClick={() => window.location = `mailto:${email}`}>
        <EmailIcon/>
    </Avatar>
  </>);
}

export default MailTo;
