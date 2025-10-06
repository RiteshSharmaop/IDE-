import React from 'react'
import FuzzyText from '../components/FuzzyText';

const NotFound = () => {
    return (

        <FuzzyText
            baseIntensity={0.2}
            hoverIntensity={hoverIntensity}
            enableHover={enableHover}
        >
            404
        </FuzzyText>
    )
}

export default NotFound