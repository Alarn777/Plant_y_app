import {Dimensions, Platform} from 'react-native';

export function isIphoneX() {
  const dim = Dimensions.get('window');

  return (
    // This has to be iOS
    Platform.OS === 'ios' &&
    // Check either, iPhone X or XR
    (isIPhoneXSize(dim) || isIPhoneXrSize(dim))
  );
}

export function isIphone7() {
  const dim = Dimensions.get('window');
  // console.log(dim);

  return (
    // This has to be iOS
    Platform.OS === 'ios' &&
    // Check either, iPhone X or XR
    (dim.height === 736 ||
      dim.width === 414 ||
      (dim.height === 736 || dim.width === 414))
  );
}

export function isIPhoneXSize(dim) {
  return dim.height === 812 || dim.width === 812;
}

export function isIPhoneXrSize(dim) {
  return dim.height === 896 || dim.width === 896;
}
