import React from 'react';

const Custombutton = ({title, onpress}) => {
    return(
        <TouchableOpacitity onPress={onpress}>
            <Text>{title}</Text>
        </TouchableOpacitity>

    );

};