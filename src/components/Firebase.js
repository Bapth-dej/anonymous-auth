import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { firebaseConfig } from '../firebaseConfig';

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
    const [secondPlayerId, setSecondPlayerId] = useState('');
    const [shortUid, setShortUid] = useState('');

    useEffect(() => {
        const unsubscribeMethod = firebase.auth().onAuthStateChanged(user => setUser(!!user ? user : {}));
        return unsubscribeMethod;
    }, []);

    const handleCreateOrJoin = joinGame => async () => {
        try {
            const {
                user: { uid }
            } = await firebase.auth().signInAnonymously();
            if (joinGame) {
                const short = uid.substring(0, 6);
                await firebase
                    .firestore()
                    .collection('awaiting')
                    .doc(short)
                    .set({ uid });
                setShortUid(short);
            }
            setInterfaceState(joinGame ? INTERFACE_STATES.JOIN : INTERFACE_STATES.CREATE);
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleStartGame = isRight => async () => {
        try {
            const doc = await firebase
                .firestore()
                .collection('awaiting')
                .doc(secondPlayerId)
                .get();
            const adversoryUid = doc.data().uid;
            await firebase
                .firestore()
                .collection('sessions')
                .doc(adversoryUid)
                .set({ rightPlayer: isRight ? user.uid : adversoryUid, leftPlayer: isRight ? adversoryUid : user.uid });
        } catch (error) {
            console.log(error);
        }
    };

    const handleLogOut = () => {
        firebase
            .auth()
            .signOut()
            .catch(error => {
                console.log(error.message);
            });
    };

    const handleTestClick = () => {
        firebase
            .firestore()
            .collection('awaiting')
            .doc('SF')
            .onSnapshot(function(doc) {
                console.log('Current data: ', doc.data());
            });
    };

    switch (interfaceState) {
        case INTERFACE_STATES.CREATE:
            return (
                <>
                    <p>
                        <input
                            type="text"
                            value={secondPlayerId}
                            onChange={({ target: { value } }) => setSecondPlayerId(value)}
                        />
                    </p>
                    <button onClick={handleStartGame(false)}>Left</button>
                    <button onClick={handleStartGame(true)}>Right</button>
                </>
            );
        case INTERFACE_STATES.JOIN:
            return <p>{shortUid}</p>;
        default:
            return (
                <div className="firebase">
                    <button onClick={handleCreateOrJoin(false)}>Create</button>{' '}
                    <button onClick={handleCreateOrJoin(true)}>Join</button>
                    <button onClick={handleTestClick}>Test</button>
                </div>
            );
    }
};
