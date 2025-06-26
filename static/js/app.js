document.querySelector('#dark-mode-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const isDarkMode = document.body.classList.contains('dark');
    localStorage.setItem('darkmode', isDarkMode);
    // change mobile status bar color
    document.querySelector('meta[name="theme-color"]').setAttribute('content', isDarkMode ? '#1a1a2e' : '#fff');
});

// initial value

// screens
const start_screen = document.querySelector('#start-screen');
const game_screen = document.querySelector('#game-screen');
const pause_screen = document.querySelector('#pause-screen');
const result_screen = document.querySelector('#result-screen');
// ----------
const cells = document.querySelectorAll('.main-grid-cell');

const name_input = document.querySelector('#input-name');

const number_inputs = document.querySelectorAll('.number');

const player_name = document.querySelector('#player-name');
const game_level = document.querySelector('#game-level');
const game_time = document.querySelector('#game-time');

const result_time = document.querySelector('#result-time');

let level_index = 0;
let level = CONSTANT.LEVEL[level_index];

let timer = null;
let pause = false;
let seconds = 0;

let su = undefined;
let su_answer = undefined;

let selected_cell = -1;

// --------

const getGameInfo = () => JSON.parse(localStorage.getItem('game'));

// add space for each 9 cells
const initGameGrid = () => {
    let index = 0;

    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE,2); i++) {
        let row = Math.floor(i/CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        if (row === 2 || row === 5) cells[index].style.marginBottom = '10px';
        if (col === 2 || col === 5) cells[index].style.marginRight = '10px';

        index++;
    }
}
// ----------------

const setPlayerName = (name) => localStorage.setItem('player_name', name);
const getPlayerName = () => localStorage.getItem('player_name');

const showTime = (seconds) => new Date(seconds * 1000).toISOString().substr(11, 8);

const clearSudoku = () => {
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        cells[i].innerHTML = '';
        cells[i].classList.remove('filled');
        cells[i].classList.remove('selected');
    }
}

const initSudoku = () => {
    // clear old sudoku
    clearSudoku();
    resetBg();
    // generate sudoku puzzle here
    su = sudokuGen(level);
    su_answer = [...su.question];

    seconds = 0;

    saveGameInfo();

    // show sudoku to div
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        
        cells[i].setAttribute('data-value', su.question[row][col]);

        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
            cells[i].innerHTML = su.question[row][col];
        }
    }
}

const loadSudoku = () => {
    let game = getGameInfo();

    game_level.innerHTML = CONSTANT.LEVEL_NAME[game.level];

    su = game.su;

    su_answer = su.answer;

    seconds = game.seconds;
    game_time.innerHTML = showTime(seconds);

    level_index = game.level;

    // show sudoku to div
    for (let i = 0; i < Math.pow(CONSTANT.GRID_SIZE, 2); i++) {
        let row = Math.floor(i / CONSTANT.GRID_SIZE);
        let col = i % CONSTANT.GRID_SIZE;
        
        cells[i].setAttribute('data-value', su_answer[row][col]);
        cells[i].innerHTML = su_answer[row][col] !== 0 ? su_answer[row][col] : '';
        if (su.question[row][col] !== 0) {
            cells[i].classList.add('filled');
        }
    }
}

const hoverBg = (index) => {
    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            cell.classList.add('hover');
        }
    }

    let step = 9;
    while (index - step >= 0) {
        cells[index - step].classList.add('hover');
        step += 9;
    }

    step = 9;
    while (index + step < 81) {
        cells[index + step].classList.add('hover');
        step += 9;
    }

    step = 1;
    while (index - step >= 9*row) {
        cells[index - step].classList.add('hover');
        step += 1;
    }

    step = 1;
     while (index + step < 9*row + 9) {
        cells[index + step].classList.add('hover');
        step += 1;
    }
}

const resetBg = () => {
    cells.forEach(e => e.classList.remove('hover'));
}

const checkErr = (value) => {
    const addErr = (cell) => {
        if (parseInt(cell.getAttribute('data-value')) === value) {
            cell.classList.add('err');
            cell.classList.add('cell-err');
            setTimeout(() => {
                cell.classList.remove('cell-err');
            }, 500);
        }
    }

    let index = selected_cell;

    let row = Math.floor(index / CONSTANT.GRID_SIZE);
    let col = index % CONSTANT.GRID_SIZE;

    let box_start_row = row - row % 3;
    let box_start_col = col - col % 3;

    for (let i = 0; i < CONSTANT.BOX_SIZE; i++) {
        for (let j = 0; j < CONSTANT.BOX_SIZE; j++) {
            let cell = cells[9 * (box_start_row + i) + (box_start_col + j)];
            if (!cell.classList.contains('selected')) addErr(cell);
        }
    }

    let step = 9;
    while (index - step >= 0) {
        addErr(cells[index - step]);
        step += 9;
    }

    step = 9;
    while (index + step < 81) {
        addErr(cells[index + step]);
        step += 9;
    }

    step = 1;
    while (index - step >= 9*row) {
        addErr(cells[index - step]);
        step += 1;
    }

    step = 1;
    while (index + step < 9*row + 9) {
        addErr(cells[index + step]);
        step += 1;
    }
}

const removeErr = () => cells.forEach(e => e.classList.remove('err'));

const saveGameInfo = () => {
    let game = {
        level: level_index,
        seconds: seconds,
        su: {
            original: su.original,
            question: su.question,
            answer: su_answer
        }
    }
    localStorage.setItem('game', JSON.stringify(game));
}

const removeGameInfo = () => {
    localStorage.removeItem('game');
    document.querySelector('#btn-continue').style.display = 'none';
}

const isGameWin = () => sudokuCheck(su_answer);

//  added code of leader board
// ✅ Save leaderboard entry to localStorage
const saveLeaderboardEntry = (name, time, level) => {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    leaderboard.push({ name, time, level }); 
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
};

// change by me 
const showResult = () => {
    clearInterval(timer);
    result_screen.classList.add('active');
    result_time.innerHTML = showTime(seconds);

    saveLeaderboardEntry(player_name.innerHTML, showTime(seconds), CONSTANT.LEVEL_NAME[level_index]);

}

// const initNumberInputEvent = () => {
//     number_inputs.forEach((e, index) => {
//         e.addEventListener('click', () => {
//             if (!cells[selected_cell].classList.contains('filled')) {
//                 const value = index + 1;

//                 // ✅ Temporarily set value for checking
//                 const tempRow = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
//                 const tempCol = selected_cell % CONSTANT.GRID_SIZE;

//                 // ✅ Check if it's safe
//                 if (isSafe(su_answer, tempRow, tempCol, value)) {
//                     // ✅ Safe --> Save and continue
//                     cells[selected_cell].innerHTML = value;
//                     cells[selected_cell].setAttribute('data-value', value);
//                     su_answer[tempRow][tempCol] = value;

//                     saveGameInfo();
//                     removeErr();
//                     checkErr(value);
//                     cells[selected_cell].classList.add('zoom-in');
//                     setTimeout(() => {
//                         cells[selected_cell].classList.remove('zoom-in');
//                     }, 500);

//                     if (isGameWin()) {
//                         removeGameInfo();
//                         showResult();
//                     }
//                 } else {
//                     // ❌ Not Safe --> Do NOT save
//                     alert('❌ This move is NOT allowed!\nCheck the rules for valid placement.<h3>Sudoku Rules ✅ Each row must contain digits 1–9 with no repetition ✅ Each column must contain digits 1–9 with no repetition ✅ Each 3×3 box must contain digits 1–9 with no repetition ✅ Start with pre-filled clues. Use logic — no guessing required');
//                 };
            const initNumberInputEvent = () => {
    number_inputs.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!cells[selected_cell]?.classList.contains('filled')) {
                const value = index + 1;

                // ✅ Temporarily set value for checking
                const tempRow = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
                const tempCol = selected_cell % CONSTANT.GRID_SIZE;

                // ✅ Check if it's safe
                if (isSafe(su_answer, tempRow, tempCol, value)) {
                    // ✅ Safe --> Save and continue
                    cells[selected_cell].innerHTML = value;
                    cells[selected_cell].setAttribute('data-value', value);
                    su_answer[tempRow][tempCol] = value;

                    saveGameInfo();
                    removeErr();
                    checkErr(value);
                    cells[selected_cell].classList.add('zoom-in');
                    setTimeout(() => {
                        cells[selected_cell].classList.remove('zoom-in');
                    }, 500);

                    if (isGameWin()) {
                        removeGameInfo();
                        showResult();
                    }
                } else {
                    // ❌ Not Safe --> Do NOT save
                    alert('❌ This move is NOT allowed!\nCheck the rules for valid placement.\n🧩 SUDOKU RULES: \n✅ Each row must contain digits 1–9 with no repetition\n✅ Each column must contain digits 1–9 with no repetition\n✅ Each 3×3 box must contain digits 1–9 with no repetition');
                }
            }
        });
    });
};


// const initNumberInputEvent = () => {
//     number_inputs.forEach((e, index) => {
//         e.addEventListener('click', () => {
//             if (!cells[selected_cell].classList.contains('filled')) {
//                 cells[selected_cell].innerHTML = index + 1;
//                 cells[selected_cell].setAttribute('data-value', index + 1);
//                 // add to answer
//                 let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
//                 let col = selected_cell % CONSTANT.GRID_SIZE;
//                 su_answer[row][col] = index + 1;
//                 // save game
//                 saveGameInfo()
//                 // -----
//                 removeErr();
//                 checkErr(index + 1);
//                 cells[selected_cell].classList.add('zoom-in');
//                 setTimeout(() => {
//                     cells[selected_cell].classList.remove('zoom-in');
//                 }, 500);

//                 // check game win
//                 if (isGameWin()) {
//                     removeGameInfo();
//                     showResult();
//                 }
//                 // ----
//             }
//         })
//     })
// }

const initCellsEvent = () => {
    cells.forEach((e, index) => {
        e.addEventListener('click', () => {
            if (!e.classList.contains('filled')) {
                cells.forEach(e => e.classList.remove('selected'));

                selected_cell = index;
                e.classList.remove('err');
                e.classList.add('selected');
                resetBg();
                hoverBg(index);
            }
        })
    })
}

const startGame = () => {
    start_screen.classList.remove('active');
    game_screen.classList.add('active');

    player_name.innerHTML = name_input.value.trim();
    setPlayerName(name_input.value.trim());

    game_level.innerHTML = CONSTANT.LEVEL_NAME[level_index];

    showTime(seconds);

    timer = setInterval(() => {
        if (!pause) {
            seconds = seconds + 1;
            game_time.innerHTML = showTime(seconds);
        }
    }, 1000);
}

const returnStartScreen = () => {
    clearInterval(timer);
    pause = false;
    seconds = 0;
    start_screen.classList.add('active');
    game_screen.classList.remove('active');
    pause_screen.classList.remove('active');
    result_screen.classList.remove('active');
}

// add button event
document.querySelector('#btn-level').addEventListener('click', (e) => {
    level_index = level_index + 1 > CONSTANT.LEVEL.length - 1 ? 0 : level_index + 1;
    level = CONSTANT.LEVEL[level_index];
    e.target.innerHTML = CONSTANT.LEVEL_NAME[level_index];
});

document.querySelector('#btn-play').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        initSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        }, 500);
    }
});

document.querySelector('#btn-continue').addEventListener('click', () => {
    if (name_input.value.trim().length > 0) {
        loadSudoku();
        startGame();
    } else {
        name_input.classList.add('input-err');
        setTimeout(() => {
            name_input.classList.remove('input-err');
            name_input.focus();
        }, 500);
    }
});

document.querySelector('#btn-pause').addEventListener('click', () => {
    pause_screen.classList.add('active');
    pause = true;
});

document.querySelector('#btn-resume').addEventListener('click', () => {
    pause_screen.classList.remove('active');
    pause = false;
});

document.querySelector('#btn-new-game').addEventListener('click', () => {
    returnStartScreen();
});

document.querySelector('#btn-new-game-2').addEventListener('click', () => {
    console.log('object')
    returnStartScreen();
});

document.querySelector('#btn-delete').addEventListener('click', () => {
    cells[selected_cell].innerHTML = '';
    cells[selected_cell].setAttribute('data-value', 0);

    let row = Math.floor(selected_cell / CONSTANT.GRID_SIZE);
    let col = selected_cell % CONSTANT.GRID_SIZE;

    su_answer[row][col] = 0;

    removeErr();
});

// changed by me 
// ✅ Event for Viewing Leaderboard 
document.querySelector('#btn-view-leaderboard')?.addEventListener('click', () => {
    window.location.href = 'leaderboard.html';
});

// -------------

const init = () => {
    const darkmode = JSON.parse(localStorage.getItem('darkmode'));
    document.body.classList.add(darkmode ? 'dark' : 'light');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', darkmode ? '#1a1a2e' : '#fff');

    const game = getGameInfo();

    document.querySelector('#btn-continue').style.display = game ? 'grid' : 'none';

    initGameGrid();
    initCellsEvent();
    initNumberInputEvent();

    if (getPlayerName()) {
        name_input.value = getPlayerName();
    } else {
        name_input.focus();
    }
}

init();
///////////////////////////

const themes = ['jungle', 'pirate', 'fantasy'];

document.querySelectorAll('.theme-dropdown li').forEach(item => {
    item.addEventListener('click', function () {
        const selectedTheme = item.getAttribute('data-theme');

        // Remove previous theme classes
        themes.forEach(theme => document.body.classList.remove(theme));

        // Add selected theme
        document.body.classList.add(selectedTheme);
    });
});
// Apply saved theme on load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('sudoku-theme');
    if (themes.includes(savedTheme)) {
        document.body.classList.add(savedTheme);
    }
    
});

// Save theme on click
document.querySelectorAll('.theme-dropdown li').forEach(item => {
    item.addEventListener('click', function () {
        const selectedTheme = item.getAttribute('data-theme');
        localStorage.setItem('sudoku-theme', selectedTheme);
        if (selectedTheme === "default") {
    themes.forEach(theme => document.body.classList.remove(theme));
    localStorage.removeItem("selectedTheme");
} else {
    themes.forEach(theme => document.body.classList.remove(theme));
    document.body.classList.add(selectedTheme);
    localStorage.setItem("selectedTheme", selectedTheme);
}

    });
});
/////////////////
// =================== RULES MODAL FUNCTIONALITY ===================
// const rulesButton = document.querySelector('#show-rules-button');
// const rulesModal = document.querySelector('#game-rules-modal');
// const closeRules = document.querySelector('#close-rules');

// rulesButton.addEventListener('click', () => {
//   rulesModal.classList.remove('hidden');
// });

// closeRules.addEventListener('click', () => {
//   rulesModal.classList.add('hidden');
// });

// // Optional: Click outside to close
// window.addEventListener('click', (e) => {
//   if (e.target === rulesModal) {
//     rulesModal.classList.add('hidden');
//   }
// });


// // =================== RULES MODAL FUNCTIONALITY ===================
// const rulesButton = document.querySelector('#show-rules-button');
// const rulesModal = document.querySelector('#game-rules-modal');
// const closeRules = document.querySelector('#close-rules');

// if (rulesButton && rulesModal && closeRules) {
//   rulesButton.addEventListener('click', () => {
//     rulesModal.classList.remove('hidden');
//   });
  
//   closeRules.addEventListener('click', () => {
//     rulesModal.classList.add('hidden');
//   });
  
//   // Click outside the modal to close
//   window.addEventListener('click', (e) => {
//     if (e.target === rulesModal) {
//       rulesModal.classList.add('hidden');
//     }
//   });
// }
