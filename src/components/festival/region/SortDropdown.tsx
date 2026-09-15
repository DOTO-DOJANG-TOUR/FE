import { DownIcon } from '@/components/icons/DownIcon';
import { Colors, FontFamily, FontSize } from '@/constants/theme';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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

    const buttonRef = useRef<View>(null);

    const [dropdownPosition, setDropdownPosition] = useState({
        top: 0,
        left: 0,
    });

    const selectedOption = options.find(
        (option) => option.value === value
    );

    const handleOpen = () => {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        buttonRef.current?.measureInWindow(
            (x, y, width, height) => {
                setDropdownPosition({
                    left: x,
                    top: y + height + 4,
                });

                setIsOpen(true);
            }
        );
    };

    const handleSelect = (value: string) => {
        onChange(value);
        setIsOpen(false);
    };

    return (
        <View style={styles.container}>
            <Pressable
                ref={buttonRef}
                style={styles.button}
                onPress={handleOpen}
            >
                <Text style={styles.buttonText}>{selectedOption?.label}</Text>
                <DownIcon />
            </Pressable>
            <Modal
                visible={isOpen}
                transparent
                animationType="none"
                onRequestClose={() => setIsOpen(false)}
            >
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setIsOpen(false)}
                />
                <View style={[
                    styles.dropdown,
                    {
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                    },
                ]}>
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
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
        zIndex: 10,
        paddingHorizontal: 20,
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
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
        minWidth: 136,
        borderRadius: 6,
        backgroundColor: Colors.gray.gray00,
        elevation: 4,
        paddingHorizontal: 5,
    },
    option: {
        paddingVertical: 14,
        paddingHorizontal: 15,
    },
    optionBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray.gray20
    },
});