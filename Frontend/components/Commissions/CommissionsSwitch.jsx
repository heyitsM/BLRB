import { Switch } from "@mui/material";
import { isAccountEnabled } from "../../api/payments.js";
import { useState } from "react";
import * as professionalArtistInfoAPI from "../../api/professionalArtistInfo.js";
import { createTheme, ThemeProvider } from "@mui/material/styles";


export default function CommissionsSwitch(props) {
  const { open, setOpen, setValue } = props;
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");

  const theme = createTheme({
    components: {
      MuiSwitch: {
        styleOverrides: {
          switchBase: {
            // Controls default (unchecked) color for the thumb
            color: "#EA526F"
          },
          colorPrimary: {
            "&.Mui-checked": {
              // Controls checked color for the thumb
              color: "#3fcaa3"
            }
          },
          track: {
            // Controls default (unchecked) color for the track
            opacity: 0.2,
            backgroundColor: "pink",
            ".Mui-checked.Mui-checked + &": {
              // Controls checked color for the track
              opacity: 0.7,
              backgroundColor: "#BAE6DA"
            }
          }
        }
      }
    }
  });

  async function handleOnOpen(open) {
    if (open === true) {
      const enabled = await isAccountEnabled(token, userId);
      if (enabled) {
        await professionalArtistInfoAPI.updateInfo(token, {
          id: userId,
          accepting_commissions: true,
        });
        setOpen(true);
      } else {
        await professionalArtistInfoAPI.updateInfo(token, {
          id: userId,
          accepting_commissions: false,
        });
        alert(
          "Please complete your payment setup before opening commissions by navigating to profile settings"
        );
      }
    } else {
      await professionalArtistInfoAPI.updateInfo(token, {
        id: userId,
        accepting_commissions: false,
      });
      setOpen(false);
      setValue("Commissioned");
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Switch checked={open} onChange={(e) => handleOnOpen(e.target.checked)} />
    </ThemeProvider>
  );
}
