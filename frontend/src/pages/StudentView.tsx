import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { usePollState } from '../hooks/usePollState';
import { usePollTimer } from '../hooks/usePollTimer';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const StudentView: React.FC = () => {
    const { studentName, setStudentName } = useAuth();
    const [nameInput, setNameInput] = useState('');

    const { socket, error } = useSocket();
    const { activePoll, loading, isKicked } = usePollState(socket, studentName);
    const { remainingTime } = usePollTimer(activePoll?.startTime || null, activePoll?.duration || 0);

    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
    const [chatInput, setChatInput] = useState('');

    // Check if they previously voted based on localStorage
    useEffect(() => {
        if (activePoll) {
            const votedPoll = sessionStorage.getItem(`voted_${activePoll._id}`);
            if (votedPoll) {
                setHasVoted(true);
            } else {
                setHasVoted(false);
                setSelectedOption(null);
            }
        }
    }, [activePoll?._id]);

    useEffect(() => {
        if (error) {
            showToast(error);
            setHasVoted(false); // Revert optimistic UI
            sessionStorage.removeItem(`voted_${activePoll?._id}`);
        }
    }, [error, activePoll?._id]);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    const handleNameSubmit = () => {
        if (nameInput.trim()) {
            setStudentName(nameInput.trim());
        }
    };

    const handleVoteSubmit = () => {
        if (!selectedOption || !activePoll || !socket || isKicked) return;

        // Optimistic UI update
        setHasVoted(true);
        sessionStorage.setItem(`voted_${activePoll._id}`, 'true');

        // Emit vote
        socket.emit('submit_vote', {
            pollId: activePoll._id,
            studentName: studentName,
            selectedOption
        });
    };

    const handleSendMessage = () => {
        if (!chatInput.trim() || !socket || !activePoll || isKicked) return;
        socket.emit('send_message', {
            pollId: activePoll._id,
            senderName: studentName,
            senderRole: 'student',
            text: chatInput.trim()
        });
        setChatInput('');
    };

    if (isKicked) {
        return (
            <div className="flex-col items-center justify-center pt-[5vh]" style={{ height: '80vh' }}>
                <Header />
                <h1 style={{ fontSize: '32px', marginBottom: '8px', marginTop: '32px' }}>You've been Kicked out !</h1>
                <p style={{ color: 'var(--medium-gray)', fontSize: '14px', maxWidth: '500px', textAlign: 'center' }}>
                    Looks like the teacher had removed you from the poll system. Please Try again sometime.
                </p>
            </div>
        );
    }

    if (!studentName) {
        return (
            <div className="flex-col items-center justify-center pt-[5vh]">
                <Header />

                <div className="text-center mb-4 mt-2">
                    <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Let's <strong>Get Started</strong></h1>
                    <p style={{ color: 'var(--medium-gray)', fontSize: '14px', maxWidth: '500px' }}>
                        If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates.
                    </p>
                </div>

                <div className="flex-col items-center w-full" style={{ maxWidth: '400px', marginTop: '32px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', alignSelf: 'flex-start', paddingLeft: '24px' }}>Enter your Name</label>
                    <Input
                        placeholder="Rahul Bajaj"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        style={{ marginBottom: '24px', width: '90%', alignSelf: 'center', backgroundColor: 'var(--light-bg)', border: 'none' }}
                    />
                    <Button variant="primary" onClick={handleNameSubmit} disabled={!nameInput.trim()} style={{ padding: '12px 48px' }}>Continue</Button>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="app-container flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="app-container pt-[5vh]">
            {toastMessage && (
                <div style={{ position: 'fixed', top: '16px', right: '16px', backgroundColor: 'var(--error)', color: 'white', padding: '12px 24px', borderRadius: '4px', zIndex: 1000, fontWeight: 600 }}>
                    {toastMessage}
                </div>
            )}

            {/* No Active Poll State */}
            {(!activePoll || (activePoll.status === 'completed' && !activePoll.results)) && (
                <div className="flex-col items-center justify-center" style={{ height: '60vh' }}>
                    <Header />
                    <div style={{ marginTop: '64px', marginBottom: '32px' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid var(--primary-purple)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 600 }}>Wait for the teacher to ask questions..</h2>
                </div>
            )}

            {/* Active Poll State */}
            {activePoll && (
                <div className="flex-col items-center w-full" style={{ margin: '0 auto', maxWidth: '800px' }}>
                    <div className="flex w-full items-center gap-4 mb-4">
                        <h2 style={{ fontSize: '18px' }}>Question 1</h2>
                        {activePoll.status === 'active' && (
                            <div style={{ color: 'var(--error)', fontWeight: 600, fontSize: '14px' }}>
                                ⏱️ 00:{(remainingTime ?? 0) < 10 ? `0${remainingTime ?? 0}` : remainingTime ?? 0}
                            </div>
                        )}
                    </div>

                    <div className="flex w-full gap-4">
                        <div className="flex-1">
                            <Card className="w-full">
                                <div style={{ padding: '16px', backgroundColor: 'var(--dark-gray)', color: 'var(--white)', fontWeight: 600, fontSize: '16px' }}>
                                    {activePoll.question}
                                </div>

                                <div style={{ padding: '24px' }} className="flex-col gap-3">
                                    {activePoll.options.map((opt) => {
                                        const res = activePoll.results?.options.find(r => r.optionId === opt.id);
                                        const percentage = res ? res.percentage : 0;

                                        // Show results logic: either it's completed, or the user has already voted, or timer ran out
                                        const showResults = activePoll.status === 'completed' || hasVoted || (remainingTime ?? 0) === 0;

                                        return (
                                            <div
                                                key={opt.id}
                                                className="flex items-center"
                                                onClick={() => !showResults && setSelectedOption(opt.id)}
                                                style={{
                                                    position: 'relative',
                                                    height: '48px',
                                                    backgroundColor: 'var(--light-bg)',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                    cursor: showResults ? 'default' : 'pointer',
                                                    border: selectedOption === opt.id && !showResults ? '2px solid var(--primary-purple)' : 'none'
                                                }}
                                            >
                                                {showResults && (
                                                    <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${percentage}%`, backgroundColor: 'var(--secondary-purple)', opacity: 0.8, transition: 'width 0.3s ease' }} />
                                                )}
                                                <div className="flex justify-between w-full" style={{ position: 'relative', zIndex: 1, padding: '0 16px', fontWeight: 600, fontSize: '14px' }}>
                                                    <span style={{ color: (showResults && percentage > 50) ? 'var(--white)' : 'var(--dark-gray)' }}>
                                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-purple)', color: 'white', marginRight: '8px', fontSize: '12px' }}>{opt.id}</span>
                                                        {opt.text}
                                                    </span>
                                                    {showResults && (
                                                        <span style={{ color: (percentage > 50) ? 'var(--white)' : 'var(--dark-gray)' }}>{percentage}%</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            {(activePoll.status === 'active' && !hasVoted && (remainingTime ?? 0) > 0) && (
                                <div className="flex justify-end w-full mt-4">
                                    <Button variant="primary" onClick={handleVoteSubmit} disabled={!selectedOption} style={{ padding: '12px 48px' }}>Submit</Button>
                                </div>
                            )}

                            {(!activePoll || activePoll.status === 'completed') && (
                                <div className="text-center mt-8">
                                    <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Wait for the teacher to ask a new question..</h3>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Chat Panel for Student */}
                    {isChatOpen && (
                        <Card style={{ width: '300px', display: 'flex', flexDirection: 'column', position: 'fixed', right: '32px', bottom: '100px', zIndex: 1000, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', height: '400px' }}>
                            <div className="flex justify-between p-3" style={{ borderBottom: '1px solid #E0E0E0', padding: '12px 16px' }}>
                                <div className="flex gap-4">
                                    <span
                                        style={{ fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: activeTab === 'chat' ? 'var(--primary-purple)' : 'var(--medium-gray)', borderBottom: activeTab === 'chat' ? '2px solid var(--primary-purple)' : 'none' }}
                                        onClick={() => setActiveTab('chat')}
                                    >Chat</span>
                                    <span
                                        style={{ fontWeight: 600, fontSize: '14px', cursor: 'pointer', color: activeTab === 'participants' ? 'var(--primary-purple)' : 'var(--medium-gray)', borderBottom: activeTab === 'participants' ? '2px solid var(--primary-purple)' : 'none' }}
                                        onClick={() => setActiveTab('participants')}
                                    >Participants</span>
                                </div>
                                <span style={{ cursor: 'pointer', fontSize: '14px' }} onClick={() => setIsChatOpen(false)}>✕</span>
                            </div>

                            <div style={{ padding: '16px', flex: 1, height: '300px', overflowY: 'auto' }}>
                                {activeTab === 'chat' ? (
                                    <div className="flex-col gap-3">
                                        {activePoll.chatMessages?.map(msg => (
                                            <div key={msg._id} className={msg.senderName === studentName ? 'text-right' : ''}>
                                                <div style={{ fontSize: '10px', color: 'var(--primary-purple)', marginBottom: '4px' }}>{msg.senderName}</div>
                                                <div style={{
                                                    backgroundColor: msg.senderName === studentName ? 'var(--primary-purple)' : 'var(--dark-gray)',
                                                    color: 'white',
                                                    padding: '8px 12px',
                                                    borderRadius: msg.senderName === studentName ? '8px 0 8px 8px' : '0 8px 8px 8px',
                                                    fontSize: '12px',
                                                    display: 'inline-block'
                                                }}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-col gap-2">
                                        <div className="flex justify-between mb-2">
                                            <span style={{ fontSize: '12px', color: 'var(--medium-gray)', fontWeight: 600 }}>Name</span>
                                        </div>
                                        {activePoll.participants?.filter(p => p.status === 'active').map(p => (
                                            <div key={p._id} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 600 }}>{p.name} {p.name === studentName ? '(You)' : ''}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {activeTab === 'chat' && (
                                <div style={{ padding: '12px', borderTop: '1px solid #E0E0E0', display: 'flex', gap: '8px' }}>
                                    <input
                                        style={{ flex: 1, padding: '8px 12px', borderRadius: '4px', border: '1px solid #E0E0E0', fontSize: '12px' }}
                                        placeholder="Type message..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <button onClick={handleSendMessage} style={{ backgroundColor: 'var(--primary-purple)', color: 'white', borderRadius: '4px', padding: '0 12px', fontSize: '12px', fontWeight: 600 }}>Send</button>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            )}

            {!isChatOpen && activePoll && (
                <div style={{ position: 'fixed', bottom: '32px', right: '32px', cursor: 'pointer', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setIsChatOpen(true)}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>💬</div>
                    <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px', backgroundColor: 'white', padding: '4px 8px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Open Chat</span>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
        </div>
    );
};

export default StudentView;
