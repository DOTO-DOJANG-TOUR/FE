import { DojangTourButton } from '@/components/common/DojangTourButton';
import { DotoLogoIcon } from '@/components/icons';
import { RightArrowIcon } from '@/components/icons/RightArrowIcon';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { useAgreementStore } from '@/stores/agreementStore';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const TERMS_URL =
    'https://doto-stamptour.notion.site/tos';

const PRIVACY_URL =
    'https://doto-stamptour.notion.site/privacy-policy';

export default function AuthAgreePage() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const agree = useAgreementStore(
        (state) => state.agree,
    );

    const [isAgreeing, setIsAgreeing] =
        useState(false);

    const handleAgree = async () => {
        if (isAgreeing) return;

        try {
            setIsAgreeing(true);

            await agree();

            router.replace('/login')
        } catch (error) {
            console.error(
                '약관 동의 저장 실패:',
                error,
            );

            setIsAgreeing(false);
        }
    };

    const handleOpenPolicy = async (url: string) => {
        try {
            await Linking.openURL(url);
        } catch (error) {
            console.error('약관 페이지 열기 실패:', error);
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
                        {'편리한 도투 서비스 이용을 위해 약관에 동의해 주세요.\n약관에 동의하지 않는 경우, 서비스 이용이 어렵습니다.'}
                    </Text>
                </View>
                <View style={styles.agreeBox}>
                    <Pressable
                        style={styles.agreeButton}
                        onPress={() => handleOpenPolicy(TERMS_URL)}
                    >
                        <Text style={styles.agreeText}>이용 약관</Text>
                        <RightArrowIcon />
                    </Pressable>
                    <Pressable
                        style={styles.agreeButton}
                        onPress={() => handleOpenPolicy(PRIVACY_URL)}
                    >
                        <Text style={styles.agreeText}>개인정보 취급방침</Text>
                        <RightArrowIcon />
                    </Pressable>
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
                    status='agree'
                    loading={isAgreeing}
                    onPress={handleAgree}
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
    agreeBox: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 30,
        gap: 8,
    },
    agreeButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
    },
    agreeText: {
        color: Colors.gray.gray100,
        fontFamily: FontFamily.semiBold,
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
    },
    dojangSection: {
        paddingHorizontal: 20,
        paddingTop: 14,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.10)',
    },
});