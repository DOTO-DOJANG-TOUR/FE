import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { BackIcon } from '../icons/BackIcon';
import { CircleDeleteIcon } from '../icons/CircleDeleteIcon';

export default function SearchHeader() {
    const [keyword, setKeyword] = useState('');
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <BackIcon />
            </Pressable>
            <View style={styles.inputBox}>
                <TextInput
                    style={styles.input}
                    value={keyword}
                    onChangeText={setKeyword}
                    placeholder='방문하고 싶은 축제 검색'
                    placeholderTextColor="#A8A8A8"
                    returnKeyType='search'
                    underlineColorAndroid="transparent"
                />

                {keyword.length > 0 && (
                    <Pressable
                        style={styles.clearButton}
                        onPress={() => setKeyword('')}
                    >
                        <CircleDeleteIcon />
                    </Pressable>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backButton: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputBox: {
        flex: 1,
        position: 'relative',
    },
    input: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: Colors.gray.gray20,
        borderRadius: 20,
        fontFamily: FontFamily.medium,
        fontSize: FontSize.md,
        lineHeight: FontSize.md * 1.5,
        color: Colors.gray.gray100,
    },
    clearButton: {
        position: 'absolute',
        right: 20,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        width: 20,
    },
});