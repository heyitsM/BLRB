import { Box, Button, IconButton } from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

function UploadSelection(props) {
  const { handleFileSelection } = props;
  return (
    <>
      <Box
        data-testid="upload-box"
        sx={{
          display: "flex",
          width: "40vh",
          height: "40vh",
          p: 2,
          border: "4px dashed #ffffff",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        
        <IconButton 
          size="large"
          color="white"
          sx={{
            ":hover": {
              bgcolor: "#121212",
              variant:"contained",
              color:"#ffffff"
            },
            fontSize:"70px"
          }}
          component="label"
        >
          <input data-testid="file-upload" hidden accept="image/*" multiple type="file" onChange={handleFileSelection}/>
          <CloudDownloadIcon sx={{fontSize:"90px" }}/>
        </IconButton>
      </Box>
    </>
  );
}

export default UploadSelection;
