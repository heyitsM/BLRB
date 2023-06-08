import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import * as React from "react";

import { DataGrid } from "@mui/x-data-grid";
import CommissionDialog from "./CommissionDialog";
import * as commissionAPI from "../../api/commission.js";
import * as userAPI from "../../api/user.js";

function ToMakeLog(props) {
  const { user } = props;
  const [toMake, setToMake] = useState([]);
  const [artistTarget, setArtistTarget] = useState({});
  const token = localStorage.getItem("user-token");
  const [commissionerTarget, setCommissionerTarget] = useState({});
  const [commissionTarget, setCommissionTarget] = useState({});

  useEffect(() => {
    (async () => {
      const data = await commissionAPI.getCommissionByFilter(token, {
        artist_id: user.id,
      });
      let commissionsArray = data.data;
      let tempToMake = [];
      for (const commission of commissionsArray) {
        let tempToMakeElem = {};
        tempToMakeElem.id = commission.id;
        tempToMakeElem.commissioner = (
          await userAPI.getUser(token, commission.commissioner_id)
        ).data;
        tempToMakeElem.artist = (
          await userAPI.getUser(token, commission.artist_id)
        ).data;
        tempToMakeElem.commission = commission;
        tempToMake.push(tempToMakeElem);
      }
      setToMake(tempToMake);
    })();
  }, []);

  const columns = [
    {
      field: "name",
      headerName: "Commissioner",
      editable: false,
      width: 150,
      valueGetter: (params) => {
        return `${(params.row.commissioner.first_name + " " + params.row.commissioner.last_name)|| ""}`;
      },
    },

    {
      field: "email",
      headerName: "Email",
      width: 160,
      valueGetter: (params) => {
        return `${params.row.commissioner.email || ""}`;
      },
    },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      width: 100,
      valueGetter: (params) => {
        if (params.row.commission.status === "PAID") {
          return "IN PROGRESS";
        } else {
          return `${params.row.commission.status || ""}`;
        }
      },
    },
    {
      field: "price",
      headerName: "Price",
      sortable: true,
      width: 150,
      valueGetter: (params) => {
        return `${
          params.row.commission.price
            ? "$" + parseFloat(params.row.commission.price).toFixed(2)
            : "Price not set"
        }`;
      },
    },
    {
      field: "payment",
      headerName: "Payment",
      sortable: true,
      valueGetter: (params) => {
        let value;
        if (params.row.commission.status === "REQUESTED") {
          value = "Click to set price";
        } else if (params.row.commission.status === "PENDING") {
          value = "Awaiting response";
        } else if (params.row.commission.status === "ACCEPTED") {
          value = "Awaiting payment";
        } else if (params.row.commission.status === "REJECTED") {
          value = "Commission rejected";
        } else if (
          params.row.commission.status === "PAID" ||
          params.row.commission.status === "COMPLETED"
        ) {
          value = "Commission paid";
        }
        return value;
      },
      flex:1
    },
  ];

  const [open, setOpen] = useState(false);

  const handleClickOpen = (event) => {
    setCommissionTarget(event.row.commission);
    setArtistTarget(event.row.artist);
    setCommissionerTarget(event.row.commissioner);
    setOpen(true);
  };

  const reloadCommissionsForm = async () => {
    const data = await commissionAPI.getCommissionByFilter(token, {
      artist_id: user.id,
    });
    let commissionsArray = data.data;
    let tempToMake = [];
    for (const commission of commissionsArray) {
      let tempToMakeElem = {};
      tempToMakeElem.id = commission.id;
      tempToMakeElem.commissioner = (
        await userAPI.getUser(token, commission.commissioner_id)
      ).data;
      tempToMakeElem.artist = (
        await userAPI.getUser(token, commission.artist_id)
      ).data;
      tempToMakeElem.commission = commission;
      tempToMake.push(tempToMakeElem);
    }
    setToMake(tempToMake);
  }

  const handleClose = async () => {
    await reloadCommissionsForm();
    setOpen(false);
  };

  return (
    <>
      <Box sx={{ width: "100%"}}>
        <DataGrid
          autoHeight
          rows={toMake}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 5,
              },
            },
          }}
          pageSizeOptions={[5]}
          disableRowSelectionOnClick
          onRowClick={handleClickOpen}
        />
        <CommissionDialog
          enableCommissionerView={false}
          artist={artistTarget}
          commissioner={commissionerTarget}
          commission={commissionTarget}
          open={open}
          setOpen={setOpen}
          handleClose={handleClose}
        />
      </Box>
    </>
  );
}

export default ToMakeLog;
