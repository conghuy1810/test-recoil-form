import React from "react";

import { Grid } from "@mui/material";


import { generateQuoteMap } from "./mockData";

import Board from "./board/Board";

export default function App() {
  const data = {
    medium: generateQuoteMap(100),
    large: generateQuoteMap(500)
  };
  console.log(data.medium)
  return (
    <>
      <Grid container spacing={1}>
        <Grid size={12}>
          <Grid>
            <Grid>
              <h2>React DnD Testing</h2>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Board initial={data.medium} withScrollableColumns />
    </>
  );
}
