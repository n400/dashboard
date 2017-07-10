import React from "react"
import { Pivot, PivotItem } from "office-ui-fabric-react/lib/Pivot"

import IndexInfo from "./index-info"
import IndexDelete from "./index-delete"
import IndexBrowser from "./index-browser"

export default () => {
  return <Pivot>
    <PivotItem linkText="Index Details" itemKey="index-info">
      <IndexInfo />
    </PivotItem>
    <PivotItem linkText="Browse Index" itemKey="index-browser">
      <IndexBrowser />
    </PivotItem>
    <PivotItem linkText="Delete" itemKey="index-delete">
      <IndexDelete />
    </PivotItem>
  </Pivot>
}
