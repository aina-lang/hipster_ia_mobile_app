import { Text as RNText, TextProps } from 'react-native';

interface Props extends TextProps {
  bold?: boolean;
  brittany?: boolean;
}

export const Text: React.FC<Props> = ({ 
  style, 
  bold, 
  brittany, 
  children, 
  ...props 
}) => {
  let fontFamily = 'Brittany-Signature';
  
  if (bold) fontFamily = 'Arimo-Bold';
  if (brittany) fontFamily = 'Brittany-Regular';
  
  return (
    <RNText {...props} style={[{ fontFamily }, style]}>
      {children}
    </RNText>
  );
};