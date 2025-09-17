import { Animated } from "react-native";

/**
 * Animation configuration constants for shake animation
 */
export const SHAKE_ANIMATION_PROPS = {
  // Horizontal shake movement (in pixels) - reduced for smoother feel
  SHAKE_AMPLITUDE: 0.15,

  // Rotation animation (in degrees) - reduced for subtler effect
  ROTATION_AMPLITUDE: 0.8,

  // Timing settings - optimized for smoothness
  SHAKE_DURATION_BASE: 80,
  SHAKE_DURATION_RANDOM: 40,
  ROTATION_DURATION_BASE: 90,
  ROTATION_DURATION_RANDOM: 30,

  // Delay settings for staggered start
  DELAY_BETWEEN_ITEMS: 15,
  DELAY_RANDOM: 25,

  // Reset animation duration
  RESET_DURATION: 150,

  // Drag threshold for reordering
  DRAG_THRESHOLD: 30,
};

/**
 * Animation configuration constants for drag animations
 */
export const DRAG_ANIMATION_PROPS = {
  // Scale animation for drag start/end
  DRAG_SCALE: 1.1,
  DRAG_SCALE_DURATION: 200,

  // Spring animation settings
  SPRING_TENSION: 300,
  SPRING_FRICTION: 12,

  // Shadow and elevation settings
  DRAG_SHADOW_OPACITY: 0.3,
  DRAG_SHADOW_RADIUS: 15,
  DRAG_ELEVATION: 15,

  // Opacity during drag
  DRAG_OPACITY: 0.9,
};

/**
 * Creates and starts Apple-style shake animation for an activity
 */
export const startShakeAnimation = (
  shakeAnim: Animated.Value,
  rotationAnim: Animated.Value,
  delay: number = 0
) => {
  const shake = Animated.loop(
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 2,
        duration:
          SHAKE_ANIMATION_PROPS.SHAKE_DURATION_BASE +
          Math.random() * SHAKE_ANIMATION_PROPS.SHAKE_DURATION_RANDOM,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -2,
        duration:
          SHAKE_ANIMATION_PROPS.SHAKE_DURATION_BASE +
          Math.random() * SHAKE_ANIMATION_PROPS.SHAKE_DURATION_RANDOM,
        useNativeDriver: true,
      }),
    ])
  );

  const rotation = Animated.loop(
    Animated.sequence([
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration:
          SHAKE_ANIMATION_PROPS.ROTATION_DURATION_BASE +
          Math.random() * SHAKE_ANIMATION_PROPS.ROTATION_DURATION_RANDOM,
        useNativeDriver: true,
      }),
      Animated.timing(rotationAnim, {
        toValue: -1,
        duration:
          SHAKE_ANIMATION_PROPS.ROTATION_DURATION_BASE +
          Math.random() * SHAKE_ANIMATION_PROPS.ROTATION_DURATION_RANDOM,
        useNativeDriver: true,
      }),
    ])
  );

  setTimeout(() => {
    shake.start();
    rotation.start();
  }, delay);

  return { shake, rotation };
};

/**
 * Stops and resets shake animation
 */
export const stopShakeAnimation = (
  shakeAnim: Animated.Value,
  rotationAnim: Animated.Value
) => {
  shakeAnim.stopAnimation();
  rotationAnim.stopAnimation();

  Animated.parallel([
    Animated.timing(shakeAnim, {
      toValue: 0,
      duration: SHAKE_ANIMATION_PROPS.RESET_DURATION,
      useNativeDriver: true,
    }),
    Animated.timing(rotationAnim, {
      toValue: 0,
      duration: SHAKE_ANIMATION_PROPS.RESET_DURATION,
      useNativeDriver: true,
    }),
  ]).start();
};

/**
 * Creates shake transform styles for an activity
 */
export const createShakeTransform = (
  shakeAnim: Animated.Value,
  rotationAnim: Animated.Value
) => [
  {
    translateX: shakeAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [
        -SHAKE_ANIMATION_PROPS.SHAKE_AMPLITUDE,
        0,
        SHAKE_ANIMATION_PROPS.SHAKE_AMPLITUDE,
      ],
    }),
  },
  {
    rotate: rotationAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [
        `-${SHAKE_ANIMATION_PROPS.ROTATION_AMPLITUDE}deg`,
        "0deg",
        `${SHAKE_ANIMATION_PROPS.ROTATION_AMPLITUDE}deg`,
      ],
    }),
  },
];

/**
 * Creates smooth drag start animation
 */
export const createDragStartAnimation = (scaleAnim: Animated.Value) => {
  return Animated.spring(scaleAnim, {
    toValue: DRAG_ANIMATION_PROPS.DRAG_SCALE,
    useNativeDriver: true,
    tension: DRAG_ANIMATION_PROPS.SPRING_TENSION,
    friction: DRAG_ANIMATION_PROPS.SPRING_FRICTION,
  });
};

/**
 * Creates smooth drag end animation
 */
export const createDragEndAnimation = (
  dragAnimation: Animated.ValueXY,
  scaleAnim: Animated.Value
) => {
  return Animated.parallel([
    Animated.spring(dragAnimation, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false, // Position transforms can't use native driver
      tension: DRAG_ANIMATION_PROPS.SPRING_TENSION,
      friction: DRAG_ANIMATION_PROPS.SPRING_FRICTION,
    }),
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true, // Scale can use native driver
      tension: DRAG_ANIMATION_PROPS.SPRING_TENSION,
      friction: DRAG_ANIMATION_PROPS.SPRING_FRICTION,
    }),
  ]);
};

/**
 * Additional utility for calculating drag velocity and momentum
 */
export const calculateDragVelocity = (
  gestureState: any,
  startTime: number
): { velocityX: number; velocityY: number } => {
  const currentTime = Date.now();
  const deltaTime = Math.max(currentTime - startTime, 1); // Prevent division by zero

  return {
    velocityX: gestureState.dx / deltaTime,
    velocityY: gestureState.dy / deltaTime,
  };
};

/**
 * Smooth snap animation for grid positioning
 */
export const createSnapAnimation = (
  dragAnimation: Animated.ValueXY,
  targetPosition: { x: number; y: number },
  velocity?: { x: number; y: number }
) => {
  return Animated.spring(dragAnimation, {
    toValue: targetPosition,
    useNativeDriver: false,
    tension: 300,
    friction: 20,
    velocity: velocity || { x: 0, y: 0 },
  });
};
