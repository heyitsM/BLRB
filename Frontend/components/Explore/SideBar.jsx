import { useNavigate } from "react-router-dom";
import { Box, Button, Drawer, Stack, Toolbar } from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import MuiDrawer from '@mui/material/Drawer';
import { styled, useTheme } from '@mui/material/styles';
import FaceIcon from "@mui/icons-material/Face";
import GradingIcon from "@mui/icons-material/Grading";

const drawerWidth = window.innerWidth / 5;

const DrawerMini = styled(MuiDrawer)(
  ({ theme }) => ({
    width: 30,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
     '& .MuiDrawer-paper': closedMixin(theme)
  }),
);

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});


export default function SideBar(props) {
  const navigate = useNavigate();
  const role = localStorage.getItem("user-role")

  const drawerMax = (
    <>
      <Toolbar />
      <Box sx={{ margin:2, overflow: 'auto' }}>
        <Stack
          direction="column"
          justifyContent="flex-start"
          alignItems="flex-start"
          padding={2}
          spacing={2}
        >
          <Button
            sx={{ fontWeight:"700", fontSize:"16px"}}
            data-testid="explore-button-wide"
            onClick={() => {
              navigate("/explore");
            }}
          >
            <ExploreIcon fontSize="large" sx={{ marginRight:"5px"}} />
            {"  Explore"}
          </Button>
          <Button
            sx={{ fontWeight:"700", fontSize:"16px"}}
            data-testid="profile-button-wide"
            onClick={() => {
              navigate("/my-profile");
            }}
          >
            <FaceIcon fontSize="large" sx={{ marginRight:"5px"}}/>
            {"  Profile"}
          </Button>
            {role === "RECRUITER" ? null :
              <Button
              sx={{ fontWeight:"700", fontSize:"16px"}}
              data-testid="commission-log-button-wide"
              onClick={() => {
                navigate("/commission-log");
              }}
            >
              <GradingIcon fontSize="large" sx={{ marginRight:"5px"}} />
              {"  Commissions"}
            </Button>
            }
        </Stack>
      </Box>
    </>
  )

  const drawerMini = (
    <>
      <Toolbar />
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="flex-start"
        mt={"2em"}
        spacing={2}
      >
        <Button
          sx={{ fontWeight:"700", fontSize:"16px"}}
          data-testid="explore-button-mini"
          onClick={() => {
            navigate("/explore");
          }}
        >
          <ExploreIcon fontSize="large"/>
        </Button>
        <Button
          sx={{ fontWeight:"700", fontSize:"16px"}}
          data-testid="profile-button-mini"
          onClick={() => {
            navigate("/my-profile");
          }}
        >
          <FaceIcon fontSize="large"/>
        </Button>
        {role === "RECRUITER" ? null :
          <Button
            sx={{ fontWeight:"700", fontSize:"16px"}}
            data-testid="commission-log-button-mini"
            onClick={() => {
              navigate("/commission-log");
            }}
          >
            <GradingIcon fontSize="large"/>
          </Button> 
        }
      </Stack>
    </>
  )

  return (
    <Box
      display={"flex"}
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      <DrawerMini
        variant="permanent"
      >
        {drawerMini}
      </DrawerMini>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth }
        }}
        open
      >
        {drawerMax}
      </Drawer>
    </Box>
  );
}
