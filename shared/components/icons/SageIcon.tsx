import React, { useEffect, useRef, useState } from "react";
import { Animated, View } from "react-native";
import { Defs, Path, RadialGradient, Stop, Svg } from "react-native-svg";

interface SageIconProps {
  status?: "pulsating" | "changing" | "still";
  size?: number;
  auto?: boolean;
  isLoggedIn?: boolean;
}
// Define Star5 component inline
export const Star5 = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width} height={height} viewBox="0 0 85 85" fill="none">
    <Path
      d="M42.5 0L43.5967 23.3213L47.3446 0.277027L45.7757 23.5714L52.1261 1.10449L47.9121 24.0681L56.7821 2.47161L49.9779 24.8052L61.2519 4.36057L51.9462 25.773L65.4772 6.74672L53.7914 26.9588L69.403 9.59898L55.4893 28.3472L72.9781 12.8802L57.0179 29.9201L76.1558 16.5475L58.3573 31.657L78.8948 20.5531L59.49 33.5353L81.1594 24.8449L60.4011 35.5305L82.9199 29.3668L61.0789 37.6165L84.1535 34.0599L61.5145 39.7661L84.8441 38.8631L61.7022 41.9514L84.9827 43.7136L61.6395 44.1439L84.5674 48.5484L61.3274 46.3149L83.6037 53.3043L60.7698 48.4362L82.1042 57.9193L59.974 50.4801L80.0884 62.3334L58.9505 52.42L77.5826 66.4888L57.7124 54.2305L74.6194 70.3316L56.2761 55.8882L71.2374 73.8115L54.6602 57.3713L67.4809 76.8832L52.8857 58.6605L63.3987 79.5067L50.9759 59.739L59.044 81.6478L48.9555 60.5928L54.4736 83.2785L46.851 61.2108L49.7472 84.3775L44.6898 61.5848L44.9263 84.9307L42.5 61.71L40.0737 84.9307L40.3102 61.5848L35.2528 84.3775L38.149 61.2108L30.5264 83.2785L36.0445 60.5928L25.956 81.6478L34.0241 59.739L21.6014 79.5067L32.1143 58.6605L17.5191 76.8832L30.3398 57.3713L13.7626 73.8115L28.7239 55.8882L10.3806 70.3316L27.2876 54.2305L7.41745 66.4888L26.0495 52.42L4.9116 62.3334L25.026 50.4801L2.89578 57.9193L24.2302 48.4362L1.39626 53.3043L23.6726 46.3149L0.43259 48.5484L23.3605 44.1439L0.0173302 43.7136L23.2978 41.9514L0.155903 38.8631L23.4855 39.7661L0.846493 34.0599L23.9211 37.6165L2.0801 29.3668L24.5989 35.5305L3.84064 24.8449L25.51 33.5353L6.10517 20.5531L26.6427 31.657L8.84415 16.5475L27.9821 29.9201L12.0219 12.8802L29.5107 28.3472L15.597 9.59898L31.2086 26.9588L19.5228 6.74672L33.0538 25.773L23.7481 4.36057L35.0221 24.8052L28.2179 2.47161L37.0879 24.0681L32.8739 1.10449L39.2243 23.5714L37.6554 0.277027L41.4033 23.3213L42.5 0Z"
      fill={"url(#paint0_radial_593_5900)"}
    />
    <Defs>
      <RadialGradient
        id="paint0_radial_593_5900"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(41.6327 40.7653) rotate(90) scale(19.0816)"
      >
        <Stop stopColor="#AB37FE" />
        <Stop offset="0.99" stopColor="#66646EC" />
      </RadialGradient>
    </Defs>
  </Svg>
);

// Define Star4 component inline
export const Star4 = ({ width, height }: { width: number; height: number }) => (
  <Svg width={width} height={height} viewBox="0 0 88 88" fill="none">
    <Path
      d="M44 0L45.1354 24.1444L49.0156 0.286804L47.3913 24.4033L53.9659 1.14347L49.6031 24.9176L58.7862 2.55885L51.7418 25.6807L63.4137 4.51447L53.7796 26.6826L67.7882 6.98484L55.6899 27.9103L71.8525 9.93777L57.4478 29.3477L75.5538 13.3347L59.0303 30.9761L78.8437 17.1315L60.417 32.7744L81.6794 21.2785L61.5896 34.7189L84.0238 25.7217L62.5329 36.7845L85.8465 30.4033L63.2346 38.9441L87.1236 35.262L63.6856 41.1696L87.8386 40.2347L63.8799 43.4321L87.9821 45.2565L63.815 45.7019L87.5521 50.2619L63.4919 47.9496L86.5545 55.1856L62.9146 50.1457L85.002 59.9635L62.0908 52.2618L82.9151 64.5334L61.0311 54.2701L80.3208 68.8355L59.7494 56.1446L77.253 72.8139L58.2623 57.8607L73.7517 76.4166L56.5894 59.3961L69.8625 79.5967L54.7523 60.7309L65.6362 82.3128L52.775 61.8475L61.1279 84.5294L50.6833 62.7314L56.3962 86.2177L48.5046 63.3711L51.503 87.3556L46.2671 63.7584L46.5119 87.9282L44 63.888L41.4881 87.9282L41.7329 63.7584L36.497 87.3556L39.4954 63.3711L31.6038 86.2177L37.3167 62.7314L26.8721 84.5294L35.225 61.8475L22.3638 82.3128L33.2477 60.7309L18.1374 79.5967L31.4106 59.3961L14.2483 76.4166L29.7377 57.8607L10.747 72.8139L28.2506 56.1446L7.67924 68.8355L26.9689 54.2701L5.08495 64.5334L25.9092 52.2618L2.99798 59.9635L25.0854 50.1457L1.44554 55.1856L24.5081 47.9496L0.447857 50.2619L24.185 45.7019L0.0179443 45.2565L24.1201 43.4321L0.161404 40.2347L24.3144 41.1696L0.876366 35.262L24.7654 38.9441L2.15351 30.4033L25.4671 36.7845L3.97619 25.7217L26.4104 34.7189L6.32064 21.2785L27.583 32.7744L9.1563 17.1315L28.9697 30.9761L12.4462 13.3347L30.5522 29.3477L16.1475 9.93777L32.3101 27.9103L20.2118 6.98484L34.2204 26.6826L24.5863 4.51447L36.2582 25.6807L29.2138 2.55885L38.3969 24.9176L34.0341 1.14347L40.6087 24.4033L38.9844 0.286804L42.8646 24.1444L44 0Z"
      fill={"url(#paint0_radial_0_1)"}
    />
    <Defs>
      <RadialGradient
        id="paint0_radial_0_1"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(43.102 42.2041) rotate(90) scale(19.7551)"
      >
        <Stop stopColor="#FE4437" />
        <Stop offset="0.99" stopColor="#66646EC" />
      </RadialGradient>
    </Defs>
  </Svg>
);

const SageIcon = ({
  status: initialStatus = "pulsating",
  size = 40,
  auto = true,
  isLoggedIn = true,
}: SageIconProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const [showStar5, setShowStar5] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    isLoggedIn ? (auto ? "pulsating" : initialStatus) : "still"
  );

  // Auto transition effect - pulsating to still after 10 seconds
  useEffect(() => {
    if (!isLoggedIn) {
      setCurrentStatus("still");
      return;
    }

    if (auto && currentStatus === "pulsating") {
      const timer = setTimeout(() => {
        setCurrentStatus("still");
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [auto, isLoggedIn, currentStatus]);

  // Animation effect based on current status
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    // Reset animations to initial state
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);

    if (currentStatus === "pulsating") {
      // Create a pulsating animation
      const pulse = Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]);

      // Loop the pulsating animation indefinitely
      animation = Animated.loop(pulse);
      animation.start();
    } else if (currentStatus === "changing") {
      // Alternate between Star4 and Star5
      intervalId = setInterval(() => {
        setShowStar5((prev) => !prev);
      }, 500);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [currentStatus, scaleAnim, opacityAnim]);

  return (
    <View>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }}
      >
        {currentStatus === "pulsating" ? (
          <Star4 width={size} height={size} />
        ) : currentStatus === "changing" ? (
          showStar5 ? (
            <Star4 width={size} height={size} />
          ) : (
            <Star5 width={size} height={size} />
          )
        ) : (
          <Star5 width={size} height={size} />
        )}
      </Animated.View>
    </View>
  );
};

export default SageIcon;
