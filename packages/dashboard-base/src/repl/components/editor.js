import React, { Component } from "react"
import Ace from "brace"

import "./editor.css"
import queryFunctions from "../query-functions"

require("brace/mode/javascript")
require("brace/ext/language_tools")

const faunaLangCompleter = {
  getCompletions(editor, session, pos, prefix, callback) {
    const previousToken = session.getTokenAt(pos.row, pos.column - prefix.length - 1) || {}
    if (previousToken.value !== "q") {
      callback(null, [])
      return
    }

    callback(null, queryFunctions
      .filter(fun => fun.includes(prefix))
      .map(fun => ({
        name: fun,
        value: fun,
        score: 0,
        meta: "query function"
      }))
    )
  }
}

export default class ReplEditor extends Component {

  static Mode = {
    CODE_EDITOR: "editor code-editor",
    TEXT_FIELD: "editor form-field text-field",
    TEXT_AREA: "editor form-field text-area"
  }

  componentDidMount() {
    const {
      name,
      value,
      shortcuts = [],
      mode = ReplEditor.Mode.CODE_EDITOR
    } = this.props

    this.editor = Ace.edit(name)
    this.editor.$blockScrolling = Infinity // Disable warning
    this.editor.setValue(value)
    this.editor.setFontSize(12)
    this.editor.setOption("highlightActiveLine", true)
    this.editor.setOption("enableBasicAutocompletion", true)
    this.editor.setOption("enableLiveAutocompletion", true)
    this.editor.setOption("showPrintMargin", false)
    this.editor.getSession().setMode("ace/mode/javascript")
    this.editor.getSession().setTabSize(2)
    this.editor.getSession().setUseWorker(false)
    this.editor.on("change", this.onChange.bind(this))
    this.editor.on("changeSelection", this.onSelect.bind(this))
    this.editor.renderer.setShowGutter(mode === ReplEditor.Mode.CODE_EDITOR)

    this.editor.completers = [
      Ace.acequire("ace/ext/language_tools").textCompleter,
      faunaLangCompleter
    ]

    this.editor.commands.removeCommand("find")
    shortcuts.forEach(shortcut => this.editor.commands.addCommand(shortcut))

    this.editor.focus()
  }

  componentWillReceiveProps(nextProps) {
    if (this.editor.getValue() !== nextProps.value) {
      this.editor.setValue(nextProps.value)
    }
  }

  onChange() {
    if (this.props.onChange) {
      this.props.onChange(this.editor.getValue())
    }
  }

  onSelect() {
    if (this.props.onSelect) {
      this.props.onSelect(this.editor.getSelectedText())
    }
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    return <div
      id={this.props.name}
      className={this.props.mode || ReplEditor.Mode.CODE_EDITOR}>
    </div>
  }
}
