import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Box, Divider, Grid, Stack, Toolbar, Typography } from "@mui/material";
import Header from "../components/Header";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import * as userAPI from "../api/user.js";
import * as commissionAPI from "../api/commission.js";
import ToMakeLog from "../components/Commissions/ToMakeLog";
import BoughtLog from "../components/Commissions/BoughtLog";
import CommissionsSwitch from "../components/Commissions/CommissionsSwitch";
import CommissionRequirement from "../components/Commissions/CommissionRequirement";
import * as professionalArtistAPI from "../api/professionalArtistInfo.js";
import SideBar from "../components/Explore/SideBar";
import ExploreAccounts from "../components/Explore/ExploreAccounts";

function CommissionLog(props) {
  const userId = localStorage.getItem("user-id");
  const token = localStorage.getItem("user-token");
  const navigate = useNavigate();
  const [value, setValue] = useState("Commissioned");
  const [user, setUser] = useState(null);
  const [commissionRules, setCommissionRules] = useState("");
  const [commissionsExist, SetCommissionsExist] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [enableEdit, setEnableEdit] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (userId && token) {
          let user = await userAPI.getUser(token, userId);
          if (user.data.role === "PROFESSIONALY") {
            let result = await professionalArtistAPI.getInfo(token, userId);
            setCommissionRules(result.data.commission_rules);
            setEnabled(result.data.accepting_commissions);
            setValue(
              user.data.role === "PROFESSIONALY" &&
                result.data.accepting_commissions
                ? "Commissions to Fulfill"
                : "Commissioned"
            );

            const numCommissions = await commissionAPI.getCommissionByFilter(token, {
              artist_id: userId,
            });
            SetCommissionsExist(numCommissions.data.length === 0 ? false : true)
          } else {
            setValue("Commissioned");
          }

          setUser(user.data);
        } else {
          navigate("/forbidden", { replace: true });
        }
      } catch (err) {
        console.log(err);
        navigate("/forbidden", { replace: true });
      }
    })();
  }, []);

  let handleOnEdit = () => {
    setEnableEdit(!enableEdit);
  };

  let handleCommissionRulesOnEdit = (event) => {
    setCommissionRules(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  // TODO: Add api call to update commission requirement.
  const handleOnSet = async () => {
    handleOnEdit();
    await professionalArtistAPI.updateInfo(token, {
      id: userId,
      commission_rules: commissionRules,
    });
  };

  const setTabs = () => {
    return (enabled || commissionsExist) && user.role === "PROFESSIONALY" ? (
      <Tabs value={value} onChange={handleTabChange} centered>
        <Tab value="Commissions to Fulfill" label="Commissions to Fulfill" />
        <Tab value="Commissioned" label="Commissioned" />
      </Tabs>
    ) : (
      <Tabs value={value} onChange={handleTabChange} centered>
        <Tab value="Commissioned" label="Commissioned" />
      </Tabs>
    );
  };

  return (
    <>
      <Header />
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        height={"100vh"}
      >
        <Toolbar />
        <SideBar />
        <Box component="main" sx={{ flexGrow: 1, p:1, ml:(-4) }} alignItems="flex-start" justifyContent="flex-start">
          <Grid
            container
            direction="column"
            justifyContent="flex-start"
            alignItems="flex-start"
          >
            <Toolbar />
            <Grid item xs={9.74}>
              <>
                {user ? (
                  <>
                    {user.role === "PROFESSIONALY" ? (
                      <Box marginBottom={"1em"}>
                        <Box alignContent={"center"} justifyContent={"center"}>
                          <Typography
                            align={"center"}
                            variant={"h4"}
                            color={"#ffffff"}
                          >
                            Commission Details
                          </Typography>
                          <Divider />
                        </Box>
                        <Grid
                          container
                          direction="column"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Grid container item>
                            <Grid
                             container
                             direction="row"
                             justifyContent="flex-start"
                             alignItems="flex-start"
                            >
                              <Grid item xs={6}>
                                <Typography variant={"h6"}>
                                  Toggle to set commission status
                                </Typography>
                              </Grid>
                              <Grid item>
                                <CommissionsSwitch
                                  open={enabled}
                                  setOpen={setEnabled}
                                  setValue={setValue}
                                />
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid item>
                            {enabled ? (
                              <CommissionRequirement
                                commissionRules={commissionRules}
                                handleCommissionRulesOnEdit={
                                  handleCommissionRulesOnEdit
                                }
                                enableEdit={enableEdit}
                                handleOnEdit={handleOnEdit}
                                handleOnSet={handleOnSet}
                              />
                            ) : null}
                          </Grid>
                        </Grid>
                      </Box>
                    ) : (
                      <></>
                    )}

                    <Box
                      sx={{
                        justifyContent: "center",
                        width: "100%",
                        bgcolor: "background.paper",
                      }}
                    >
                      <Box alignContent={"center"} justifyContent={"center"}>
                        <Typography
                          align={"center"}
                          variant={"h4"}
                          color={"#ffffff"}
                        >
                          Your Commissions
                        </Typography>
                        <Divider />
                      </Box>
                      {setTabs()}
                    </Box>
                    {(enabled || commissionsExist) && value === "Commissions to Fulfill" && (
                      <Box justifyContent={"center"} py={2}>
                        <ToMakeLog user={user} />
                      </Box>
                    )}
                    {value === "Commissioned" && (
                      <Box justifyContent={"center"} py={2}>
                        <BoughtLog user={user} />
                      </Box>
                    )}
                  </>
                ) : null}
              </>
            </Grid>
          </Grid>
        </Box>
        <Divider orientation="vertical" flexItem />
        <ExploreAccounts/>
      </Stack>
    </>
  );
}

export default CommissionLog;
