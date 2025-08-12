import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';

type GameStatus = 'playing' | 'won' | 'lost';

interface Props {
    words: string[];
    showSolution: boolean;
    label?: string;
}

const Hangman = ({ words, showSolution, label }: Props) => {
    const [word, setWord] = React.useState<string>('');
    const [guessedLetters, setGuessedLetters] = React.useState<string[]>([]);
    const [wrongGuesses, setWrongGuesses] = React.useState<number>(0);
    const [gameStatus, setGameStatus] = React.useState<GameStatus>('playing');

    // Initialize game
    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = (): void => {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        setWord(randomWord);
        setGuessedLetters([]);
        setWrongGuesses(0);
        setGameStatus('playing');
    };

    const handleGuess = (letter: string): void => {
        if (gameStatus !== 'playing' || guessedLetters.includes(letter)) return;

        const newGuessedLetters = [...guessedLetters, letter];
        setGuessedLetters(newGuessedLetters);

        if (!word.includes(letter)) {
            const newWrongGuesses = wrongGuesses + 1;
            setWrongGuesses(newWrongGuesses);

            if (newWrongGuesses >= 6) {
                setGameStatus('lost');
            }
        } else {
            // Check if player has won
            const isWon = word.split('').every((char) => newGuessedLetters.includes(char));
            if (isWon) {
                setGameStatus('won');
            }
        }
    };

    const renderWord = (): React.ReactNode[] => {
        return word.split('').map((letter, index) => (
            <span key={index} className={styles.letter}>
                {guessedLetters.includes(letter) ? letter : '_'}
            </span>
        ));
    };

    const renderKeyboard = (): React.ReactNode[] => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        return alphabet.map((letter) => (
            <button
                key={letter}
                className={`${styles.keyboardButton} ${guessedLetters.includes(letter) ? styles.guessed : ''}`}
                onClick={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter) || gameStatus !== 'playing'}
            >
                {letter}
            </button>
        ));
    };

    const renderHangman = (): React.ReactNode => {
        return (
            <div className={styles.hangmanDrawing}>
                {/* Base */}
                <div className={clsx(styles.base, styles.part)}></div>

                {/* Pole */}
                {wrongGuesses > 0 && <div className={clsx(styles.pole, styles.part)}></div>}

                {/* Top */}
                {wrongGuesses > 1 && <div className={clsx(styles.top, styles.part)}></div>}

                {/* Rope */}
                {wrongGuesses > 2 && <div className={clsx(styles.rope, styles.part)}></div>}

                {/* Head */}
                {wrongGuesses > 3 && <div className={clsx(styles.head, styles.part)}></div>}

                {/* Body */}
                {wrongGuesses > 4 && <div className={clsx(styles.body, styles.part)}></div>}

                {/* Arms and Legs */}
                {wrongGuesses > 5 && (
                    <>
                        <div className={clsx(styles.arms, styles.part)}></div>
                        <div className={clsx(styles.legs, styles.part)}></div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className={styles.hangmanGame}>
            <h1>{label ?? 'Hangman'}</h1>

            {renderHangman()}

            <div className={styles.wordContainer}>{renderWord()}</div>

            {gameStatus === 'won' && (
                <div className={styles.message}>Yay 🥳! Gewonnen!</div>
            )}

            {gameStatus === 'lost' && (
                <div className={clsx(styles.message, styles.lost)}>
                    Spiel vorbei 😓! {showSolution ? `Das Wort war: ${word}` : 'Erneut versuchen.'}
                </div>
            )}

            <div className={styles.keyboard}>{renderKeyboard()}</div>

            <button className={styles.newGameButton} onClick={startNewGame}>
                Neues Spiel
            </button>
        </div>
    );
};

export default Hangman;
