import { Colors, FontFamily, FontSize, Radius } from '@/constants/theme';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CloseIcon } from '../icons/CloseIcon';

type Props = {
    visible: boolean;
    qrImage: string;
    rewardCode: string;
    onClose: () => void;
};

export default function StampQrModal({
    visible,
    qrImage,
    rewardCode,
    onClose,
}: Props) {
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const [mounted, setMounted] = useState(visible);

    const translateY = useRef(
        new Animated.Value(700),
    ).current;

    const backdropOpacity = useRef(
        new Animated.Value(0),
    ).current;

    useEffect(() => {
        if (visible) {
            setMounted(true);

            translateY.setValue(700);
            backdropOpacity.setValue(0);

            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 320,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),

                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();

            return;
        }

        if (mounted) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: height,
                    duration: 250,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),

                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start(({ finished }) => {
                if (finished) {
                    setMounted(false);
                }
            });
        }
    }, [
        visible,
        height,
        mounted,
        translateY,
        backdropOpacity,
    ]);

    if (!mounted) {
        return null;
    }

    return (
        <Modal
            transparent
            visible={mounted}
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        styles.backdrop,
                        {
                            opacity: backdropOpacity,
                        },
                    ]}
                >
                    <Pressable
                        style={StyleSheet.absoluteFill}
                        onPress={onClose}
                    />
                </Animated.View>
                <Animated.View
                    style={[
                        styles.modalBox,
                        {
                            marginBottom: Math.max(
                                24,
                                insets.bottom + 16,
                            ),
                            transform: [
                                {
                                    translateY,
                                },
                            ],
                        },
                    ]}
                >
                    <View style={styles.header}>
                        <View style={styles.empty}></View>
                        <Text style={styles.title}>
                            보상 교환
                        </Text>
                        <Pressable
                            onPress={onClose}
                            hitSlop={12}
                        >
                            <CloseIcon />
                        </Pressable>
                    </View>

                    <Text style={styles.description}>
                        지정 장소에 도착해 QR 코드를 스캔하거나{'\n'}
                        번호를 제시하면 보상을 수령할 수 있습니다.
                    </Text>

                    <Text style={styles.notice}>
                        * 보상 교환 장소는 부스 배치 및 행사장 안내 참고
                    </Text>

                    <View style={styles.qrBox}>
                        <Image
                            source={{ uri: qrImage }}
                            style={styles.qrImage}
                            contentFit="contain"
                        />
                    </View>

                    <View style={styles.codeBox}>
                        {rewardCode.split('').map((number, index) => (
                            <View
                                key={`${number}-${index}`}
                                style={styles.codeItem}
                            >
                                <Text style={styles.codeText}>
                                    {number}
                                </Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        backgroundColor: 'rgba(38, 38, 38, 0.30)',
    },
    modalBox: {
        marginHorizontal: 20,
        paddingHorizontal: 25,
        paddingTop: 31,
        paddingBottom: 30,
        borderRadius: 20,
        backgroundColor: Colors.gray.gray00,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.lg,
        color: Colors.gray.gray100,
    },
    description: {
        marginTop: 19,
        textAlign: 'center',
        fontFamily: FontFamily.medium,
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
        color: Colors.gray.gray100,
    },
    notice: {
        marginTop: 8,
        textAlign: 'center',
        fontFamily: FontFamily.regular,
        fontSize: FontSize.sm,
        color: '#A8A8A8',
    },
    qrBox: {
        width: 200,
        height: 200,
        marginTop: 30,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Radius.md,
        backgroundColor: Colors.gray.gray20,
    },
    codeBox: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5,
        marginTop: 30,
    },
    codeItem: {
        width: 41,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.gray.gray20,
        borderRadius: 6,
    },
    codeText: {
        fontFamily: FontFamily.semiBold,
        fontSize: 22,
        color: Colors.gray.gray100,
    },
    qrImage: {
        width: 168,
        height: 168,
        borderRadius: 6,
    },
    empty: {
        width: 32,
    }
});