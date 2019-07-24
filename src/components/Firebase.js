import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';
import { PlayerJoin } from './PlayerJoin';
import { PlayerCreate } from './PlayerCreate';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const Firebase = () => {
    const INTERFACE_STATES = {
        HOME: 'HOME',
        CREATE: 'CREATE',
        JOIN: 'JOIN'
    };

    const [user, setUser] = useState({});
    const [interfaceState, setInterfaceState] = useState(INTERFACE_STATES.HOME);

    useEffect(() => {
        const unsubscribeAuth = firebase.auth().onAuthStateChanged(user => {
            if (user) {
                setUser(user);
                firebase
                    .firestore()
                    .collection('sessions')
                    .doc(user.uid)
                    .delete();
            } else {
                setUser({});
            }
        });
        return unsubscribeAuth;
    }, []);

    const handleCreateOrJoin = joinGame => async () => {
        try {
            const { user } = await firebase.auth().signInAnonymously();
            setUser(user);
            setInterfaceState(joinGame ? INTERFACE_STATES.JOIN : INTERFACE_STATES.CREATE);
        } catch (error) {
            console.log(error.message);
        }
    };

    switch (interfaceState) {
        case INTERFACE_STATES.CREATE:
            return <PlayerCreate user={user} />;
        case INTERFACE_STATES.JOIN:
            return <PlayerJoin user={user} />;
        default:
            return (
                <div className="firebase">
                    <button onClick={handleCreateOrJoin(false)}>Create</button>{' '}
                    <button onClick={handleCreateOrJoin(true)}>Join</button>
                </div>
            );
    }
};
