import { useState, useEffect } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { Box, Grid, Button, Typography } from "@mui/material";
import "@react-pdf-viewer/core/lib/styles/index.css";
import {
  getResumeByUserId,
  uploadResume,
  deleteResume,
  getInfo,
} from "../../api/professionalArtistInfo";

function PdfUpload(props) {
  const { editable, profileUserId } = props;

  const [url, setUrl] = useState("");
  const [file, setFile] = useState("");
  const [hasUploaded, setHasUploaded] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const token = localStorage.getItem("user-token");

  const updateUploaded = async () => {
    getInfo(token, profileUserId).then((data) => {
      let link = data.data.pdf_link;
      

      if (link) {
        setHasUploaded(true);
        setResumeUrl(link);
      } else {
        setHasUploaded(false);
        setResumeUrl("");
      }

      setUrl("");
    });
  };

  useEffect(() => {
    (async () => {
      await updateUploaded();
    })();
  }, []);

  const onChange = (e) => {
    const files = e.target.files;
    setFile(files[0]);
    files.length > 0 && setUrl(URL.createObjectURL(files[0]));
  };

  const handleOnUpload = async (e) => {
    await uploadResume(token, file, profileUserId);
    updateUploaded();
  };

  const handleDelete = async (e) => {
    await deleteResume(token, profileUserId);
    updateUploaded();
  };

  return (
    <div>
      {editable && hasUploaded ? (
        <>
          <Box py={2} px={50}>
            <Button
              data-testid="delete-button"
              onClick={handleDelete}
              variant="contained"
              fullWidth={true}
              size="large"
            >
              Delete
            </Button>
          </Box>
        </>
      ) : (
        <></>
      )}
      {hasUploaded ? (
        <>
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer fileUrl={resumeUrl} httpHeaders={{"Cache-Control":"no-cache"}}/>
          </Worker>
        </>
      ) : (
        <></>
      )}
      {!editable && !hasUploaded ? (
        <>
          <Typography>This user has not uploaded a resume.</Typography>
        </>
      ) : (
        <></>
      )}
      {editable && !hasUploaded ? (
        <>
          <Box xs={{ justifyContent: "space-between" }}>
            <Grid 
              container 
              alignItems="center"
              justifyContent="center"
              spacing={2}
            >
              <Grid item alignSelf={"center"}>
                <input data-testid="pdf-upload" type="file" accept=".pdf" onChange={onChange} />
              </Grid>
              <Grid item xs={12}>
                <div>
                  {url ? (
                    <div
                      style={{
                        border: "1px solid rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      <Box>
                        <Button
                          data-testid="upload-button"
                          onClick={handleOnUpload}
                          variant="contained"
                          fullWidth={true}
                          size="large"
                        >
                          Upload
                        </Button>
                      </Box>
                      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                        <Viewer fileUrl={url} />
                      </Worker>
                    </div>
                  ) : (
                    <Box
                      padding={2}
                      style={{
                        display: "flex",
                        border: "2px dashed white",
                        fontSize: "2rem",
                        alignItems: "center",
                        justifyContent: "center",
                        width:"100%",
                      }}
                    >
                      Preview Area
                    </Box>
                  )}
                </div>
              </Grid>
            </Grid>
          </Box>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}

export default PdfUpload;
