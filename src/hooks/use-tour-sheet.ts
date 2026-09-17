import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, type PanResponderGestureState } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';

// 프로토타입에 시간/속도 수치가 노출되지 않아 기존 spring을 유지한다.
export function useTourSheet({
  expanded, collapsedHeight, expandedHeight, onExpandedChange, onHeightChange,
}: {
  expanded: boolean; collapsedHeight: number; expandedHeight: number;
  onExpandedChange: (expanded: boolean) => void;
  // 드래그·스프링 애니메이션 중에도 매 프레임 현재 시트 높이를 그대로 흘려보낸다
  // (예: 내 위치 버튼이 시트를 따라 움직이도록).
  onHeightChange?: (value: number) => void;
}) {
  const [height] = useState(() => new Animated.Value(expanded ? expandedHeight : collapsedHeight));
  const currentHeight = useRef(expanded ? expandedHeight : collapsedHeight);
  const startHeight = useRef(expanded ? expandedHeight : collapsedHeight);
  const scrollOffset = useRef(0);
  const dragging = useRef(false);
  const bodyCanDrag = useRef(false);
  const onHeightChangeRef = useRef(onHeightChange);
  useEffect(() => {
    onHeightChangeRef.current = onHeightChange;
  }, [onHeightChange]);

  const springTo = useCallback((targetExpanded: boolean) => {
    Animated.spring(height, {
      toValue: targetExpanded ? expandedHeight : collapsedHeight,
      damping: 24, stiffness: 220, mass: 0.8, useNativeDriver: false,
    }).start();
  }, [collapsedHeight, expandedHeight, height]);

  const snapTo = useCallback((targetExpanded: boolean) => {
    dragging.current = false;
    if (targetExpanded === expanded) springTo(targetExpanded);
    else onExpandedChange(targetExpanded);
  }, [expanded, onExpandedChange, springTo]);

  useEffect(() => {
    const id = height.addListener(({ value }) => {
      currentHeight.current = value;
      onHeightChangeRef.current?.(value);
    });
    return () => height.removeListener(id);
  }, [height]);

  useEffect(() => {
    Animated.spring(height, {
      toValue: expanded ? expandedHeight : collapsedHeight,
      damping: 24, stiffness: 220, mass: 0.8, useNativeDriver: false,
    }).start();
  }, [expanded, collapsedHeight, expandedHeight, height]);

  const responders = useMemo(() => {
    const shouldCapture = (gesture: PanResponderGestureState) =>
      Math.abs(gesture.dy) > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.2;
    const handlers = {
        onPanResponderGrant: () => {
          dragging.current = true;
          height.stopAnimation();
          startHeight.current = currentHeight.current;
        },
        onPanResponderMove: (_: unknown, gesture: PanResponderGestureState) => {
          height.setValue(Math.max(collapsedHeight, Math.min(expandedHeight, startHeight.current - gesture.dy)));
        },
        onPanResponderRelease: (_: unknown, gesture: PanResponderGestureState) => {
          if (Math.abs(gesture.dy) >= 24 || Math.abs(gesture.vy) > 0.5) snapTo(gesture.dy < 0);
          else snapTo(expanded);
        },
        onPanResponderTerminate: () => snapTo(expanded),
        onPanResponderTerminationRequest: () => !dragging.current,
    };
    return {
      // PanResponder는 여기서 콜백을 등록할 뿐, ref는 터치 이벤트에서만 읽는다.
      // eslint-disable-next-line react-hooks/refs
      header: PanResponder.create({ ...handlers,
        onMoveShouldSetPanResponder: (_, gesture) => shouldCapture(gesture),
        onMoveShouldSetPanResponderCapture: (_, gesture) => shouldCapture(gesture),
      }),
    };
  }, [expanded, collapsedHeight, expandedHeight, height, snapTo]);

  const nativeScrollGesture = useMemo(() => Gesture.Native(), []);
  // Gesture builder는 이벤트 콜백을 등록하며 render 중 ref를 읽지 않는다.
  /* eslint-disable react-hooks/refs */
  const bodyGesture = useMemo(() => Gesture.Pan().runOnJS(true)
    .simultaneousWithExternalGesture(nativeScrollGesture)
    .onBegin(() => {
      bodyCanDrag.current = scrollOffset.current <= 1;
      dragging.current = false;
      startHeight.current = currentHeight.current;
    })
    .onUpdate((event) => {
      if (!bodyCanDrag.current || event.translationY <= 8 ||
        event.translationY <= Math.abs(event.translationX) * 1.2) return;
      if (!dragging.current) { height.stopAnimation(); dragging.current = true; }
      height.setValue(Math.max(collapsedHeight, Math.min(expandedHeight,
        startHeight.current - event.translationY)));
    })
    .onEnd((event) => {
      if (!dragging.current) return;
      const targetExpanded = event.translationY < 24 && event.velocityY < 500 ? expanded : false;
      snapTo(targetExpanded);
    })
    .onFinalize(() => {
      if (!dragging.current) return;
      dragging.current = false;
      Animated.spring(height, { toValue: expanded ? expandedHeight : collapsedHeight,
        damping: 24, stiffness: 220, mass: 0.8, useNativeDriver: false }).start();
  }), [nativeScrollGesture, collapsedHeight, expandedHeight, expanded, height, snapTo]);
  /* eslint-enable react-hooks/refs */

  return {
    height, headerPanHandlers: responders.header.panHandlers,
    bodyGesture, nativeScrollGesture,
    onScroll: (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      scrollOffset.current = Math.max(0, event.nativeEvent.contentOffset.y);
    },
  };
}
