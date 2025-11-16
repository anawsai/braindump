// Local module declarations to silence missing type errors for icon packages
// This is a small, safe declaraton file used when the library does not ship
// TypeScript types. If you later install proper types, you can remove this.

declare module '@expo/vector-icons' {
  import * as React from 'react';
  import { ComponentType } from 'react';
  import { TextProps } from 'react-native';

  type IconProps = {
    name?: string | number;
    size?: number;
    color?: string;
  } & TextProps;

  export const Ionicons: ComponentType<IconProps>;
  export const MaterialIcons: ComponentType<IconProps>;
  export const FontAwesome: ComponentType<IconProps>;
  export const Entypo: ComponentType<IconProps>;
  export default {
    Ionicons,
    MaterialIcons,
    FontAwesome,
    Entypo,
  } as any;
}

declare module '@expo/vector-icons/*';
