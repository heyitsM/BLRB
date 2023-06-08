import { Button, Grid } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PortfolioGrid from "./PortfolioGrid";
import PortfolioDialog from "./PortfolioDialog";

function Portfolio(props) {
  const { user, profile, userId, editable } = props;
  // REQ'D PASS IN USERID

  const [open, setOpen] = useState(false);
  const [targetImage, setTargetImage] = useState({});
  const [isImageListUpdated, setIsImageListUpdated] = useState(false);
  const navigate = useNavigate();

  let handleOnAdd = () => {
    navigate("/upload", { replace: true });
  };

  /* Handle dialog */
  const handleClose = (value) => {
    setOpen(false);
    setTargetImage({});
  };

  return (
    <>
      <Grid marginLeft={"1em"} marginRight={"1em"} container spacing={2}>
        <Grid item xs={editable ? 9 : 12}>
          <PortfolioGrid
            isImageListUpdated={isImageListUpdated}
            setIsImageListUpdated={setIsImageListUpdated}
            userId={userId}
            setOpen={setOpen}
            setTargetImage={setTargetImage}
          />
        </Grid>
        {editable ? (
          <Grid item xs={2}>
            <Button
              data-testid="add-button"
              onClick={handleOnAdd}
              variant="contained"
              fullWidth={true}
              size="large"
            >
              Add image
            </Button>
          </Grid>
        ) : null}
      </Grid>
      <PortfolioDialog
        user={user}
        profile={profile}
        userId={userId}
        editable={editable}
        setIsImageListUpdated={setIsImageListUpdated}
        onClose={handleClose}
        open={open}
        targetImage={targetImage}
      />
    </>
  );
}

export default Portfolio;
