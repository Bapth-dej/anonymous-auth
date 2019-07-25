import React, { useEffect, useState } from 'react';
import firebase from 'firebase';

export const PlayerCreate = ({ user }) => {
    const [shortUid, setShortUid] = useState('');
    const [gameInfo, setGameInfo] = useState({});

    const handleShort = async () => {
        const short = user.uid.substring(0, 6);
        await firebase
            .firestore()
            .collection('awaiting')
            .doc(short)
            .set({ uid: user.uid });
        await firebase
            .firestore()
            .collection('sessions')
            .doc(user.uid)
            .set({});
        setShortUid(short);
    };

    useEffect(() => {
        try {
            handleShort();
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        if (shortUid && user.uid) {
            try {
                const unsubscribeSnapshot = firebase
                    .firestore()
                    .collection('sessions')
                    .doc(user.uid)
                    .onSnapshot(doc => {
                        handleSnapshot(doc);
                    });
                return unsubscribeSnapshot;
            } catch (error) {
                console.log('Snapshot', error);
            }
        }
    }, [shortUid]);

    const handleStartGame = isRightSide => async () => {
        firebase
            .firestore()
            .collection('sessions')
            .doc(user.uid)
            .update({ isCreatorRightSide: isRightSide });
    };

    const handleSnapshot = doc => {
        const data = doc.data() || {};
        setGameInfo(data);
        if (data.players && data.players.includes(user.uid)) {
            firebase
                .firestore()
                .collection('awaiting')
                .doc(shortUid)
                .delete();
        }
    };

    return (
        <div className="PlayerCreate">
            {!!Object.keys(gameInfo).length && gameInfo.isCreatorRightSide !== undefined ? (
                <p>Side: {gameInfo.isCreatorRightSide ? 'right' : 'left'}</p>
            ) : !gameInfo.players ? (
                <p>{shortUid || null}</p>
            ) : (
                <>
                    <button onClick={handleStartGame(false)}>Left</button>
                    <button onClick={handleStartGame(true)}>Right</button>
                </>
            )}
        </div>
    );
};
