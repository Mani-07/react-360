/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Text
 * @flow
 */

// FIXME All source file should be linted and typed.
/* eslint-disable */

const ColorPropType = require('ColorPropType');
const EdgeInsetsPropType = require('EdgeInsetsPropType');
const NativeMethodsMixin = require('NativeMethodsMixin');
const React = require('React');
const PropTypes = require('prop-types');
const ReactNativeViewAttributes = require('ReactNativeViewAttributes');
const StyleSheetPropType = require('StyleSheetPropType');
const TextStylePropTypes = require('TextStylePropTypes');
const Touchable = require('Touchable');
const UIManager = require('UIManager');

const createReactClass = require('create-react-class');
const createReactNativeComponentClass = require('createReactNativeComponentClass');
const mergeFast = require('mergeFast');
const processColor = require('processColor');

const stylePropType = StyleSheetPropType(TextStylePropTypes);

const viewConfig = {
  validAttributes: mergeFast(ReactNativeViewAttributes.UIView, {
    isHighlighted: true,
    numberOfLines: true,
    ellipsizeMode: true,
    allowFontScaling: true,
    disabled: true,
    selectable: true,
    selectionColor: true,
    adjustsFontSizeToFit: true,
    minimumFontScale: true,
    textBreakStrategy: true,
    isOnLayer: true,
  }),
  uiViewClassName: 'RCTText',
};

/**
 * A React component for displaying text.
 *
 * See https://facebook.github.io/react-native/docs/text.html
 */

// $FlowFixMe(>=0.41.0)
const Text = createReactClass({
  displayName: 'Text',
  propTypes: {
    /**
     * When `numberOfLines` is set, this prop defines how text will be
     * truncated.
     *
     * See https://facebook.github.io/react-native/docs/text.html#ellipsizemode
     */
    ellipsizeMode: PropTypes.oneOf(['head', 'middle', 'tail', 'clip']),
    /**
     * Used to truncate the text with an ellipsis.
     *
     * See https://facebook.github.io/react-native/docs/text.html#numberoflines
     */
    numberOfLines: PropTypes.number,
    /**
     * Set text break strategy on Android.
     *
     * See https://facebook.github.io/react-native/docs/text.html#textbreakstrategy
     */
    textBreakStrategy: PropTypes.oneOf(['simple', 'highQuality', 'balanced']),
    /**
     * Invoked on mount and layout changes.
     *
     * See https://facebook.github.io/react-native/docs/text.html#onlayout
     */
    onLayout: PropTypes.func,
    /**
     * This function is called on press.
     *
     * See https://facebook.github.io/react-native/docs/text.html#onpress
     */
    onPress: PropTypes.func,
    /**
     * This function is called on long press.
     *
     * See https://facebook.github.io/react-native/docs/text.html#onlongpress
     */
    onLongPress: PropTypes.func,
    /**
     * Defines how far your touch may move off of the button, before
     * deactivating the button.
     *
     * See https://facebook.github.io/react-native/docs/text.html#pressretentionoffset
     */
    pressRetentionOffset: EdgeInsetsPropType,
    /**
     * Lets the user select text.
     *
     * See https://facebook.github.io/react-native/docs/text.html#selectable
     */
    selectable: PropTypes.bool,
    /**
     * The highlight color of the text.
     *
     * See https://facebook.github.io/react-native/docs/text.html#selectioncolor
     */
    selectionColor: ColorPropType,
    /**
     * When `true`, no visual change is made when text is pressed down.
     *
     * See https://facebook.github.io/react-native/docs/text.html#supperhighlighting
     */
    suppressHighlighting: PropTypes.bool,
    style: stylePropType,
    /**
     * Used to locate this view in end-to-end tests.
     *
     * See https://facebook.github.io/react-native/docs/text.html#testid
     */
    testID: PropTypes.string,
    /**
     * Used to locate this view from native code.
     *
     * See https://facebook.github.io/react-native/docs/text.html#nativeid
     */
    nativeID: PropTypes.string,
    /**
     * Whether fonts should scale to respect Text Size accessibility settings.
     *
     * See https://facebook.github.io/react-native/docs/text.html#allowfontscaling
     */
    allowFontScaling: PropTypes.bool,
    /**
     * Indicates whether the view is an accessibility element.
     *
     * See https://facebook.github.io/react-native/docs/text.html#accessible
     */
    accessible: PropTypes.bool,
    /**
     * Whether font should be scaled down automatically.
     *
     * See https://facebook.github.io/react-native/docs/text.html#adjustsfontsizetofit
     */
    adjustsFontSizeToFit: PropTypes.bool,
    /**
     * Smallest possible scale a font can reach.
     *
     * See https://facebook.github.io/react-native/docs/text.html#minimumfontscale
     */
    minimumFontScale: PropTypes.number,
    /**
     * Specifies the disabled state of the text view for testing purposes.
     *
     * See https://facebook.github.io/react-native/docs/text.html#disabled
     */
    disabled: PropTypes.bool,
    /**
     * This function is called on entering the text.
     *
     * e.g., `onEnter={this.enterText}>`
     */
    onEnter: PropTypes.func,
    /**
     * This function is called on exiting the text.
     *
     * e.g., `onExit={this.exitText}>`
     */
    onExit: PropTypes.func,
    /**
     * This function is called when input is sent to the text.
     *
     * e.g., `onInput={this.inputStuff}>`
     */
    onInput: PropTypes.func,
  },
  getDefaultProps(): Object {
    return {
      accessible: true,
      allowFontScaling: true,
      ellipsizeMode: 'tail',
      isOnLayer: false,
    };
  },
  getInitialState: function(): Object {
    return mergeFast(Touchable.Mixin.touchableGetInitialState(), {
      isHighlighted: false,
    });
  },
  mixins: [NativeMethodsMixin],
  viewConfig: viewConfig,
  getChildContext(): Object {
    return {isInAParentText: true};
  },
  childContextTypes: {
    isInAParentText: PropTypes.bool,
  },
  contextTypes: {
    isInAParentText: PropTypes.bool,
    isOnLayer: PropTypes.bool,
  },
  /**
   * Only assigned if touch is needed.
   */
  _handlers: (null: ?Object),
  _hasPressHandler(): boolean {
    return !!this.props.onPress || !!this.props.onLongPress;
  },
  /**
   * These are assigned lazily the first time the responder is set to make plain
   * text nodes as cheap as possible.
   */
  touchableHandleActivePressIn: (null: ?Function),
  touchableHandleActivePressOut: (null: ?Function),
  touchableHandlePress: (null: ?Function),
  touchableHandleLongPress: (null: ?Function),
  touchableGetPressRectOffset: (null: ?Function),
  render(): React.Element<any> {
    let newProps = this.props;
    if (this.props.onStartShouldSetResponder || this._hasPressHandler()) {
      if (!this._handlers) {
        this._handlers = {
          onStartShouldSetResponder: (): boolean => {
            const shouldSetFromProps =
              this.props.onStartShouldSetResponder &&
              // $FlowFixMe(>=0.41.0)
              this.props.onStartShouldSetResponder();
            const setResponder = shouldSetFromProps || this._hasPressHandler();
            if (setResponder && !this.touchableHandleActivePressIn) {
              // Attach and bind all the other handlers only the first time a touch
              // actually happens.
              for (const key in Touchable.Mixin) {
                if (typeof Touchable.Mixin[key] === 'function') {
                  (this: any)[key] = Touchable.Mixin[key].bind(this);
                }
              }
              this.touchableHandleActivePressIn = () => {
                if (
                  this.props.suppressHighlighting ||
                  !this._hasPressHandler()
                ) {
                  return;
                }
                this.setState({
                  isHighlighted: true,
                });
              };

              this.touchableHandleActivePressOut = () => {
                if (
                  this.props.suppressHighlighting ||
                  !this._hasPressHandler()
                ) {
                  return;
                }
                this.setState({
                  isHighlighted: false,
                });
              };

              // $FlowFixMe (via postinstall.shenangians) this really ought to be fixed upstream
              this.touchableHandlePress = (e: SyntheticEvent) => {
                this.props.onPress && this.props.onPress(e);
              };

              // $FlowFixMe (via postinstall.shenangians) this really ought to be fixed upstream
              this.touchableHandleLongPress = (e: SyntheticEvent) => {
                this.props.onLongPress && this.props.onLongPress(e);
              };

              this.touchableGetPressRectOffset = function(): RectOffset {
                return this.props.pressRetentionOffset || PRESS_RECT_OFFSET;
              };
            }
            // $FlowFixMe(>=0.41.0)
            return setResponder;
          },
          // $FlowFixMe (via postinstall.shenangians) this really ought to be fixed upstream
          onResponderGrant: function(e: SyntheticEvent, dispatchID: string) {
            // $FlowFixMe(>=0.41.0)
            this.touchableHandleResponderGrant(e, dispatchID);
            this.props.onResponderGrant &&
              // $FlowFixMe(>=0.41.0)
              this.props.onResponderGrant.apply(this, arguments);
          }.bind(this),
          // $FlowFixMe (via postinstall.shenangians) this really ought to be fixed upstream
          onResponderMove: function(e: SyntheticEvent) {
            // $FlowFixMe(>=0.41.0)
            this.touchableHandleResponderMove(e);
            this.props.onResponderMove &&
              // $FlowFixMe(>=0.41.0)
              this.props.onResponderMove.apply(this, arguments);
          }.bind(this),
          // $FlowFixMe (via postinstall.shenangians) this really ought to be fixed upstream
          onResponderRelease: function(e: SyntheticEvent) {
            // $FlowFixMe(>=0.41.0)
            this.touchableHandleResponderRelease(e);
            this.props.onResponderRelease &&
              // $FlowFixMe(>=0.41.0)
              this.props.onResponderRelease.apply(this, arguments);
          }.bind(this),
          // $FlowFixMe (via postinstall.shenangians) this really ought to be fixed upstream
          onResponderTerminate: function(e: SyntheticEvent) {
            // $FlowFixMe(>=0.41.0)
            this.touchableHandleResponderTerminate(e);
            this.props.onResponderTerminate &&
              // $FlowFixMe(>=0.41.0)
              this.props.onResponderTerminate.apply(this, arguments);
          }.bind(this),
          onResponderTerminationRequest: function(): boolean {
            // Allow touchable or props.onResponderTerminationRequest to deny
            // the request
            // $FlowFixMe(>=0.41.0)
            var allowTermination = this.touchableHandleResponderTerminationRequest();
            if (allowTermination && this.props.onResponderTerminationRequest) {
              // $FlowFixMe(>=0.41.0)
              allowTermination = this.props.onResponderTerminationRequest.apply(
                this,
                arguments,
              );
            }
            return allowTermination;
          }.bind(this),
        };
      }
      newProps = {
        ...this.props,
        ...this._handlers,
        isHighlighted: this.state.isHighlighted,
      };
    }
    if (newProps.selectionColor != null) {
      newProps = {
        ...newProps,
        selectionColor: processColor(newProps.selectionColor),
      };
    }
    if (Touchable.TOUCH_TARGET_DEBUG && newProps.onPress) {
      newProps = {
        ...newProps,
        style: [this.props.style, {color: 'magenta'}],
      };
    }
    if (this.context.isInAParentText) {
      return <RCTVirtualText {...newProps} />;
    } else {
      return <RCTText {...newProps} />;
    }
  },
});

type RectOffset = {
  top: number,
  left: number,
  right: number,
  bottom: number,
};

var PRESS_RECT_OFFSET = {top: 20, left: 20, right: 20, bottom: 30};

var RCTText = createReactNativeComponentClass(
  viewConfig.uiViewClassName,
  () => viewConfig,
);
var RCTVirtualText = RCTText;

if (UIManager.RCTVirtualText) {
  RCTVirtualText = createReactNativeComponentClass('RCTVirtualText', () => ({
    validAttributes: mergeFast(ReactNativeViewAttributes.UIView, {
      isHighlighted: true,
    }),
    uiViewClassName: 'RCTVirtualText',
  }));
}

module.exports = Text;
