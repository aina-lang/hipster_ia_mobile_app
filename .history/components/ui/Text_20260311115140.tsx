import { Text as RNText } from 'react-native';

export const Text = (props) => {
  return <RNText {...props} style={[{ fontFamily: 'Arimo-Regular' }, props.style]} />;
};