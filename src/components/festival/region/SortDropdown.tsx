import { DownIcon } from '@/components/icons/DownIcon';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SortOption = {
    label: string;
    value: string;
};

type Props = {
    value: string;
    options: SortOption[];
    onChange: (value: string) => void;
};

export default function SortDropdown({
    value,
    options,
    onChange,
}: Props) {
    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find(
        (option) => option.value === value
    );

    const handleSelect = (value: string) => {
        onChange(value);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            <Pressable
                style={styles.button}
                onPress={() => setIsOpen((prev) => !prev)}
            >
                <Text style={styles.buttonText}>{selectedOption?.label}</Text>
                <DownIcon />
            </Pressable>
            {isOpen && (
                <View style={styles.dropdown}>
                    {options.map((option, index) => {
                        const isLast = index === options.length - 1;

                        return (
                            <Pressable
                                key={option.value}
                                style={[
                                    styles.option,
                                    !isLast && styles.optionBorder,
                                ]}
                                onPress={() => handleSelect(option.value)}
                            >
                                <Text style={styles.buttonText}>
                                    {option.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        alignSelf: 'flex-start',
        zIndex: 10,
        paddingHorizontal: 20,
    },
    button: {
        flexDirection: 'row',
        gap: 4,
        paddingLeft: 10,
        paddingRight: 6,
        paddingVertical: 8,
        backgroundColor: Colors.gray.gray20,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    buttonText: {
        fontFamily: FontFamily.medium,
        fontSize: FontSize.sm,
        color: Colors.gray.gray100,
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: 20,
        minWidth: 100,
        marginTop: 4,
        borderRadius: 6,
        backgroundColor: Colors.gray.gray20,
        zIndex: 10,
        elevation: 4,
        paddingHorizontal: 10,

    },
    option: {
        paddingVertical: 4,

    },
    optionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.gray60
    },
});