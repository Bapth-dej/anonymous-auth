import React, { useEffect } from 'react';

export const AddFirebaseUpdate = PlayerComponent => props => {
    useEffect(() => {
        console.log("I'm alive !");
    });

    return <PlayerComponent {...props} />;
};
