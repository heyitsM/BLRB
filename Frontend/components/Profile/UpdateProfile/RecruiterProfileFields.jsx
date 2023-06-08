import { Grid, Typography } from "@mui/material";

export default function RecruiterProfileFields(props) {
    const {
        CustomTextField,
        company,
        setCompany, 
        position, 
        setPosition
    } = props;
    return (
        <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="stretch"
            spacing={1.5}
        >   
            <Grid alignSelf={"center"} item>
                <Typography variant="h6">
                    Company Information
                </Typography>
            </Grid>
            <Grid item>
                <CustomTextField
                    required
                    id="standard-required"
                    label="Company"
                    data-testid="company-info-field"
                    onChange={(e) => setCompany(e.target.value)}
                    value={company}
                    fullWidth
                />
            </Grid>
            <Grid item>
                <CustomTextField
                    required
                    id="standard-required"
                    label="Position"
                    data-testid="position-field"
                    onChange={(e) => setPosition(e.target.value)}
                    value={position}
                    fullWidth
                />
            </Grid>
        </Grid>
    )
}