import { Box, Button, Grid, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import img from "../images/ArtStationBackgroundNotFound.jpg"

export default function NotFound() {
    const navigate = useNavigate();

    return (
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
            <Box
                display="flex"
                padding={4}
                justifyItems="flex-start"
                alignItems="flex-start"
                bgcolor='background.default'
                borderRadius='12px'
            >
                <Grid
                    container
                    direction={"column"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    spacing={2}
                >
                    <Grid item mb={2}>
                        <Typography variant="h6" fontWeight={"bold"}>
                            ERROR404
                        </Typography>
                    </Grid>
                    <Grid item mb={2}>
                        <Typography variant="h1" fontWeight={"bold"}>
                            We're Sorry!
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="h5">
                            It looks like the page you were looking for cannot be found. 
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="large"
                            value={"professional"}
                            sx={{
                              ":hover": {
                                bgcolor: "primary.main",
                                variant:"contained",
                                color:"#121212"
                              }
                            }}
                            onClick={() => navigate("/")}
                        >
                            <Typography variant="h4">
                                Let's head back home!
                            </Typography>
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}