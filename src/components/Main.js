import React from 'react';
import Die from './Die';
import { nanoid } from 'nanoid';
import Confetti from 'react-confetti';
export default function Main() {

    const [dice, setDice] = React.useState(allNewDice);
    const [tenzies, setTenzies] = React.useState(false);
    const [rollCounter, setRollCounter] = React.useState(0);
    const [clock, setClock] = React.useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    })
    const [intervalId, setIntervalId] = React.useState(0);
    const [stats, setStats] = React.useState(() => JSON.parse(localStorage.getItem('stats')) || []);

    React.useEffect(() => {
        const firstVal = dice[0].value;
        const won = dice.every(die => die.isHeld && die.value === firstVal);
        if (won) setTenzies(true);
    }, [dice]);

    React.useEffect(() => {
        function initializeClock() {
            setClock(prevClock => {
                if (prevClock.seconds < 60) return { ...prevClock, seconds: prevClock.seconds + 1 }
                else if (prevClock.minutes < 60) return { ...prevClock, minutes: prevClock.minutes + 1, seconds: 0 }
                else return { hours: prevClock.hours + 1, minutes: 0, seconds: 0 }
            })
        }
        if (!tenzies) {
            setIntervalId(window.setInterval(initializeClock, 1000));
        } else {
            window.clearInterval(intervalId);
        }
    }, [tenzies]);

    function generateNewDie() {
        return {
            value: Math.ceil(Math.random() * 6),
            isHeld: false,
            id: nanoid()
        }
    }

    function allNewDice() {
        const newDice = [];
        for (let i = 0; i < 10; i++) {
            newDice.push(generateNewDie());
        }
        return newDice;
    }

    function holdDice(id) {
        setDice(prevDice => prevDice.map(die => {
                return die.id === id ?
                    { ...die, isHeld: !die.isHeld } :
                    die
            }))
    }

    const diceElement = dice.map(die => (
        <Die
            key={die.id}
            value={die.value}
            isHeld={die.isHeld}
            hold={() => holdDice(die.id)}
        />
    ));

    function displayClock() {
        return `${clock.hours < 10 ? '0' : ''}${clock.hours}:${clock.minutes < 10 ? '0' : ''}${clock.minutes}:${clock.seconds < 10 ? '0' : ''}${clock.seconds}`
    }

    function checkLocalStorage() {
        //Local storage is used to save the best time and roll counter
        const prevStats = JSON.parse(localStorage.getItem('stats')); 
        if (prevStats) {
            //If local storage is NOT empty
            //Get clock from prevStats
            let hoursNum = Number(prevStats[0].split(':')[0]);
            let minutesNum = Number(prevStats[0].split(':')[1]);
            let secondsNum = Number(prevStats[0].split(':')[2]);
            //Get rollCounter from prevStats
            let rollCounterNum = Number(prevStats[1]);
            
            //If current time is better than the previous one AND the current roll counter is better than the previous one
            if ((clock.hours < hoursNum || clock.minutes < minutesNum || clock.seconds < secondsNum) && (rollCounter <= rollCounterNum)) {
                //Set new time and new roll counter
                setStats([displayClock(), `${rollCounter}`]);
                localStorage.setItem('stats', JSON.stringify([displayClock(), rollCounter]))
            } 

        } else {
            //If local storage is empty
            setStats([displayClock(), `${rollCounter}`]);
            localStorage.setItem('stats', JSON.stringify([displayClock(), `${rollCounter}`]));
        }

        //Reset roll counter and clock
        setRollCounter(0);
        setClock({ hours: 0, minutes: 0, seconds: 0 });
    }

    function newGame() {
        setDice(allNewDice);
        setClock({ hours: 0, minutes: 0, seconds: 0 });
        setRollCounter(0);
    }
    
    function rollDice() {
        if (tenzies) {
            setDice(allNewDice); 
            setTenzies(false);
            checkLocalStorage()
        } else {
            setRollCounter(prevRollCounter => prevRollCounter + 1);
            setDice(prevDice => prevDice.map(die => {
                return die.isHeld ?
                    die :
                    generateNewDie() 
            }));
        }
    }

    return (
        <main className="tenzies">
            {tenzies && <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
            />}
            <div className='tenzies__instructions'>
                <h1>Tenzies</h1>
                <p>Roll until all dice are the same. Click each die to freeze it at its current value between rolls.</p>
            </div>
            <div className='tenzies__grid'>
                {diceElement}
            </div>
            <div className='tenzies__buttons'>
                <button className='tenzies__button' onClick={rollDice}>{tenzies ? 'New game' : 'Roll'}</button>
                {!tenzies && <button className='tenzies__button' onClick={newGame}>New game</button>}
            </div>
            <div className='tenzies__stats'>
                <div className='tenzies__group'>
                    <p><span>Time elapsed:</span> <span>{displayClock()}</span></p>
                    <p><span>Roll counter:</span> <span>{rollCounter}</span></p>
                </div>
                <div className='tenzies__group'>
                    <small><span>Best time:</span> <span>{stats.length > 0 ? stats[0] : '00:00:00'}</span></small>
                    <small><span>Best counter:</span> <span>{stats.length > 0 ? stats[1] : '0'}</span></small>
                </div>
            </div>
        </main>
    )
}