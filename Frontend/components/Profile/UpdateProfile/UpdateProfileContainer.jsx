import { Button, Divider, Grid, Typography } from "@mui/material";
import DefaultProfileFields from "./DefaultProfileFields";
import { useEffect, useState } from "react";
import * as profileAPI from "../../../api/Profile.js";
import * as userAPI from "../../../api/user.js";
import * as recruiterAPI from "../../../api/recruiterInfo.js";
import RecruiterProfileFields from "./RecruiterProfileFields";
import ProfileImageSelection from "./ProfileImageSelection";
import SetupPaymentButton from "../../PaymentComponents/SetupPaymentButton";

export default function UpdateProfileContainer(props) {
    const userId = localStorage.getItem("user-id");
    const token = localStorage.getItem("user-token");
    const { setLoading, navigate, loadNavigation, CustomTextField, setAlert, setOpen, setAlertMsg, handleClose, handleUpdate} = props;

    //Default fields
    const [displayName, setDisplayName] = useState("");
    const [userBio, setUserBio] = useState("");
    const [role, setRole] = useState("")
    const [tags, setTags] = useState([]);
    // recruiter fields
    const [ company, setCompany ] = useState("");
    const [ position, setPosition ] = useState("");
    const [ email, setEmail ] = useState("");
    // profile image fields
    const [username, setUsername] = useState("");
    const [file, setFile] = useState(null);
    const [ initialImage, setInitialImage ] = useState(null);

    useEffect(() => {
        (async () => {
          try {
            let data = await profileAPI.getProfile(token, userId)
            if (data.data) {
                let user = data.data
                setDisplayName(user.display_name ? user.display_name : "");
                setUserBio(user.bio ? user.bio : "");
                let temp = [];
                for (let i = 0; i < user.tags.length; i++) {
                    temp.push(user.tags[i]);
                }
                setTags(user.tags ? temp : []);
                setFile(user.profile_pic)
                setInitialImage(user.profile_pic);
            }
            
            let user = (await userAPI.getUser(token, userId)).data;
            if (user) {
                setUsername(user.username);
                setRole(user.role);
                setEmail(user.email);
                if (user.role === "RECRUITER") {
                    data = await recruiterAPI.getInfo(token, userId)
                    let recruiter = data.data;
                    if (recruiter && (recruiter.company !== "---")) {
                        setCompany(recruiter.company);
                        setPosition(recruiter.position);
                    }
                }
            } else {
                throw Error("User is not defined!")
            }
          } catch (err) {
            setAlertMsg(err.response.data.message ? err.response.data.message : err);
            setAlert(true);
          }
        })();
      }, []);

    function validateSubmission()  {
        if (displayName === "" | userBio === "") {
            setOpen(true);
            setAlert(true);
            setAlertMsg("Please enter in all fields!")
            return false;
        } else if (role === "RECRUITER" && (company === "" || position === "")) {
            setOpen(true);
            setAlert(true);
            setAlertMsg("Please enter in all fields!")
            return false;
        } else {
            return true;
        }
    }


    async function updateProfile() {
        let result = await profileAPI.getProfile(token, userId);
        if (!result.data) {
            await profileAPI.createProfile(token, {
                user_id: userId,
                display_name: displayName,
                bio: userBio,
                tags,
            })
            if (file) {
                 await profileAPI.uploadProfileImage(token, file, userId);
            }
        } else {
            await profileAPI.updateProfile(token, {
                user_id: userId,
                display_name: displayName,
                bio: userBio,
                tags,
            })
            
            if (file) {
                // updating an image
                await profileAPI.uploadProfileImage(token, file, userId);
            } else if (!file && initialImage) {
                // deleting image
                await profileAPI.deleteProfileImage(token, userId, null);
            }
        }
    }

    async function setUpRecruiterInfo(recruiterExists) {
        if (!recruiterExists) {
            await recruiterAPI.createInfo(token, {
                id: userId,
                company: company,
                position: position,
                company_email: email,
            })
        } else {
            await recruiterAPI.updateInfo(token, {
                id: userId,
                company: company,
                position: position,
                company_email: email,
            })
        }        
    }

    const handleOnSave = async () => {
        try {
            if (!validateSubmission()) {
                return;
            }
            // begin processing information
            setLoading(true);

            // update general profile information
            await updateProfile();

            // update company information
            if (role === "RECRUITER") {
                let recruiterExists;
                let result = await recruiterAPI.getInfo(token, userId);
                if (result.data) {
                    recruiterExists = true;
                } else {
                    recruiterExists = false;
                }

                await setUpRecruiterInfo(recruiterExists)
            }     

            if(!loadNavigation) {
                navigate("/my-profile")
            } else {
                setLoading(false);
                await handleUpdate();
                handleClose();
            }
        } catch (e) {
            console.log(e)
            setLoading(false)
            setAlertMsg("An error was encountered making your profile. Please try again!");
            setAlert(true);
            setOpen(true);
        }
        
    }

    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="stretch"
        >
            <Grid item alignSelf="center" mb={2}>
                <Typography variant="h4" color="primary">
                    Profile Information
                </Typography>
            </Grid>
            <Grid item> {/* Profile fields */}
                <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="flex-start"
                    spacing={10}
                >
                    <Grid alignSelf={"center"} item>
                        <ProfileImageSelection
                            username={username}
                            setOpen={setOpen}
                            setAlert={setAlert}
                            setAlertMsg={setAlertMsg}
                            file={file}
                            setFile={setFile}
                        />
                    </Grid>
                    <Grid item>
                        <Grid
                            container
                            direction="column"
                            justifyContent="center"
                            alignItems="stretch"
                            spacing={2}
                        >
                            <Grid item>
                                <DefaultProfileFields 
                                    CustomTextField={CustomTextField}
                                    displayName={displayName}
                                    setDisplayName={setDisplayName}
                                    userBio={userBio}
                                    setUserBio={setUserBio}
                                    tags={tags}
                                    setTags={setTags}
                                    role={role}
                                />
                            </Grid>
                            { role === "RECRUITER" ? 
                                <Grid item>
                                    <RecruiterProfileFields
                                        CustomTextField={CustomTextField}
                                        company={company}
                                        setCompany={setCompany}
                                        position={position}
                                        setPosition={setPosition}
                                    />
                                </Grid>
                            : <></>}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {role === "PROFESSIONALY" && loadNavigation ? (
                <>
                    <Grid item mt={5}>
                        <SetupPaymentButton role={role} />
                    </Grid>
                </>
            ) : null}
            <Grid item mt={1} mb={1}>
                <Divider/>
            </Grid>
            <Grid alignSelf={"center"} item>
                <Grid
                    container
                    direction={"row"}

                    alignContent={"stretch"}
                    spacing={2}
                >
                    { loadNavigation ? 
                        <Grid item>
                            <Button
                                variant="outlined"
                                color="primary"
                                size="large"
                                fullWidth
                                data-testid="cancel-button"
                                sx={{
                                    ":hover": {
                                        bgcolor: "primary.main",
                                        variant:"contained",
                                        color:"#121212"
                                    }
                                }}
                                onClick={handleClose}
                            >
                                Cancel
                            </Button>
                        </Grid>
                    : <></>}
                    
                    <Grid item>
                        <Button
                            variant="outlined"
                            color="tertiary"
                            size="large"
                            data-testid="save-button"
                            fullWidth
                            sx={{
                            ":hover": {
                                bgcolor: "tertiary.main",
                                variant:"contained",
                                color:"#121212"
                            }
                            }}
                            onClick={handleOnSave}
                        >
                            Save
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}