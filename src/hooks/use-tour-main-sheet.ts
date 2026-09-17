import { useEffect, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

/* eslint-disable react-hooks/immutability -- Reanimated SharedValue는 UI 스레드 worklet에서
 * .value를 변경하는 것이 공식 사용 방식이며 React state를 변경하지 않는다. */

const DRAG_ACTIVATION_DISTANCE = 8;
const MIN_VALID_RELEASE_VELOCITY = 80;
// Android에서 짧게 튕기는 제스처도 이동 거리가 중간 지점에 못 미치더라도
// 의도한 방향으로 스냅되도록 일반 드래그보다 낮은 속도부터 플릭으로 본다.
const FLING_VELOCITY = 450;
const SPRING_CONFIG = {
  damping: 24,
  stiffness: 220,
  mass: 0.8,
  overshootClamping: true,
} as const;

function clamp(value: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, value));
}

// 관광지 목록은 카드와 이미지가 많아 JS 스레드에서 height를 매 프레임 갱신하면 손가락보다
// 시트가 늦게 따라올 수 있다. 메인 시트만 Reanimated UI 스레드에서 움직이고, 상세 시트는
// 기존 useTourSheet 동작을 유지한다.
export function useTourMainSheet({
  expanded,
  collapsedHeight,
  expandedHeight,
  onExpandedChange,
}: {
  expanded: boolean;
  collapsedHeight: number;
  expandedHeight: number;
  onExpandedChange: (expanded: boolean) => void;
}) {
  'use no memo';

  const initialHeight = expanded ? expandedHeight : collapsedHeight;
  const height = useSharedValue(initialHeight);
  const startHeight = useSharedValue(initialHeight);
  const dragOriginY = useSharedValue(0);
  const dragging = useSharedValue(false);
  const lastVelocityY = useSharedValue(0);
  const scrollOffset = useSharedValue(0);

  useEffect(() => {
    height.value = withSpring(
      expanded ? expandedHeight : collapsedHeight,
      SPRING_CONFIG,
    );
  }, [collapsedHeight, expanded, expandedHeight, height]);

  const finishDrag = (velocityY: number) => {
    'worklet';
    const midpoint = (collapsedHeight + expandedHeight) / 2;
    const targetExpanded = velocityY <= -FLING_VELOCITY
      ? true
      : velocityY >= FLING_VELOCITY
        ? false
        : height.value >= midpoint;

    dragging.value = false;
    height.value = withSpring(
      targetExpanded ? expandedHeight : collapsedHeight,
      SPRING_CONFIG,
    );

    if (targetExpanded !== expanded) {
      runOnJS(onExpandedChange)(targetExpanded);
    }
  };

  const headerGesture = useMemo(
    () => Gesture.Pan()
      .activeOffsetY([-DRAG_ACTIVATION_DISTANCE, DRAG_ACTIVATION_DISTANCE])
      .failOffsetX([-12, 12])
      .onBegin(() => {
        cancelAnimation(height);
        startHeight.value = height.value;
        lastVelocityY.value = 0;
        dragging.value = true;
      })
      .onUpdate((event) => {
        lastVelocityY.value = event.velocityY;
        height.value = clamp(
          startHeight.value - event.translationY,
          collapsedHeight,
          expandedHeight,
        );
      })
      .onEnd((event) => finishDrag(
        Math.abs(event.velocityY) >= MIN_VALID_RELEASE_VELOCITY
          ? event.velocityY
          : lastVelocityY.value,
      ))
      .onFinalize(() => {
        if (!dragging.value) return;
        dragging.value = false;
        height.value = withSpring(
          expanded ? expandedHeight : collapsedHeight,
          SPRING_CONFIG,
        );
      }),
    // Gesture 콜백은 UI 스레드 worklet으로 실행되며 shared value를 직접 갱신한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collapsedHeight, expanded, expandedHeight, onExpandedChange],
  );

  const nativeScrollGesture = useMemo(() => Gesture.Native(), []);
  const bodyGesture = useMemo(
    () => Gesture.Pan()
      .activeOffsetY([-DRAG_ACTIVATION_DISTANCE, DRAG_ACTIVATION_DISTANCE])
      .simultaneousWithExternalGesture(nativeScrollGesture)
      .onBegin(() => {
        dragging.value = false;
        dragOriginY.value = 0;
        lastVelocityY.value = 0;
      })
      .onUpdate((event) => {
        // 접힌 상태에서는 목록 스크롤을 끄고 시트가 위·아래 드래그를 모두 받는다.
        // 펼친 상태에서는 목록이 최상단일 때 아래로 당기는 동작만 시트로 넘긴다.
        const canMoveSheet = !expanded ||
          (event.translationY > 0 && scrollOffset.value <= 1);
        if (!canMoveSheet) return;

        lastVelocityY.value = event.velocityY;

        if (!dragging.value) {
          cancelAnimation(height);
          startHeight.value = height.value;
          dragOriginY.value = event.translationY;
          dragging.value = true;
        }

        height.value = clamp(
          startHeight.value - (event.translationY - dragOriginY.value),
          collapsedHeight,
          expandedHeight,
        );
      })
      .onEnd((event) => {
        if (dragging.value) {
          finishDrag(
            Math.abs(event.velocityY) >= MIN_VALID_RELEASE_VELOCITY
              ? event.velocityY
              : lastVelocityY.value,
          );
        }
      })
      .onFinalize(() => {
        if (!dragging.value) return;
        dragging.value = false;
        height.value = withSpring(
          expanded ? expandedHeight : collapsedHeight,
          SPRING_CONFIG,
        );
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [collapsedHeight, expanded, expandedHeight, nativeScrollGesture, onExpandedChange],
  );

  const animatedStyle = useAnimatedStyle(() => ({ height: height.value }));

  return {
    animatedStyle,
    headerGesture,
    bodyGesture,
    nativeScrollGesture,
    onScroll: (event: { nativeEvent: { contentOffset: { y: number } } }) => {
      scrollOffset.value = Math.max(0, event.nativeEvent.contentOffset.y);
    },
  };
}
