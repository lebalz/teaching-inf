import React, { useState, useEffect } from 'react';
import styles from './styles.module.scss';

type Player = 'X' | 'O' | null;
type Board = Player[];
type GameState = 'playing' | 'draw' | 'X-won' | 'O-won';

interface MoveEvaluation {
    index: number;
    score: number;
    isOptimal: boolean;
    resultingBoard: Board;
    nextMoves?: MoveEvaluation[]; // Für rekursive Visualisierung
}

const MOVE_COORINATES = ['C1', 'C2', 'C3', 'B1', 'B2', 'B3', 'A1', 'A2', 'A3'];

const MinMaxTicTacToe: React.FC = () => {
    const [board, setBoard] = useState<Board>(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState<boolean>(true);
    const [gameState, setGameState] = useState<GameState>('playing');
    const [possibleMoves, setPossibleMoves] = useState<MoveEvaluation[]>([]);
    const [selectedMoveIndex, setSelectedMoveIndex] = useState<number | null>(null);
    const [visualizationPath, setVisualizationPath] = useState<number[]>([]);
    const [aiAutoPlay, setAiAutoPlay] = useState<boolean>(false);
    const [aiThinking, setAiThinking] = useState<boolean>(false);
    const [showVisualization, setShowVisualization] = useState<boolean>(false);

    const checkWinner = (board: Board): Player => {
        const lines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8], // Zeilen
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8], // Spalten
            [0, 4, 8],
            [2, 4, 6] // Diagonalen
        ];

        for (const [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }

        return null;
    };

    const isBoardFull = (board: Board): boolean => {
        return board.every((cell) => cell !== null);
    };

    const getGameState = (board: Board): GameState => {
        const winner = checkWinner(board);
        if (winner === 'X') return 'X-won';
        if (winner === 'O') return 'O-won';
        if (isBoardFull(board)) return 'draw';
        return 'playing';
    };

    const minimax = (board: Board, depth: number, isMaximizing: boolean): number => {
        const winner = checkWinner(board);

        if (winner === 'O') return 10 - depth; // KI gewinnt
        if (winner === 'X') return depth - 10; // Spieler gewinnt
        if (isBoardFull(board)) return 0; // Unentschieden

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    const newBoard = [...board];
                    newBoard[i] = 'O';
                    const score = minimax(newBoard, depth + 1, false);
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === null) {
                    const newBoard = [...board];
                    newBoard[i] = 'X';
                    const score = minimax(newBoard, depth + 1, true);
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    // Generiere alle möglichen nächsten KI-Züge mit Visualisierung
    const generatePossibleMoves = (
        currentBoard: Board,
        depth: number = 0,
        maxDepth: number = 2
    ): MoveEvaluation[] => {
        if (depth >= maxDepth) return [];

        const moves: MoveEvaluation[] = [];
        let bestScore = -Infinity; // KI (O) versucht zu maximieren
        let bestMoveIndex = -1;

        // Für jedes leere Feld auf dem Brett
        for (let i = 0; i < currentBoard.length; i++) {
            if (currentBoard[i] === null) {
                // Simuliere KI-Zug
                const newBoard = [...currentBoard];
                newBoard[i] = 'O'; // KI ist immer O

                const state = getGameState(newBoard);
                let score: number;

                if (state === 'playing') {
                    // Führe Minimax für tiefere Auswertung fort
                    score = minimax(newBoard, depth, false); // false = nächster Zug ist Spieler (X)
                } else if (state === 'draw') {
                    score = 0;
                } else if (state === 'O-won') {
                    score = 10 - depth;
                } else {
                    // X-won, sollte nicht passieren bei KI-Zug
                    score = depth - 10;
                }

                // Erfasse die Auswertung
                const moveEval: MoveEvaluation = {
                    index: i,
                    score,
                    isOptimal: false,
                    resultingBoard: newBoard
                };

                // Generiere nächste Zugmöglichkeiten für den Spieler, wenn wir nicht zu tief sind
                if (depth < maxDepth - 1 && state === 'playing') {
                    const opponentMoves: MoveEvaluation[] = [];

                    // Für jeden möglichen Spielerzug nach diesem KI-Zug
                    for (let j = 0; j < newBoard.length; j++) {
                        if (newBoard[j] === null) {
                            const opponentBoard = [...newBoard];
                            opponentBoard[j] = 'X'; // Spielerzug

                            const opponentState = getGameState(opponentBoard);
                            let opponentScore: number;

                            if (opponentState === 'playing') {
                                // Weitere Minimax-Analyse nach Spielerzug
                                opponentScore = minimax(opponentBoard, depth + 1, true); // true = KI maximiert
                            } else if (opponentState === 'draw') {
                                opponentScore = 0;
                            } else if (opponentState === 'O-won') {
                                opponentScore = 10 - (depth + 1);
                            } else {
                                // X-won
                                opponentScore = depth + 1 - 10;
                            }

                            opponentMoves.push({
                                index: j,
                                score: opponentScore,
                                isOptimal: false, // Wird später gesetzt
                                resultingBoard: opponentBoard
                            });
                        }
                    }

                    // Markiere den optimalen Spielerzug (minimaler Wert für X)
                    if (opponentMoves.length > 0) {
                        let bestOpponentScore = Infinity;
                        let bestOpponentIndex = -1;

                        for (let j = 0; j < opponentMoves.length; j++) {
                            if (opponentMoves[j].score < bestOpponentScore) {
                                bestOpponentScore = opponentMoves[j].score;
                                bestOpponentIndex = j;
                            }
                        }

                        if (bestOpponentIndex !== -1) {
                            opponentMoves[bestOpponentIndex].isOptimal = true;
                        }
                    }

                    moveEval.nextMoves = opponentMoves;
                }

                moves.push(moveEval);

                // Prüfe ob dies der beste KI-Zug ist (maximaler Wert)
                if (score > bestScore) {
                    bestScore = score;
                    bestMoveIndex = moves.length - 1;
                }
            }
        }

        // Markiere optimalen KI-Zug
        if (bestMoveIndex !== -1) {
            moves[bestMoveIndex].isOptimal = true;
        }

        return moves;
    };

    const evaluateAIMoves = () => {
        // Generiere den Zugbaum für die KI (O)
        const aiMoves = generatePossibleMoves(board, 0, 3);
        setPossibleMoves(aiMoves);
        setSelectedMoveIndex(null);
        setVisualizationPath([]);
        setShowVisualization(true); // Zeige die Visualisierung an
    };

    const makeAIMove = () => {
        if (gameState !== 'playing' || isXNext) return;

        setAiThinking(true);

        // Analysiere und visualisiere die KI-Optionen
        evaluateAIMoves();

        // Finde den optimalen KI-Zug
        const aiMoves = generatePossibleMoves(board, 0, 1);
        const optimalMove = aiMoves.find((move) => move.isOptimal);

        if (optimalMove) {
            // Verzögerung, damit der Benutzer sehen kann, was die KI "denkt"
            const delay = aiAutoPlay ? 2000 : 50; // Längere Verzögerung im manuellen Modus

            setTimeout(() => {
                const newBoard = [...board];
                newBoard[optimalMove.index] = 'O';
                setBoard(newBoard);
                setIsXNext(true);
                setAiThinking(false);
                setShowVisualization(false); // Verstecke Visualisierung nach KI-Zug
            }, delay);
        } else {
            setAiThinking(false);
            setShowVisualization(false);
        }
    };

    const handleAIMoveButtonClick = () => {
        if (!isXNext && gameState === 'playing' && !aiThinking) {
            makeAIMove();
        }
    };

    const handleClick = (index: number) => {
        if (board[index] || gameState !== 'playing' || !isXNext || aiThinking) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);
        setIsXNext(false);

        // Verstecke bestehende Visualisierung
        setShowVisualization(false);

        // Im Auto-Play-Modus sofort KI-Zug ausführen
        if (aiAutoPlay) {
            setTimeout(() => makeAIMove(), 50);
        }
    };

    const handleVisualizationClick = (moveIndex: number, path: number[]) => {
        setSelectedMoveIndex(moveIndex);
        setVisualizationPath([...path, moveIndex]);
    };

    const handleBackClick = () => {
        if (visualizationPath.length > 0) {
            setVisualizationPath(visualizationPath.slice(0, -1));
            setSelectedMoveIndex(null);
        }
    };

    // Hole aktuelle Züge zur Visualisierung basierend auf Pfad
    const getVisualizationMoves = (): MoveEvaluation[] => {
        if (visualizationPath.length === 0) {
            return possibleMoves;
        }

        let currentMoves = possibleMoves;
        let currentMove: MoveEvaluation | undefined;

        for (const index of visualizationPath) {
            currentMove = currentMoves[index];
            if (currentMove?.nextMoves) {
                currentMoves = currentMove.nextMoves;
            } else {
                return [];
            }
        }

        return currentMoves;
    };

    useEffect(() => {
        const currentState = getGameState(board);
        setGameState(currentState);

        // Wenn KI am Zug ist und Spiel noch läuft
        if (currentState === 'playing' && !isXNext) {
            // Manuelle Steuerung - warte auf Button-Klick
            if (!aiAutoPlay) {
                evaluateAIMoves(); // Nur Analyse zeigen, ohne automatischen Zug
            } else {
                // Auto-Play Modus - KI zieht automatisch
                makeAIMove();
            }
        }
    }, [board, isXNext]);

    const toggleAIAutoPlay = () => {
        const newAutoPlayState = !aiAutoPlay;
        setAiAutoPlay(newAutoPlayState);

        // Wenn Auto-Play aktiviert wird und KI am Zug ist, sofort KI-Zug ausführen
        if (newAutoPlayState && !isXNext && gameState === 'playing') {
            setTimeout(() => makeAIMove(), 500);
        }
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setGameState('playing');
        setPossibleMoves([]);
        setSelectedMoveIndex(null);
        setVisualizationPath([]);
        setAiThinking(false);
        setShowVisualization(false);
    };

    const renderCell = (value: Player, onClick?: () => void, isHighlighted: boolean = false) => {
        return (
            <button
                className={`${styles.cell} ${isHighlighted ? styles.highlight : ''}`}
                onClick={onClick}
                disabled={!onClick}
            >
                {value}
            </button>
        );
    };

    const renderBoard = (
        boardState: Board,
        handleCellClick?: (index: number) => void,
        highlightIndex?: number
    ) => {
        return (
            <div className={styles.labeled}>
                <div className={styles.labeledRows}>
                    <div className={styles.labelCol}>
                        <div>C</div>
                        <div>B</div>
                        <div>A</div>
                    </div>
                    <div className={styles.board}>
                        <div className={styles.row}>
                            {renderCell(
                                boardState[0],
                                handleCellClick ? () => handleCellClick(0) : undefined,
                                highlightIndex === 0
                            )}
                            {renderCell(
                                boardState[1],
                                handleCellClick ? () => handleCellClick(1) : undefined,
                                highlightIndex === 1
                            )}
                            {renderCell(
                                boardState[2],
                                handleCellClick ? () => handleCellClick(2) : undefined,
                                highlightIndex === 2
                            )}
                        </div>
                        <div className={styles.row}>
                            {renderCell(
                                boardState[3],
                                handleCellClick ? () => handleCellClick(3) : undefined,
                                highlightIndex === 3
                            )}
                            {renderCell(
                                boardState[4],
                                handleCellClick ? () => handleCellClick(4) : undefined,
                                highlightIndex === 4
                            )}
                            {renderCell(
                                boardState[5],
                                handleCellClick ? () => handleCellClick(5) : undefined,
                                highlightIndex === 5
                            )}
                        </div>
                        <div className={styles.row}>
                            {renderCell(
                                boardState[6],
                                handleCellClick ? () => handleCellClick(6) : undefined,
                                highlightIndex === 6
                            )}
                            {renderCell(
                                boardState[7],
                                handleCellClick ? () => handleCellClick(7) : undefined,
                                highlightIndex === 7
                            )}
                            {renderCell(
                                boardState[8],
                                handleCellClick ? () => handleCellClick(8) : undefined,
                                highlightIndex === 8
                            )}
                        </div>
                    </div>
                </div>
                <div className={styles.labelRow}>
                    <div>1</div>
                    <div>2</div>
                    <div>3</div>
                </div>
            </div>
        );
    };

    const renderMoveVisualization = () => {
        const currentMoves = getVisualizationMoves();

        // Bestimme, ob wir KI oder Spielerzüge visualisieren
        const isAIDepth = visualizationPath.length % 2 === 0;
        const currentPlayer = isAIDepth ? 'O' : 'X';

        // Finde den besten Zug für die aktuelle Ansicht
        const bestMove = currentMoves.find((move) => move.isOptimal);

        // Erstelle den Visualisierungs-Pfad-Text
        let pathDescription = `Mögliche Züge für ${currentPlayer === 'O' ? 'KI (O)' : 'Spieler (X)'}`;

        if (visualizationPath.length > 0) {
            pathDescription = 'Wenn diese Züge gewählt werden: ';
            let tempBoard = [...board];
            let player: Player = 'O'; // Start mit KI, da wir KI-Züge analysieren

            // Gehe den Pfad durch, um die Sequenz zu beschreiben
            for (let i = 0; i < visualizationPath.length; i++) {
                const pathIndex = visualizationPath[i];
                const moveIndex =
                    i === 0
                        ? possibleMoves[pathIndex].index
                        : getMovesAtPath(visualizationPath.slice(0, i))[pathIndex].index;

                if (i > 0) pathDescription += ' → ';
                pathDescription += `${player} auf Position ${MOVE_COORINATES[moveIndex]}`;

                // Update für die nächste Iteration
                tempBoard[moveIndex] = player;
                player = player === 'X' ? 'O' : 'X';
            }
        }

        return (
            <div className={styles.visualization}>
                <div className={styles.visualizationHeader}>
                    <h2>KI-Zuganalyse</h2>
                    {visualizationPath.length > 0 && (
                        <button className={styles.backButton} onClick={handleBackClick}>
                            ↩ Zurück
                        </button>
                    )}
                </div>

                <div className={styles.pathDescription}>{pathDescription}</div>

                <div className={styles.scoreExplanation}>
                    <h3>Analyse der KI-Bewertungswerte</h3>
                    <p>
                        Die <strong>Bewertung</strong> zeigt, wie die KI (O) die Situation einschätzt:
                    </p>
                    <ul>
                        <li>
                            <strong>Positive Werte (z.B. +10):</strong> Die KI erwartet einen Sieg
                        </li>
                        <li>
                            <strong>Negative Werte (z.B. -10):</strong> Die KI erwartet eine Niederlage
                        </li>
                        <li>
                            <strong>Werte nahe 0:</strong> Die KI erwartet ein Unentschieden
                        </li>
                    </ul>
                    <p>
                        Die KI wählt immer den Zug mit dem <strong>höchsten Wert</strong>, da ein höherer Wert
                        eine bessere Position für O bedeutet.
                    </p>
                </div>

                {bestMove && (
                    <div className={styles.bestMoveInfo}>
                        <h3>Optimale {isAIDepth ? 'KI' : 'Spieler'}-Option</h3>
                        <p>
                            Position: {bestMove.index + 1} • Bewertung: {bestMove.score}
                            <span className={styles.optimalMarker}> ★</span>
                        </p>
                        <p className={styles.bestMoveExplanation}>
                            {isAIDepth
                                ? // KI-Perspektive (maximieren)
                                  bestMove.score > 0
                                    ? 'Dieser Zug führt wahrscheinlich zum Sieg für die KI'
                                    : bestMove.score < 0
                                      ? 'Dieser Zug verringert den Vorsprung des Spielers'
                                      : 'Dieser Zug führt laut Berechnung zu einem Unentschieden'
                                : // Spieler-Perspektive (minimieren)
                                  bestMove.score < 0
                                  ? 'Dieser Zug wäre der beste für den Spieler und könnte zum Sieg führen'
                                  : bestMove.score > 0
                                    ? 'Der Spieler hat keine gute Option, KI ist im Vorteil'
                                    : 'Dieser Zug kann ein Unentschieden sichern'}
                        </p>
                    </div>
                )}

                {currentMoves.length > 0 ? (
                    <div className={styles.moveOptions}>
                        {currentMoves.map((move, index) => {
                            const boardState = getGameState(move.resultingBoard);

                            return (
                                <div
                                    key={index}
                                    className={`${styles.moveOption} ${move.isOptimal ? styles.optimalMove : ''}`}
                                >
                                    <div className={styles.moveHeader}>
                                        {currentPlayer} auf Position {MOVE_COORINATES[move.index]}
                                        <span className={styles.moveScore}>Bewertung: {move.score}</span>
                                        {move.isOptimal && (
                                            <span className={styles.optimalMarker}>★ Optimal</span>
                                        )}
                                    </div>

                                    {renderBoard(
                                        move.resultingBoard,
                                        move.nextMoves && move.nextMoves.length > 0
                                            ? () => handleVisualizationClick(index, visualizationPath)
                                            : undefined,
                                        move.index
                                    )}

                                    <div className={styles.moveStatus}>
                                        {boardState === 'playing' ? (
                                            <button
                                                className={styles.exploreButton}
                                                onClick={() =>
                                                    handleVisualizationClick(index, visualizationPath)
                                                }
                                                disabled={!move.nextMoves || move.nextMoves.length === 0}
                                            >
                                                Weitere Züge erkunden
                                            </button>
                                        ) : (
                                            <div className={styles.gameEndStatus}>
                                                {boardState === 'draw'
                                                    ? 'Unentschieden'
                                                    : boardState === 'X-won'
                                                      ? 'X gewinnt'
                                                      : 'O gewinnt'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.noMoves}>Auf diesem Pfad sind keine weiteren Züge möglich.</div>
                )}
            </div>
        );
    };

    // Hilfsfunktion, um Züge an einem bestimmten Pfad zu erhalten
    const getMovesAtPath = (path: number[]): MoveEvaluation[] => {
        if (path.length === 0) return possibleMoves;

        let currentMoves = possibleMoves;
        for (let i = 0; i < path.length; i++) {
            if (currentMoves[path[i]]?.nextMoves) {
                currentMoves = currentMoves[path[i]].nextMoves!;
            } else {
                return [];
            }
        }
        return currentMoves;
    };

    let status;
    if (gameState === 'X-won') {
        status = 'Du hast gewonnen!';
    } else if (gameState === 'O-won') {
        status = 'Die KI hat gewonnen!';
    } else if (gameState === 'draw') {
        status = 'Unentschieden!';
    } else if (aiThinking) {
        status = 'Die KI berechnet ihren Zug...';
    } else {
        status = isXNext ? 'Du bist am Zug (X)' : 'KI ist am Zug (O)';
    }

    return (
        <div className={styles.app}>
            <h1>Tic-Tac-Toe</h1>

            <div className={styles.info}>
                <p>
                    Diese Demo demonstriert die Spielweise von KI beim Spiel Tic-Tac-Toe.
                    <br />
                    <small>Die KI basiert auf einem sog. Min-Max Algorithmus.</small>
                </p>
                {/* <p>
                    Diese Demo zeigt, wie KI mit dem Minimax-Algorithmus alle möglichen Züge ausrechnet und
                    bewertet.
                </p> */}
                <p>
                    Sie spielen als <b>X</b>, die KI als <b>O</b>. Die Zuganalyse wird angezeigt, wenn die KI
                    am Zug ist.
                </p>
                <p>
                    Klicken Sie auf einen Zug in der Visualisierung, um tiefer in den Spielbaum zu navigieren
                    und zu sehen, was die KI "denkt".
                </p>

                {/* <p className={styles.aiExplanation}>
                    <strong>Künstliche "Intelligenz":</strong> Die KI spielt perfekt, indem sie alle möglichen
                    Züge berechnet und den besten auswählt - sie "denkt" nicht wirklich, sondern berechnet nur
                    mathematische Werte für jeden möglichen Zug.
                </p> */}
            </div>

            <div className={styles.gameContainer}>
                <div className={styles.gamePlay}>
                    <div className={styles.status}>{status}</div>
                    {renderBoard(board, handleClick)}

                    <div className={styles.controls}>
                        {gameState === 'playing' && (
                            <button
                                className={`${styles.aiMoveButton} ${aiThinking ? styles.aiThinking : ''}`}
                                onClick={handleAIMoveButtonClick}
                                disabled={aiThinking || aiAutoPlay || isXNext}
                            >
                                KI-Zug ausführen
                            </button>
                        )}

                        <button className={styles.reset} onClick={resetGame}>
                            Spiel neu starten
                        </button>

                        <div className={styles.autoPlayToggle}>
                            <label>
                                <input type="checkbox" checked={aiAutoPlay} onChange={toggleAIAutoPlay} />
                                <span>KI spielt automatisch</span>
                            </label>
                        </div>
                    </div>
                </div>

                {showVisualization && !isXNext && gameState === 'playing' && (
                    <div className={styles.visualizationContainer}>{renderMoveVisualization()}</div>
                )}

                {(!showVisualization || isXNext || gameState !== 'playing') && (
                    <div className={styles.visualizationPlaceholder}>
                        <h3>KI-Zuganalyse</h3>
                        <p>
                            Die Analyse der möglichen KI-Züge wird angezeigt, wenn die KI (<b>O</b>) am Zug
                            ist.
                        </p>
                        {isXNext && gameState === 'playing' && (
                            <p>Bitte mache deinen Zug, um die KI-Analyse zu sehen.</p>
                        )}
                        {gameState !== 'playing' && (
                            <p>Das Spiel ist beendet. Starte ein neues Spiel, um die KI-Analyse zu sehen.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinMaxTicTacToe;
