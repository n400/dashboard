/* eslint-disable */

import React from "react"
import { Nav } from "office-ui-fabric-react/lib/Nav"
import { css } from "office-ui-fabric-react" // FIXME: remove

import "./custom-nav.css"

const _indentationSize = 14
const _indentWithExpandButton = 28
const _indentNoExpandButton = 20

// Custom Nav to add chevron icon to all sub levels and control selected items
export default class CustomNav extends Nav {
  _renderCompositeLink(link, linkIndex, nestingLevel) {
    const isLinkSelected = _isLinkSelected(link, this.props.selectedKey)
    const paddingBefore = (_indentationSize * nestingLevel).toString(10) + "px"

    return <div key={link.key || linkIndex}
        className={css("custom-nav-compositeLink", {"is-expanded": link.isExpanded, "is-selected": isLinkSelected })}>
          {((nestingLevel > 0 && link.links && link.links.length > 0) ?
            <button
              style={{paddingLeft: paddingBefore}}
              className="ms-Nav-chevronButton ms-Nav-chevronButton--link"
              onClick={this._onLinkExpandClicked.bind(this, link)}
              title={(link.isExpanded ? this.props.expandedStateText : this.props.collapsedStateText)}>
              <i className="ms-Nav-chevron ms-Icon ms-Icon--ChevronDown"></i>
            </button> : null
          )}
          {!!link.onClick ?
            this._renderButtonLink(link, linkIndex) :
            this._renderAnchorLink(link, linkIndex, nestingLevel)}
      </div>
  }

  _renderAnchorLink(link, linkIndex, nestingLevel) {
    // Determine the appropriate padding to add before this link.
    // In RTL, the "before" padding will go on the right instead of the left.
    const paddingBefore = (_indentationSize * (nestingLevel > 0 ? nestingLevel : 0) +
      (this._hasExpandButton ? _indentWithExpandButton : _indentNoExpandButton)).toString(10) + "px";

    return (
        <a
          className={ css("ms-Nav-link") }
          style={ { paddingLeft: nestingLevel > 0 ? paddingBefore : _indentationSize } }
          href={ link.url || "javascript:" }
          onClick={ this._onNavAnchorLinkClicked.bind(this, link) }
          aria-label={ link.ariaLabel }
          title={ link.title || link.name }
          target={ link.target }
        >
         { link.iconClassName && <i className={ css("ms-Icon", "ms-Nav-IconLink", link.iconClassName) }></i> }
         { this.props.onRenderLink(link)}
        </a>
    );
  }

  _onLinkExpandClicked(link, ev) {
    if (this.props.onExpand) {
      const res = this.props.onExpand(link) || Promise.resolve()
      res.then(() => this.setState({ isLinkExpandStateChanged: true }))

      link.isExpanded = !link.isExpanded
      ev.preventDefault()
      ev.stopPropagation()
      return
    }

    super._onLinkExpandClicked(link, ev)
  }
}

// https://github.com/OfficeDev/office-ui-fabric-react/blob/v0.69.0-hotfix1/src/components/Nav/Nav.tsx#L210
let _urlResolver;
function _isLinkSelected(link: INavLink, selectedKey: string): boolean {
  if (selectedKey && link.key === selectedKey) {
    return true;
  }

  // resolve is not supported for ssr
  if (typeof(window) === "undefined") {
    return false;
  }

  if (!link.url) {
    return false;
  }

  _urlResolver = _urlResolver || document.createElement("a");

  _urlResolver.href = link.url || "";
  const target: string = _urlResolver.href;

  if (location.protocol + "//" + location.host + location.pathname === target) {
    return true;
  }

  if (location.href === target) {
    return true;
  }

  if (location.hash) {
    // Match the hash to the url.
    if (location.hash === link.url) {
      return true;
    }

    // Match a rebased url. (e.g. #foo becomes http://hostname/foo)
    _urlResolver.href = location.hash.substring(1);

    return _urlResolver.href === target;
  }

  return false;
}
