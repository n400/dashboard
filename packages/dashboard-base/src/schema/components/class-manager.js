import React from "react"
import { Pivot, PivotItem } from "office-ui-fabric-react/lib/Pivot"

import ClassInfo from "./class-info"
import ClassBrowser from "./class-browser"
import ClassInstance from "./class-instance"
import ClassDelete from "./class-delete"

export default () => {
  return <Pivot>
    <PivotItem linkText="Class Details" itemKey="class-info">
      <ClassInfo />
    </PivotItem>
    <PivotItem linkText="Browse Class" itemKey="class-browse">
      <ClassBrowser />
    </PivotItem>
    <PivotItem linkText="Create Instance" itemKey="class-instance">
      <ClassInstance />
    </PivotItem>
    <PivotItem linkText="Delete" itemKey="class-delete">
      <ClassDelete />
    </PivotItem>
  </Pivot>
}
