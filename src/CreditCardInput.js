import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactNative, {
  NativeModules,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TextInput,
  ViewPropTypes,
} from "react-native";

import CreditCard from "./CardView";
import CCInput from "./CCInput";
import { InjectedProps } from "./connectToState";

const s = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  form: {
    marginTop: 20,
  },
  inputLabel: {
    fontWeight: "bold",
  },
  input: {
    height: 40,
  },
});

const DEVICE_WIDTH = Dimensions.get('window').width
const NUMBER_INPUT_WIDTH = DEVICE_WIDTH - 52
const CVC_INPUT_WIDTH = (DEVICE_WIDTH - 68) / 2
const EXPIRY_INPUT_WIDTH = CVC_INPUT_WIDTH
const SPACING = 16
const CARD_WIDTH = 300
const SCALE = NUMBER_INPUT_WIDTH / CARD_WIDTH

/* eslint react/prop-types: 0 */ // https://github.com/yannickcr/eslint-plugin-react/issues/106
export default class CreditCardInput extends Component {
  static propTypes = {
    ...InjectedProps,
    labels: PropTypes.object,
    placeholders: PropTypes.object,

    labelStyle: Text.propTypes.style,
    inputStyle: Text.propTypes.style,
    inputContainerStyle: ViewPropTypes.style,

    validColor: PropTypes.string,
    invalidColor: PropTypes.string,
    placeholderColor: PropTypes.string,

    cardImageFront: PropTypes.number,
    cardImageBack: PropTypes.number,
    cardScale: PropTypes.number,
    cardFontFamily: PropTypes.string,
    cardBrandIcons: PropTypes.object,

    allowScroll: PropTypes.bool,

    additionalInputsProps: PropTypes.objectOf(PropTypes.shape(TextInput.propTypes)),
  };

  static defaultProps = {
    cardViewSize: {},
    labels: {
      name: "CARDHOLDER'S NAME",
      number: "CARD NUMBER",
      expiry: "EXPIRY",
      cvc: "CVC/CCV",
      postalCode: "POSTAL CODE",
    },
    placeholders: {
      name: "Full Name",
      number: "1234 5678 1234 5678",
      expiry: "MM/YY",
      cvc: "CVC",
      postalCode: "34567",
    },
    inputContainerStyle: {
      borderBottomWidth: 1,
      borderBottomColor: "black",
    },
    cardScale: SCALE,
    validColor: "",
    invalidColor: "red",
    placeholderColor: "gray",
    allowScroll: false,
    additionalInputsProps: {},
  };

  componentDidMount = () => this._focus(this.props.focused);

  componentDidUpdate(prevProps) {
    const { focused } = this.props

    if (focused !== prevProps.focuses) this._focus(focused);
  }

  _focus = field => {
    if (!field) return;

    const scrollResponder = this.refs.Form.getScrollResponder();
    const nodeHandle = ReactNative.findNodeHandle(this.refs[field]);

    NativeModules.UIManager.measureLayoutRelativeToParent(nodeHandle,
      e => { throw e; },
      () => {
        this.refs[field].focus();
      });
  }

  _inputProps = field => {
    const {
      inputStyle, labelStyle, validColor, invalidColor, placeholderColor,
      placeholders, labels, values, status,
      onFocus, onChange, onBecomeEmpty, onBecomeValid,
      additionalInputsProps,
    } = this.props;

    return {
      inputStyle: [s.input, inputStyle],
      labelStyle: [s.inputLabel, labelStyle],
      validColor, invalidColor, placeholderColor,
      ref: field, field,

      label: labels[field],
      placeholder: placeholders[field],
      value: values[field],
      status: status[field],

      onFocus, onChange, onBecomeEmpty, onBecomeValid,

      additionalInputProps: additionalInputsProps[field],
    };
  };

  render() {
    const {
      cardImageFront, cardImageBack, inputContainerStyle,
      values: { number, expiry, cvc, name, type }, focused,
      allowScroll, requiresName, requiresCVC, requiresPostalCode,
      cardScale, cardFontFamily, cardBrandIcons,
    } = this.props;

    return (
      <View style={s.container}>
        <CreditCard focused={focused}
          brand={type}
          scale={cardScale}
          fontFamily={cardFontFamily}
          imageFront={cardImageFront}
          imageBack={cardImageBack}
          customIcons={cardBrandIcons}
          name={requiresName ? name : " "}
          number={number}
          expiry={expiry}
          cvc={cvc} />
        <ScrollView ref="Form"
          bounces={false}
          horizontal={false}
          keyboardShouldPersistTaps="always"
          scrollEnabled={allowScroll}
          showsVerticalScrollIndicator={false}
          style={s.form}>
          <CCInput {...this._inputProps("number")}
            keyboardType="numeric"
            containerStyle={[inputContainerStyle, { width: NUMBER_INPUT_WIDTH }]} />
          <View style={{ flexDirection: 'row' }}>
            <CCInput {...this._inputProps("expiry")}
              keyboardType="numeric"
              containerStyle={[inputContainerStyle, { width: EXPIRY_INPUT_WIDTH, marginRight: SPACING }]} />
            {requiresCVC &&
              <CCInput {...this._inputProps("cvc")}
                keyboardType="numeric"
                containerStyle={[inputContainerStyle, { width: CVC_INPUT_WIDTH }]} />}
          </View>
          {requiresName &&
            <CCInput {...this._inputProps("name")}
              containerStyle={inputContainerStyle} />}
          {requiresPostalCode &&
            <CCInput {...this._inputProps("postalCode")}
              keyboardType="numeric"
              containerStyle={inputContainerStyle} />}
        </ScrollView>
      </View>
    );
  }
}
