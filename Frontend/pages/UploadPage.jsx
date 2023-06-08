import { Alert, Box, Button, Grid, IconButton, Snackbar, Toolbar, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import UploadTextBoxes from "../components/Upload Components/UploadTextBoxes";
import UploadSelection from "../components/Upload Components/UploadSelection";
import { useNavigate } from "react-router-dom";
import * as portfolioAPI from "../api/portfolio.js";
import Tags from "../components/Tags";
import img from "../images/ArtStationBackground66.jpg"

function UploadPage(props) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState(null);
  const [alert, setAlert] = useState(false);
  const [ isClicked, setClicked ] = useState(false)
  const [submissionAlert, setSubmissionAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [subOpen, setSubOpen] = useState(false);
  const [BadOpen, setBadOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");

  useEffect(() => {
    if (!userId && !token) {
      navigate("/forbidden", {replace:true})
    }
  }, []);

  /* saves selected image, collects preview img, displays file data */
  const handleFileSelection = (event) => {
    if ((event.target.files[0].size >= 8000000)) {
      event.target.value = null
      setBadOpen(true);
      setAlertMsg("Portfolio item cannot be larger than 8mb!");
      setAlert(true);
    } else {
      setFile(event.target.files[0]);
      setPreviewImage(URL.createObjectURL(event.target.files[0]))
      fileData();
    }
  }

  const handleResubmit = (event) => {
      setFile(null);
      fileData();
  }

  const handleTitleChange = (event) => {
      setTitle(event.target.value);
  };

  const handleDescChange = (event) => {
      setDesc(event.target.value);
  };

  const handleTagsChange = (event) => {
      setTags(event.target.value);
  };

  /* Req'd title and file, everything else is optional */
  const handleSubmission = (event) => {
    if (!file) {
      setBadOpen(true);
      setAlertMsg("Portfolio item must have image!");
      setAlert(true);
    } else if (title === "" || !title) {
      setBadOpen(true);
      setAlertMsg("Portfolio item must have title!");
      setAlert(true);
    } else {
      setClicked(true);
      const description = desc;
      portfolioAPI.createPortfolioItem(token, userId, file, {title, description, tags}).then(
        (data) => {
          let portfolioItem = data.data;
          portfolioAPI.uploadPortfolioItemImage(token, file, portfolioItem.id);
          setSubmissionAlert(true);
          setSubOpen(true);
          setAlertMsg("Submission successful!");
          setAlert(false);
          setFile(null);
          setTitle("");
          setDesc("");
          setTags([]);
          setClicked(false);
        }
      ).catch((e) => {
        setClicked(false);
        setBadOpen(true);
        setAlert(true);
        setAlertMsg(e.message);
        setSubmissionAlert(false);
      })
    }
  }

  const handleCancel = (event) => {
      navigate("/my-profile", {replace:true})
  }

  /* Displays file information and the preview image. */
  const fileData = () => {
        if (file) {
          return (
              <>
                <Grid
                  container
                  direction={"column"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Grid item>
                    <img data-testid="image" height={"200px"} src={previewImage} />
                  </Grid>
                  <Grid item>
                    <p>File Name: {file.name}</p>
                    <p>
                      Last Modified:{" "}
                      {new Date(file.lastModified).toDateString()}
                    </p>
                  </Grid>
                  <Grid item>
                    <Button 
                      data-testid="reselection-button" 
                      variant="outlined" 
                      size="large" 
                      color="tertiary"
                      fullWidth
                      sx={{
                        ":hover": {
                          bgcolor: "tertiary.main",
                          variant:"contained",
                          color:"#121212"
                        }
                      }}
                      disabled={isClicked ? true : false}
                      onClick={handleResubmit}
                    >
                      Select a Different Image
                    </Button>
                  </Grid>
                </Grid>
              </>
          );
        } else {
          // if there is no file selected, allow for file selection
          return (
            <UploadSelection file={file} handleFileSelection={handleFileSelection}/>
          );
        }
    };

  return (
    <>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{
          height:"100vh",
          width:"100vw",
          backgroundPosition:"center",
          backgroundImage:`url(${img})`
        }}
      >

        <Header/>
        <Toolbar />
        {submissionAlert ? (
          <Snackbar
            sx={{ zIndex: 40000 }}
            open={subOpen} 
            anchorOrigin={{ vertical: 'top', horizontal: 'center'}} 
            autoHideDuration={4000} 
            onClose={() => { setSubOpen(false); setSubmissionAlert(false); }}
          >
            <Alert
                sx={{ marginTop: "2em" }}
                variant="filled"
                severity="success"
                data-testid="submission-alert"
                color="tertiary"
                onClose={((e) => {
                  setSubOpen(false);
                  setSubmissionAlert(false);
                })}
            >
                {alertMsg}
            </Alert>
          </Snackbar>
          ) : ( <></> )}
          {alert ? (
            <Snackbar
              sx={{ zIndex: 40000 }}
              open={BadOpen} 
              anchorOrigin={{ vertical: 'top', horizontal: 'center'}} 
              autoHideDuration={4000} 
              onClose={() => {setBadOpen(false); setAlert(false);}}
            >  
              <Alert
                data-testid="bad-submission-alert"
                variant="filled"
                severity="warning"
                color="secondary"
                onClose={((e) => {
                  setBadOpen(false);
                  setAlert(false);
                })}
              >
                  {alertMsg}
              </Alert>
            </Snackbar>
          ) : ( <></> )
        }
        <Box
          display="flex"
          mt={4}
          padding={4}
          justifyItems="flex-start"
          alignItems="flex-start"
          bgcolor='background.default'
          borderRadius='12px'
          ml={-7}
        >
          <Stack>
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                mt={1}
              >
                <Typography variant="h4" sx={{ fontWeight:"bold" }}>
                    Upload Portfolio Items
                </Typography>
              </Box>
              <Grid 
                  data-testid="submission-section" 
                  container 
                  justifyContent={"center"} 
                  marginTop={"1em"} 
                >
                  <Grid item>
                      {fileData()}
                  </Grid>
                  <Grid item marginLeft={"1em"}>
                    <UploadTextBoxes 
                      title={title} 
                      desc={desc} 
                      tags={tags} 
                      handleDescChange={handleDescChange} 
                      handleTagsChange={handleTagsChange} 
                      handleTitleChange={handleTitleChange}
                    />
                    <Grid item mt={1}>
                      <Tags tags={tags} setTags={setTags}/>
                    </Grid>
                    <Grid container marginTop={"2em"} justifyContent={"center"} spacing={2}>
                          <Grid item>
                            <Button 
                              data-testid="cancel-button" 
                              variant="outlined"
                              color="primary"
                              size="large"
                              fullWidth
                              disabled={isClicked ? true : false}
                              onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                          </Grid>
                          <Grid item>
                            <Button 
                              data-testid="confirm-button" 
                              variant="contained"
                              color="tertiary"
                              size="large"
                              fullWidth
                              disabled={isClicked ? true : false}
                              onClick={handleSubmission}>
                                Confirm
                            </Button>
                          </Grid>
                      </Grid>
                  </Grid>
              </Grid>
          </Stack>
        </Box>
      </Box>
    </>
  );
}

export default UploadPage;