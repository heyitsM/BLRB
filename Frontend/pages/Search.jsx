import { useEffect, useState } from "react";
import * as userAPI from "../api/user.js";
import * as profileAPI from "../api/Profile.js";
import * as postsAPI from "../api/post.js";
import { useNavigate, useLocation } from "react-router";
import { Alert, Box, Container, CssBaseline, Divider, FormControl, Grid, IconButton, InputBase, Pagination, Paper, Snackbar, Stack, TextField, ToggleButton, ToggleButtonGroup, Toolbar } from "@mui/material";
import SideBar from "../components/Explore/SideBar";
import Header from "../components/Header";
import Tags from "../components/Tags.jsx";
import SearchIcon from '@mui/icons-material/Search';
import AccountCard from "../components/Explore/AccountCard.jsx";
import CloseIcon from "@mui/icons-material/Close";
import Post from "../components/Posts/Post.jsx";
import styled from "@emotion/styled";
import ExploreAccounts from "../components/Explore/ExploreAccounts.jsx";

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
      }
    }
  }));


  const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    '& .MuiToggleButtonGroup-grouped': {
      margin: theme.spacing(0.5),
      border: 0,
      '&:not(:first-of-type)': {
        borderRadius: theme.shape.borderRadius,
        color:"primary",
      },
      '&:first-of-type': {
        borderRadius: theme.shape.borderRadius,
        color:"primary",
      },
    },
  }));

  const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    "&:hover": {
        color: 'white',
    }, 
    "&:enabled": {
        color: 'white',
    }, 
    '& + &:before': {
        color: 'white',
    }
  }));

export default function SearchPage(props) {
    const [user, setUser] = useState(null);
    const [open, setOpen] = useState(false);
    
    const userId = localStorage.getItem("user-id");
    const token = localStorage.getItem("user-token");
    
    const navigate = useNavigate();
    const location = useLocation();
    let state = location.state;
    
    const [alert, setAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    
    const [ query, setQuery ] = useState("");
    const [selectedTags, setSelectedTags] = useState([]);
    
    const [ toggleSearch, setToggleSeaarch ] = useState(state? state.toggle : "posts"); // options: posts or users
    const [ postsResults, setPostResults] = useState(null);
    const [ artistResults, setArtistResults] = useState(null);


    useEffect( () => { 
        (async () => {
            try {
              if (userId && token) {  
                let user = await userAPI.getUser(token, userId);
                setUser(user.data)
              } else {
                 navigate("/forbidden", {replace:true});
              }   
            } catch (err) {
              localStorage.removeItem("user-id");
              localStorage.removeItem("user-token");
              console.log(
                "ERROR: Unfortunately this error was encountered. Please try to sign in again!",
                err
              );
              window.alert("ERROR: Unfortunately an error was encountered getting your account information. Please try to sign in again!")
              navigate("/", { replace: true });
            }
          }
        )();

    }, []);

    useEffect(() => {
        if (state && selectedTags && selectedTags.length > 0) {
            state=null;
            handleSubmit();
        }
    }, [selectedTags])

    const handleSubmit = async (e) => {
        if ((!query || query === "") && selectedTags.length === 0) {
            setAlert(true)
            setAlertMsg("Please enter a search request!")
            setOpen(true)
            return
        }

        setPostResults(null);
        setArtistResults(null);

        try {
            if (toggleSearch === "posts") {
                let temptags = selectedTags.join(",")
                let temp = await postsAPI.getPostByFilter(token, {body:query, tags:temptags}); // Insert api call here
                if (temp.data.length === 0) {
                    setAlert(true)
                    setOpen(true)
                    setAlertMsg("No posts found with this query!")
                } else {
                    setPostResults(temp.data) // put the result in here
                }
            } else {
                let temp = await profileAPI.userSearch(token, query, selectedTags);
                if (temp.data.length === 0) {
                    setAlert(true)
                    setAlertMsg("No users found with this query!")
                    setOpen(true)
            } else {
                    setArtistResults(temp.data)
                }
            }
        } catch (e) {
            setAlertMsg("An error was encountered retreiving your results, please try again later")
        }
    }

    const handleQueryOnChange = (e) => {
        setQuery(e.target.value);
    } 

    const handleSearchToggle = (e) => {
        setToggleSeaarch(e.target.value);
    }

    return ( user ? 
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <Header/>
            <SideBar/>
            <Box component="main" sx={{ flexGrow: 1, p:3 }} alignItems="center" justifyContent="center">
                <Container>
                    <Toolbar />
                    {alert ? (
                        <Snackbar 
                            sx={{ zIndex: 10001 }}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center'}} 
                            open={open} 
                            autoHideDuration={4000} 
                            onClose={() => setOpen(false)}
                        >
                            <Alert
                                sx={{ marginTop: "2em" }}
                                variant="filled"
                                severity="warning"
                                data-testid="bad-submission-alert"
                                action={
                                <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    onClick={() => {
                                    setAlert(false);
                                    }}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                                }
                            >
                                {alertMsg}
                            </Alert>                        
                        </Snackbar>
                        ) : (
                        <></>
                    )}
                    <Stack    
                        direction="column"
                        justifyContent={"center"}
                        justifyItems={"center"}
                        spacing={3}
                        sx={{ minWidth: 0}}
                    >
                        <FormControl>
                            <Paper
                                sx={{ 
                                    p: '2px 4px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    minWidth: "40vw",
                                    marginTop:"2em", 
                                    bgcolor:"#2a2a2a"
                                }}
                            >
                                <StyledToggleButtonGroup
                                    color="primary"
                                    value={toggleSearch}
                                    exclusive
                                    onChange={handleSearchToggle}
                                    aria-label="search types"
                                >
                                    <StyledToggleButton 
                                        data-testid="select-post-button" 
                                        color="white"
                                        value="posts"
                                    >
                                        Posts
                                    </StyledToggleButton>
                                    <StyledToggleButton color="white" data-testid="select-users-button" value="users">Users</StyledToggleButton>
                                </StyledToggleButtonGroup>
                                <Divider flexItem sx={{ ml:1, mr:1 }} orientation="vertical" />
                                <CustomTextField
                                    sx={{ ml: 1, width:"60%"}}
                                    data-testid="query-field"
                                    placeholder={toggleSearch === "posts" ? "Search for Posts" : "Search for display names or @Usernames"}
                                    onChange={handleQueryOnChange}
                                    onKeyDown={(e) => {if (e.key === "Enter") { handleSubmit(); }}}
                                    value={query}
                                    onSubmit={handleSubmit}
                                    inputProps={{ "data-testid": "search-input" }}
                                    variant="standard"
                                    InputProps={{
                                        disableUnderline: true, // <== added this
                                    }}
                                />
                                <IconButton 
                                    color="white"
                                    data-testid="search-button" 
                                    type="button" 
                                    sx={{ p: '10px' }} 
                                    aria-label="search" 
                                    onClick={handleSubmit}
                                >
                                    <SearchIcon/>
                                </IconButton>
                                <Divider flexItem sx={{ ml:1, mr:1 }} orientation="vertical" />
                                <Tags mode={"search"} tags={selectedTags} setTags={setSelectedTags} preSelectedTag={state ? state.title : null} />
                            </Paper>
                        </FormControl>
                        <Box my={2} justifyContent="center" marginBottom={2}>
                            { postsResults || artistResults? <>                
                                <Grid
                                    container
                                    justifyContent="center"
                                    alignItems="center"
                                    spacing={1}
                                    marginBottom={2}
                                >
                                    { postsResults ? 
                                    ( postsResults.map(
                                        (p) => (
                                            <Grid key={p.id} item xs={12}>
                                            <div data-testid="post">
                                                <Post post={p} editable={false}/>
                                            </div>
                                            </Grid>)
                                        ))
                                    : 
                                        ( artistResults.map(
                                            (p) => (
                                                <Grid key={p.id} xs={12} item> 
                                                    <div data-testid="user">
                                                        <AccountCard user={p.user} mode={"search"}/>
                                                    </div>
                                                </Grid>
                                            )
                                        ))
                                    }
                                </Grid>

                            </> : null}  
                        </Box>
                    </Stack>
                </Container>
            </Box>
            <Divider sx={{ height:"100vh"}} orientation="vertical" flexItem />
            <ExploreAccounts/>
        </Box>
    : <></>)
}