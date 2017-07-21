import React, { Component } from "react"
import { Dropdown } from "office-ui-fabric-react/lib/Dropdown"
import { Label } from "office-ui-fabric-react/lib/Label"
import { CommandButton } from "office-ui-fabric-react/lib/Button"
import { TagPicker } from "office-ui-fabric-react/lib/components/pickers/TagPicker/TagPicker"
import { TagItem } from "office-ui-fabric-react/lib/components/pickers/TagPicker/TagItem"

import "./fields-form.css"

const availableTransformations = [
  { key: "", text: "" },
  { key: "casefold", text: "casefold" }
]

export default class FieldsForm extends Component {

  addField(e) {
    e.preventDefault()
    this.props.addField()
  }

  render() {
    return <div className="fields-form">
      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm12">
          <Label>{this.props.title}</Label>
        </div>
      </div>
      {this.renderFields()}
      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-u-sm12">
          <p className="ms-TextField-description">
            Each value will be used as a path segment for the field definition. For example:
            "data" "name" will be become {'{ "field": ["data", "name"] }'}
          </p>
          {this.props.children}
          <CommandButton
            type="button"
            onClick={this.addField.bind(this)}
            iconProps={{ iconName: "Add" }}>
            Add field
          </CommandButton>
        </div>
      </div>
    </div>
  }

  renderFields() {
    return this.props.fields.map((each, fieldIndex) => {
      // Must be a unique per by TagPicker
      const tagsKey = `${fieldIndex}-${each.field.join(".")}`

      return <div className="ms-Grid-row" key={fieldIndex}>
        <div className="ms-Grid-col ms-u-sm9">
          <TagPicker
            getTextFromItem={tag => tag.name}
            onRenderItem={this.renderTag.bind(this)}
            onResolveSuggestions={this.resolveSuggestions(tagsKey)}
            onChange={this.updateField(fieldIndex, each)}
            defaultSelectedItems={this.buildTags(tagsKey, each)} />
        </div>
        <div className="ms-Grid-col ms-u-sm3 transform-dropdown">
          <Dropdown
            onChanged={this.updateTransform(fieldIndex, each)}
            options={availableTransformations}
            selectedKey={each.transform || ""} />
        </div>
      </div>
    })
  }

  renderTag(props) {
    // Must set the key so React knows when to re-render a tag
    return <TagItem {...props} key={props.item.key}>{props.item.name}</TagItem>
  }

  resolveSuggestions(key) {
    return filter => {
      if (filter === "") return []

      const suggestions = {}
      this.props.knownFields.forEach(each => {
        each.field.forEach((segment, segIndex) => {
          if (segment.startsWith(filter) && segment !== filter)
            suggestions[segment] = {
              key: `${key}-${segIndex}-${segment}`,
              name: segment
            }
        })
      })

      return Object
        .values(suggestions)
        .concat({ key: `${key}-new-tag`, name: filter })
    }
  }

  buildTags(key, fieldObj) {
    return fieldObj.field.map((segment, segIndex) => ({
      key: `${key}-${segIndex}-${segment}`,
      name: segment
    }))
  }

  updateField(index, fieldObj) {
    return tags => {
      this.props.updateField(
        index,
        tags.map(tag => tag.name),
        fieldObj.transform
      )
    }
  }

  updateTransform(index, fieldObj) {
    return transformation => {
      this.props.updateField(
        index,
        fieldObj.field,
        transformation.key || null
      )
    }
  }

}
