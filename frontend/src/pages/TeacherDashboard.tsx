import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { usePollState } from '../hooks/usePollState';
import { usePollTimer } from '../hooks/usePollTimer';
import Header from '../components/Header';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const TeacherDashboard: React.FC = () => {
    const { socket } = useSocket();
    const { activePoll, loading } = usePollState(socket);
    const { remainingTime } = usePollTimer(activePoll?.startTime || null, activePoll?.duration || 0);

    const [question, setQuestion] = useState('');
    const [duration, setDuration] = useState(60);
    const [options, setOptions] = useState([{ id: '1', text: '', isCorrect: false }, { id: '2', text: '', isCorrect: false }]);
    const [viewHistory, setViewHistory] = useState(false);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);

    // New state for right panel
    const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
    const [chatInput, setChatInput] = useState('');

    useEffect(() => {
        if (viewHistory) {
            fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/polls/history`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setHistoryData(data.data);
                    }
                });
        }
    }, [viewHistory]);

    const handleAddOption = () => {
        setOptions([...options, { id: String(options.length + 1), text: '', isCorrect: false }]);
    };

    const handleOptionChange = (id: string, text: string) => {
        setOptions(options.map(o => o.id === id ? { ...o, text } : o));
    };

    const handleOptionCorrectChange = (id: string, isCorrect: boolean) => {
        setOptions(options.map(o => o.id === id ? { ...o, isCorrect } : o));
    };

    const handleCreatePoll = () => {
        if (!question || options.some(o => !o.text)) {
            alert("Please fill all fields");
            return;
        }
        if (!options.some(o => o.isCorrect)) {
            alert("You must mark at least one option as correct.");
            return;
        }
        if (socket) {
            socket.emit('create_poll', { question, options, duration });
        }
    };

    const handleSendMessage = () => {
        if (!chatInput.trim() || !socket || !activePoll) return;
        socket.emit('send_message', {
            pollId: activePoll._id,
            senderName: 'Teacher',
            senderRole: 'teacher',
            text: chatInput.trim()
        });
        setChatInput('');
    };

    const handleKickUser = (studentName: string) => {
        if (!socket || !activePoll) return;
        if (window.confirm(`Are you sure you want to kick out ${studentName}?`)) {
            socket.emit('kick_user', { pollId: activePoll._id, studentName });
        }
    };

    if (loading) {
        return <div className="app-container flex items-center justify-center">Loading...</div>;
    }

    if (viewHistory) {
        return (
            <div className="app-container">
                <div className="flex justify-between items-center mb-4">
                    <h2 style={{ fontSize: '24px' }}>View <strong>Poll History</strong></h2>
                    <Button variant="outline" onClick={() => setViewHistory(false)}>Back to Active</Button>
                </div>

                <div className="flex-col gap-4">
                    {historyData.map((poll: any, idx: number) => (
                        <div key={poll._id} className="mb-4">
                            <h3 className="mb-2" style={{ fontSize: '16px', fontWeight: 600 }}>Question {idx + 1}</h3>
                            <Card>
                                <div style={{ padding: '16px', backgroundColor: 'var(--dark-gray)', color: 'var(--white)', fontWeight: 600 }}>
                                    {poll.question}
                                </div>
                                <div style={{ padding: '16px' }} className="flex-col gap-2">
                                    {poll.options.map((opt: any) => {
                                        const res = poll.results?.options.find((r: any) => r.optionId === opt.id);
                                        const percentage = res ? res.percentage : 0;
                                        return (
                                            <div key={opt.id} className="flex items-center" style={{ position: 'relative', height: '48px', backgroundColor: 'var(--light-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${percentage}%`, backgroundColor: 'var(--secondary-purple)', opacity: 0.8 }} />
                                                <div className="flex justify-between w-full" style={{ position: 'relative', zIndex: 1, padding: '0 16px', fontWeight: 600 }}>
                                                    <span style={{ color: percentage > 50 ? 'var(--white)' : 'var(--dark-gray)' }}>{opt.id}  {opt.text}</span>
                                                    <span style={{ color: percentage > 50 ? 'var(--white)' : 'var(--dark-gray)' }}>{percentage}%</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (activePoll && activePoll.status === 'active') {

        const activeParticipants = activePoll.participants?.filter(p => p.status === 'active') || [];
        const totalVotes = activePoll.results?.options.reduce((acc, opt) => acc + opt.count, 0) || 0;
        const allVoted = activeParticipants.length > 0 && totalVotes >= activeParticipants.length;
        const isPollFinished = (remainingTime ?? 0) === 0 || allVoted || (activePoll as any).status === 'completed';

        const handleEndPoll = async () => {
            try {
                // If API integration exists to end it remotely, call it here
                window.location.reload();
            } catch (error) {
                console.error("Failed to end poll:", error);
            }
        };

        return (
            <div className="app-container">
                <div className="flex justify-between mb-2">
                    <Header />
                    <Button variant="primary" onClick={() => setViewHistory(true)}>View Poll history</Button>
                </div>

                <div className="flex items-center gap-4 mb-2">
                    <h2 style={{ fontSize: '20px' }}>Question 1</h2>
                    <div style={{ color: 'var(--error)', fontWeight: 600, fontSize: '14px' }}>⏱️ 00:{remainingTime !== null ? (remainingTime < 10 ? `0${remainingTime}` : remainingTime) : '00'}</div>
                </div>

                <div className="flex gap-4">
                    <Card className="flex-1">
                        <div style={{ padding: '16px', backgroundColor: 'var(--dark-gray)', color: 'var(--white)', fontWeight: 600, fontSize: '16px' }}>
                            {activePoll.question}
                        </div>
                        <div style={{ padding: '24px' }} className="flex-col gap-3">
                            {activePoll.options.map((opt) => {
                                const res = activePoll.results?.options.find(r => r.optionId === opt.id);
                                const percentage = res ? res.percentage : 0;
                                return (
                                    <div key={opt.id} className="flex items-center" style={{ position: 'relative', height: '48px', backgroundColor: 'var(--light-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${percentage}%`, backgroundColor: 'var(--secondary-purple)', opacity: 0.8, transition: 'width 0.3s ease' }} />
                                        <div className="flex justify-between w-full" style={{ position: 'relative', zIndex: 1, padding: '0 16px', fontWeight: 600, fontSize: '14px' }}>
                                            <span style={{ color: percentage > 50 ? 'var(--white)' : 'var(--dark-gray)' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-purple)', color: 'white', marginRight: '8px', fontSize: '12px' }}>{opt.id}</span>
                                                {opt.text}
                                            </span>
                                            <span style={{ color: percentage > 50 ? 'var(--white)' : 'var(--dark-gray)' }}>{percentage}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {isPollFinished && (
                    <div className="flex flex-col gap-4 mt-4" style={{ width: '250px' }}>
                        <Button
                            variant="primary"
                            onClick={handleEndPoll}
                            style={{ padding: '12px', width: '100%', backgroundColor: 'var(--white)', color: 'var(--primary-purple)', border: '1px solid var(--primary-purple)' }}
                        >Ask New Question</Button>
                    </div>
                )}

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
                                        <div key={msg._id} className={msg.senderRole === 'teacher' ? 'text-right' : ''}>
                                            <div style={{ fontSize: '10px', color: 'var(--primary-purple)', marginBottom: '4px' }}>{msg.senderName}</div>
                                            <div style={{
                                                backgroundColor: msg.senderRole === 'teacher' ? 'var(--primary-purple)' : 'var(--dark-gray)',
                                                color: 'white',
                                                padding: '8px 12px',
                                                borderRadius: msg.senderRole === 'teacher' ? '8px 0 8px 8px' : '0 8px 8px 8px',
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
                                        <span style={{ fontSize: '12px', color: 'var(--medium-gray)', fontWeight: 600 }}>Action</span>
                                    </div>
                                    {activePoll.participants?.filter(p => p.status === 'active').map(p => (
                                        <div key={p._id} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{p.name}</span>
                                            <span
                                                style={{ fontSize: '12px', color: '#5767D0', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                                                onClick={() => handleKickUser(p.name)}
                                            >Kick out</span>
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

                {!isChatOpen && (
                    <div style={{ position: 'fixed', bottom: '32px', right: '32px', cursor: 'pointer', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={() => setIsChatOpen(true)}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>💬</div>
                        <span style={{ fontSize: '12px', fontWeight: 600, marginTop: '8px', backgroundColor: 'white', padding: '4px 8px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Open Chat</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="app-container pt-[5vh]">
            <Header />

            <div className="mb-4 mt-2">
                <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Let's <strong>Get Started</strong></h1>
                <p style={{ color: 'var(--medium-gray)', fontSize: '14px' }}>you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.</p>
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <label style={{ fontWeight: 600, fontSize: '14px' }}>Enter your question</label>
                    <select
                        style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', backgroundColor: 'var(--light-bg)', fontSize: '12px', fontWeight: 600 }}
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                    >
                        <option value={30}>30 seconds</option>
                        <option value={60}>60 seconds</option>
                        <option value={90}>90 seconds</option>
                    </select>
                </div>
                <textarea
                    placeholder="Type your question here"
                    style={{ height: '100px', backgroundColor: 'var(--light-bg)', border: 'none' }}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                <div className="text-right" style={{ fontSize: '12px', color: 'var(--medium-gray)', marginTop: '-24px', marginRight: '16px' }}>0/100</div>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="flex-1">
                    <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>Edit Options</label>
                    <div className="flex-col gap-2">
                        {options.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-2">
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-purple)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>{opt.id}</div>
                                <Input
                                    value={opt.text}
                                    onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                                    placeholder={`Option ${opt.id}`}
                                    style={{ backgroundColor: 'var(--light-bg)', border: 'none' }}
                                />
                            </div>
                        ))}
                        <div>
                            <button
                                onClick={handleAddOption}
                                style={{ color: 'var(--primary-purple)', backgroundColor: 'transparent', border: '1px solid var(--primary-purple)', padding: '4px 12px', fontSize: '12px', fontWeight: 600, marginTop: '8px' }}
                            >+ Add More option</button>
                        </div>
                    </div>
                </div>

                <div style={{ width: '200px' }}>
                    <label style={{ fontWeight: 600, fontSize: '14px', display: 'block', marginBottom: '8px' }}>Is it Correct?</label>
                    <div className="flex-col gap-2 mt-2">
                        {options.map((opt) => (
                            <div key={opt.id} className="flex gap-2 items-center" style={{ height: '42px' }}>
                                <label className="flex items-center gap-1" style={{ fontSize: '12px', fontWeight: 600 }}>
                                    <input
                                        type="radio"
                                        name={`correct-${opt.id}`}
                                        checked={opt.isCorrect}
                                        onChange={() => handleOptionCorrectChange(opt.id, true)}
                                    /> Yes
                                </label>
                                <label className="flex items-center gap-1" style={{ fontSize: '12px', fontWeight: 600 }}>
                                    <input
                                        type="radio"
                                        name={`correct-${opt.id}`}
                                        checked={!opt.isCorrect}
                                        onChange={() => handleOptionCorrectChange(opt.id, false)}
                                    /> No
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end mt-4 pt-4" style={{ borderTop: '1px solid #E0E0E0' }}>
                <Button variant="primary" onClick={handleCreatePoll} style={{ padding: '12px 32px' }}>Ask Question</Button>
            </div>
        </div>
    );
};

export default TeacherDashboard;
