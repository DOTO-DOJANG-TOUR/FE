import { DojangTourButton } from '@/components/common/DojangTourButton';
import { DotoLogoIcon } from '@/components/icons';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { useAgreementStore } from '@/stores/agreementStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LocationAgreePage() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const agreeLocation = useAgreementStore(
        (state) => state.agreeLocation,
    );

    const [isAgreeing, setIsAgreeing] =
        useState(false);

    const handleConfirm = async () => {
        if (isAgreeing) return;

        try {
            setIsAgreeing(true);

            await agreeLocation();

            router.replace('/login')
        } catch (error) {
            console.error(
                '약관 동의 저장 실패:',
                error,
            );

            setIsAgreeing(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <View style={styles.container}>
                <View style={styles.logoBox}>
                    <DotoLogoIcon
                        width={55}
                        height={16}
                    />
                </View>
                <View style={styles.textBox}>
                    <Text style={styles.text}>
                        {'서비스 제공을 위해 위치정보 접근 권한이 필요합니다. \n위치정보 이용 기능 : 내 위치 표시 및 관광지 방문 인증'}
                    </Text>
                </View>
                <View style={styles.subTextBox}>
                    <Text style={styles.subText}>* 접근을 허용하지 않더라도 기본 기능을 이용할 수 있습니다.</Text>
                </View>
            </View>
            <View style={[
                styles.dojangSection,
                styles.white,
                {
                    paddingBottom: Math.max(40, insets.bottom + 14),
                },
            ]}>
                <DojangTourButton
                    status='confirm'
                    loading={isAgreeing}
                    onPress={handleConfirm}
                />
            </View>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Colors.gray.gray00,
    },
    white: {
        backgroundColor: Colors.gray.gray00,
    },
    container: {
        flex: 1,
        backgroundColor: Colors.gray.gray00,
    },
    logoBox: {
        padding: 20,
    },
    textBox: {
        paddingHorizontal: 20,
    },
    text: {
        fontFamily: FontFamily.medium,
        fontSize: FontSize.md,
        color: Colors.gray.gray80,
        lineHeight: FontSize.md * 1.5,
    },
    subTextBox: {
        paddingHorizontal: 20,
        paddingTop: 8,
    },
    subText: {
        color: Colors.gray.gray70,
        fontFamily: FontFamily.regular,
        fontSize: FontSize.sm,
        lineHeight: FontSize.sm * 1.5,
    },
    dojangSection: {
        paddingHorizontal: 20,
        paddingTop: 14,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.10)',
    },
});