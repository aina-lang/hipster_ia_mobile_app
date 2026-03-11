// components/ui/Text.tsx
import { Text as RNText, TextProps } from 'react-native';
import { textStyles } from '../../theme/typography';

interface Props extends TextProps {
  h1?: boolean;
  h2?: boolean;
  h3?: boolean;
  body?: boolean;
  bodyBold?: boolean;
  small?: boolean;
  signature?: boolean;
  bold?: boolean;  // Pour du body en gras rapide
  brittany?: boolean; // Pour signature rapide
}

export const Text: React.FC<Props> = ({ 
  style,
  h1, h2, h3, body, bodyBold, small, signature,
  bold, brittany,
  children, 
  ...props 
}) => {
  let selectedStyle = textStyles.body;
  
  if (h1) selectedStyle = textStyles.h1;
  else if (h2) selectedStyle = textStyles.h2;
  else if (h3) selectedStyle = textStyles.h3;
  else if (body) selectedStyle = textStyles.body;
  else if (bodyBold) selectedStyle = textStyles.bodyBold;
  else if (small) selectedStyle = textStyles.small;
  else if (signature) selectedStyle = textStyles.signature;
  else if (bold) selectedStyle = textStyles.bodyBold;
  else if (brittany) selectedStyle = textStyles.signature;
  
  return (
    <RNText {...props} style={[selectedStyle, style]}>
      {children}
    </RNText>
  );
};

export const H1 = (props: TextProps) => <Text h1 {...props} />;
export const H2 = (props: TextProps) => <Text h2 {...props} />;
export const H3 = (props: TextProps) => <Text h3 {...props} />;
export const Body = (props: TextProps) => <Text body {...props} />;
export const BodyBold = (props: TextProps) => <Text bodyBold {...props} />;
export const Small = (props: TextProps) => <Text small {...props} />;
export const Signature = (props: TextProps) => <Text signature {...props} />;