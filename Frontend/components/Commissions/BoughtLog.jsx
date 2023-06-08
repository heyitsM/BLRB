import { useState, useEffect } from "react";
import { Box } from "@mui/material";
import * as React from "react";

import { DataGrid } from "@mui/x-data-grid";
import CommissionDialog from "./CommissionDialog";
import * as commissionAPI from "../../api/commission.js";
import * as userAPI from "../../api/user.js";

function BoughtLog(props) {
  const { user } = props;
  const [bought, setBought] = useState([]);
  const [artistTarget, setArtistTarget] = useState({});
  const [commissionerTarget, setCommissionerTarget] = useState({});
  const [commissionTarget, setCommissionTarget] = useState({});
  const token = localStorage.getItem("user-token");

  useEffect(() => {
    (async () => {
      // get list of commissions
      const data = await commissionAPI.getCommissionByFilter(token, {
        commissioner_id: user.id,
      });
      let commissionsArray = data.data;
      let tempBought = [];
      for (const commission of commissionsArray) {
        let tempBoughtElem = {};
        tempBoughtElem.id = commission.id;

        // find purchaser
        tempBoughtElem.commissioner = (
          await userAPI.getUser(token, commission.commissioner_id)
        ).data;

        // add artist
        tempBoughtElem.artist = (
          await userAPI.getUser(token, commission.artist_id)
        ).data;

        // add commissions
        tempBoughtElem.commission = commission;
        tempBought.push(tempBoughtElem);
      }
      setBought(tempBought);
    })();
  }, []);

  const columns = [
    {
      field: "artist",
      headerName: "Artist",
      editable: false,
      width: 100,
      valueGetter: (params) => {
        return `${params.row.artist.username || ""}`;
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
      width: 300,
      valueGetter: (params) => {
        let value;
        if (params.row.commission.status === "REQUESTED") {
          value = "Wait for artist to set price";
        } else if (params.row.commission.status === "PENDING") {
          value = "Click to accept/deny price";
        } else if (params.row.commission.status === "ACCEPTED") {
          value = "Click to pay";
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
    // get list of commissions
    const data = await commissionAPI.getCommissionByFilter(token, {
      commissioner_id: user.id,
    });
    let commissionsArray = data.data;
    let tempBought = [];
    for (const commission of commissionsArray) {
      let tempBoughtElem = {};
      tempBoughtElem.id = commission.id;

      // find purchaser
      tempBoughtElem.commissioner = (
        await userAPI.getUser(token, commission.commissioner_id)
      ).data;

      // add artist
      tempBoughtElem.artist = (
        await userAPI.getUser(token, commission.artist_id)
      ).data;

      // add commissions
      tempBoughtElem.commission = commission;
      tempBought.push(tempBoughtElem);
    }
    setBought(tempBought);
  };

  const handleClose = async () => {
    await reloadCommissionsForm();
    setOpen(false);
  };

  const options = {
    filterType: "dropdown",
    responsive: "scroll"
  };

  return (
    <>
      <Box sx={{ width: "100%" }}>
        <DataGrid
          autoHeight
          rows={bought}
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
          enableCommissionerView={true}
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

export default BoughtLog;
