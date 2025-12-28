import React from 'react';
import { useGameStore } from '../../stores/game.store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const ProtocolView = () => {
    const { gameState, queueEvent } = useGameStore();
    
    if (!gameState || !gameState.protocol.isUnlocked) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <h2>🔒 PROTOCOL LOCKED</h2>
                <Button disabled={gameState.protocolLevel < 50} onClick={() => queueEvent({ type: 'PROTOCOL_UNLOCK', timestamp: Date.now() })}>INITIALIZE PAL</Button>
            </div>
        );
    }

    const { activeChain, chainResources } = gameState.protocol;
    const isPoW = activeChain === 'HybridPoW';
    const isPPoS = activeChain === 'PPoS';

    return (
        <div style={{ padding: '16px', background: '#050505', minHeight: '100%' }}>
            <div style={{ borderBottom: '1px solid #333', paddingBottom: '16px', marginBottom: '16px' }}>
                <h1 style={{ color: '#00ffcc', margin: 0 }}>PROTOCOL ASCENSION</h1>
                <small style={{ color: '#666' }}>PHASE {gameState.protocol.phaseIndex}: {activeChain}</small>
            </div>
            <Card>
                <h3>Active Chain Control</h3>
                {isPoW && (
                    <>
                        <p>Current Hash Rate: {(chainResources.currentHashRate / 10000).toFixed(2)} TH/s</p>
                        <ProgressBar value={chainResources.currentHashRate} max={1000000 * 10000} />
                        <div style={{ marginTop: '16px' }}>
                            <Button onClick={() => queueEvent({ type: 'PROTOCOL_FORK', timestamp: Date.now(), forkType: 'GENESIS' })} disabled={chainResources.currentHashRate < 1000000 * 10000}>EXECUTE GENESIS FORK</Button>
                        </div>
                    </>
                )}
                {isPPoS && (
                    <>
                        <p>Privacy Score: {(chainResources.privacyScore / 10000).toFixed(2)}</p>
                        <Button variant="outline" onClick={() => queueEvent({ type: 'PROTOCOL_INTERACTION', timestamp: Date.now(), action: 'MIX_Privacy' })}>MANUAL MIX (+100)</Button>
                        <div style={{ marginTop: '16px' }}>
                            <Button onClick={() => queueEvent({ type: 'PROTOCOL_FORK', timestamp: Date.now(), forkType: 'REGULATORY' })} disabled={chainResources.privacyScore < 500000 * 10000}>EXECUTE REGULATORY FORK</Button>
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
};
