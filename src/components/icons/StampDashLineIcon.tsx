import { StyleSheet, View } from 'react-native';

type Props = {
    color?: string;
};

export const StampDashLineIcon = ({
    color = "#DEDEDE",
}: Props) => {
    const dashHeights = [4, 6, 6, 4];

    return (
        <View style={styles.dashContainer}>
            {dashHeights.map((height, index) => (
                <View
                    key={index}
                    style={[
                        styles.dash,
                        {
                            height,
                            backgroundColor: color
                        },
                    ]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    dashContainer: {
        marginVertical: 5,
        height: 23,
        alignItems: 'center',
        gap: 1,
    },

    dash: {
        width: 2,
        borderRadius: 2,
    },
})