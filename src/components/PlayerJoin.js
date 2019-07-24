import React, { useEffect, useState } from 'react';
import firebase from 'firebase';

export const PlayerJoin = ({ user }) => {
    const [opponentShort, setOpponentShort] = useState('');
    const [opponentUid, setOpponentUid] = useState('');
    const [gameInfo, setGameInfo] = useState({});

    const createSession = async () => {
        await firebase
            .firestore()
            .collection('sessions')
            .doc(opponentUid)
            .set({ players: [opponentUid, user.uid] });
    };

    useEffect(() => {
        if (!!opponentUid) {
            try {
                createSession();
                const unsubscribeSnapshot = firebase
                    .firestore()
                    .collection('sessions')
                    .doc(opponentUid)
                    .onSnapshot(doc => {
                        handleSnapshot(doc);
                    });
                return unsubscribeSnapshot;
            } catch (error) {
                console.log(error);
            }
        }
    }, [opponentUid]);

    const handleSnapshot = doc => {
        setGameInfo(doc.data() || {});
    };

    const handleJoin = async () => {
        try {
            const doc = await firebase
                .firestore()
                .collection('awaiting')
                .doc(opponentShort)
                .get();
            setOpponentUid(doc.data().uid);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="PlayerJoin">
            {!!Object.keys(gameInfo).length && gameInfo.isCreatorRightSide !== undefined ? (
                <p>Side: {gameInfo.isCreatorRightSide ? 'left' : 'right'}</p>
            ) : !gameInfo.players ? (
                <>
                    <p>
                        <input
                            type="text"
                            value={opponentShort}
                            onChange={({ target: { value } }) => setOpponentShort(value)}
                        />
                    </p>
                    <button onClick={handleJoin}>Join</button>
                </>
            ) : (
                <p>Waiting for other player to start game.</p>
            )}
        </div>
    );
};
