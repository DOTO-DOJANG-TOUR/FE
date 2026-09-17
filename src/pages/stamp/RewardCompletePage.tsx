import { CompleteIcon } from '@/components/icons/CompleteIcon';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RewardCompletePage() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleConfirm = () => {
        router.replace('/(tabs)/stamp');
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <CompleteIcon />

                <Text style={styles.title}>
                    보상 수령 완료
                </Text>

                <Text style={styles.description}>
                    도장 투어에 참여해 주셔서 감사합니다!{'\n'}
                    남은 여행도 즐겁게 보내시길 바랍니다.
                </Text>
            </View>

            <View style={[
                styles.bottomBar,
                {
                    paddingBottom: Math.max(40, insets.bottom + 14)
                }
            ]}>
                <Pressable
                    style={styles.button}
                    onPress={handleConfirm}
                >
                    <Text style={styles.buttonText}>
                        확인
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray.gray00,
    },

    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },

    title: {
        marginTop: 22,
        fontSize: 26,
        fontFamily: FontFamily.semiBold,
        color: Colors.gray.gray100,
        lineHeight: 26 * 1.5,
    },

    description: {
        marginTop: 6,
        textAlign: 'center',
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
        fontFamily: FontFamily.medium,
        color: Colors.gray.gray80,
    },

    bottomBar: {
        paddingHorizontal: 20,
        paddingTop: 14,
        backgroundColor: Colors.gray.gray00,
    },

    button: {
        height: 54,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.pink.pink40,
    },

    buttonText: {
        fontSize: FontSize.md,
        fontFamily: FontFamily.semiBold,
        color: Colors.gray.gray00,
        lineHeight: FontSize.md * 1.5,
    },
});