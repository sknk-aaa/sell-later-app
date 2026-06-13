import React from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { isExpoGo } from '@/utils/env';

type Props = ScrollViewProps & { bottomOffset?: number };

export function FormScrollView({ bottomOffset = 100, ...props }: Props) {
  if (isExpoGo) {
    return <ScrollView {...props} />;
  }
  return <KeyboardAwareScrollView bottomOffset={bottomOffset} {...props} />;
}
