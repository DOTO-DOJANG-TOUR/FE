import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, type PanResponderGestureState } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';

// 프로토타입에 시간/속도 수치가 노출되지 않아 기존 spring을 유지한다.
export function useTourSheet({ expanded, collapsedHeight, expandedHeight, onExpandedChange }: {
  expanded: boolean; collapsedHeight: number; expandedHeight: number;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const [height] = useState(() => new Animated.Value(expanded ? expandedHeight : collapsedHeight));
  const currentHeight = useRef(expanded ? expandedHeight : collapsedHeight);
  const startHeight = useRef(expanded ? expandedHeight : collapsedHeight);
  const scrollOffset = useRef(0);
  const dragging = useRef(false);
  const bodyCanDrag = useRef(false);

  useEffect(() => {
    const id = height.addListener(({ value }) => { currentHeight.current = value; });
    return () => height.removeListener(id);
  }, [height]);

  useEffect(() => {
    Animated.spring(height, {
      toValue: expanded ? expandedHeight : collapsedHeight,
      damping: 24, stiffness: 220, mass: 0.8, useNativeDriver: false,
    }).start();
  }, [expanded, collapsedHeight, expandedHeight, height]);

  const responders = useMemo(() => {
    const snap = (targetExpanded: boolean) => {
      dragging.current = false;
      onExpandedChange(targetExpanded);
      // 같은 스냅 위치로 놓아도 중간 높이에 걸리지 않도록 직접 복귀시킨다.
      Animated.spring(height, {
        toValue: targetExpanded ? expandedHeight : collapsedHeight,
        damping: 24, stiffness: 220, mass: 0.8, useNativeDriver: false,
      }).start();
    };
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
          if (Math.abs(gesture.dy) >= 24 || Math.abs(gesture.vy) > 0.5) snap(gesture.dy < 0);
          else snap(expanded);
        },
        onPanResponderTerminate: () => snap(expanded),
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
  }, [expanded, collapsedHeight, expandedHeight, height, onExpandedChange]);

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
      onExpandedChange(targetExpanded);
      Animated.spring(height, { toValue: targetExpanded ? expandedHeight : collapsedHeight,
        damping: 24, stiffness: 220, mass: 0.8, useNativeDriver: false }).start();
      dragging.current = false;
    })
    .onFinalize(() => {
      if (!dragging.current) return;
      dragging.current = false;
      Animated.spring(height, { toValue: expanded ? expandedHeight : collapsedHeight,
        damping: 24, stiffness: 220, mass: 0.8, useNativeDriver: false }).start();
    }), [nativeScrollGesture, collapsedHeight, expandedHeight, expanded, height, onExpandedChange]);
  /* eslint-enable react-hooks/refs */

  return {
    height, headerPanHandlers: responders.header.panHandlers,
    bodyGesture, nativeScrollGesture,
    onScroll: (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      scrollOffset.current = Math.max(0, event.nativeEvent.contentOffset.y);
    },
  };
}
