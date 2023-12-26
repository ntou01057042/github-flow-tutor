import {reset} from "./diagrams.js";
import {cloneLocalA} from "./diagrams.js";
import {cloneLocalB} from "./diagrams.js";
import {branchLocalA} from "./diagrams.js";
import {branchLocalB} from "./diagrams.js";
import {commitLocalA} from "./diagrams.js";
import {commitLocalB} from "./diagrams.js";
import {pushLocalA} from "./diagrams.js";
import {pushLocalB} from "./diagrams.js";
import {checkoutLocalA} from "./diagrams.js";
import {checkoutLocalB} from "./diagrams.js";
import {mergeLocalA} from "./diagrams.js";
import {mergeLocalB} from "./diagrams.js";
import {pullLocalA} from "./diagrams.js";
import {pullLocalB} from "./diagrams.js";

import {currentBranch} from "./diagrams.js";
import {branches} from "./diagrams.js";

let suggestion;

let resetButton;

let cloneLocalAButton;
let cloneLocalBButton;

let currentLocal = 'A';

let commandList;
let commandInput;

let switchToABtn;
let switchToBBtn;

let localA;
let localB;

let enableLocalABranch = true;
let enableLocalBBranch = true;
let enableLocalACommit = true;
let enableLocalBCommit = true;

let pullInLocalA = false;
let pullInLocalB = false;

let pushInLocalA = false;
let pushInLocalB = false;

let recordA;
let recordB;

window.addEventListener('load', () => {
    suggestion = document.getElementById('suggestion');

    resetButton = document.getElementById('reset-button');

    cloneLocalAButton = document.getElementById('clone-local-a-button');
    cloneLocalBButton = document.getElementById('clone-local-b-button');

    commandList = document.getElementById('git-commands');
    commandInput = document.getElementById('command-input');

    switchToABtn = document.getElementById('switch-to-a');
    switchToBBtn = document.getElementById('switch-to-b');

    localA = document.getElementById('local-a-div');
    localB = document.getElementById('local-b-div');
    localB.style.display = 'none';

    recordA = document.getElementById('record-A');
    recordB = document.getElementById('record-B');
    recordB.style.display = 'none';

    resetButton.addEventListener('click', reset);
    resetButton.addEventListener('click', ()=>{
        recordA = '';
        recordB = '';
    })

    cloneLocalAButton.addEventListener('click', async (e) => {
        e.target.style.display = 'none';
        await cloneLocalA();
        currentLocal = 'A';
        suggestion.innerHTML = '你可以在下方輸入Git指令看看。';
        enableLocalACommit = false;   // should not commit in main
    });

    cloneLocalBButton.addEventListener('click', async (e) => {
        e.target.style.display = 'none';
        await cloneLocalB();
        currentLocal = 'B';
        suggestion.innerHTML = '你可以在下方輸入Git指令看看。';
        enableLocalBCommit = false;   // should not commit in main
    });

    commandInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const input = e.target.value;
            // if (currentLocal === 'A') {
            //     recordA.innerHTML += `- ${input}<br>`;
            // } else if (currentLocal === 'B') {
            //     recordB.innerHTML += `- ${input}<br>`;
            // }
            if ((currentLocal === 'A' && document.getElementById('local-a-diagram').innerHTML === '') ||
                (currentLocal === 'B' && document.getElementById('local-b-diagram').innerHTML === '')) {
                suggestion.innerHTML = '請先點選畫面右下方的按鈕來將GitHub儲存庫clone到本地端。';
            } else if (((pushInLocalA && currentLocal === 'A') || (pushInLocalB && currentLocal === 'B')) && input !== 'git push') {
                suggestion.innerHTML = '請先將主分支的更新同步到GitHub上。（提示：git push）';
            } else if (((pullInLocalA && currentLocal === 'A') || (pullInLocalB && currentLocal === 'B')) && input !== 'git pull') {
                suggestion.innerHTML = '請先將GitHub上的主分支更新同步到你的本地端。（提示：git pull）';
            } else if (input === 'git push') {
                if (currentLocal === 'A') {
                    await pushLocalA();
                    suggestion.innerHTML = '你已將本地端的內容同步到GitHub上。';
                    pushInLocalA = false;
                    recordA.innerHTML += `- ${input}<br>`;
                } else if (currentLocal === 'B') {
                    await pushLocalB();
                    suggestion.innerHTML = '你已將本地端的內容同步到GitHub上。';
                    pushInLocalB = false;
                    recordB.innerHTML += `- ${input}<br>`;
                }
            } else if (input === 'git branch') {
                if (currentLocal === 'A') {
                    if (enableLocalABranch) {
                        await branchLocalA();
                        suggestion.innerHTML = '你可以在這個新分支內提交commit，新內容將只存在於這個分支內。';
                        enableLocalABranch = false;   // should not create new branch from a branch
                        enableLocalACommit = true;
                        recordA.innerHTML += `- ${input}<br>`;
                    } else {
                        if (currentBranch.localA.dataset.branch !== 'main') {
                            suggestion.innerHTML = '你不應該直接在主分支以外的分支建立新的分支，請先切換到主分支。（提示：git checkout）';
                        }
                    }
                } else if (currentLocal === 'B') {
                    if (enableLocalBBranch) {
                        await branchLocalB();
                        suggestion.innerHTML = '你可以在這個新分支內提交commit，新內容將只存在於這個分支內。';
                        enableLocalBBranch = false;   // should not create new branch from a branch
                        enableLocalBCommit = true;
                        recordB.innerHTML += `- ${input}<br>`;
                    } else {
                        if (currentBranch.localB.dataset.branch !== 'main') {
                            suggestion.innerHTML = '你不應該直接在主分支以外的分支建立新的分支，請先切換到主分支。（提示：git checkout）';
                        }
                    }
                }
            } else if (input === 'git commit') {
                if (currentLocal === 'A') {
                    if (enableLocalACommit) {
                        await commitLocalA();
                        suggestion.innerHTML = '你可以持續在這個分支下提交commit，並隨時同步到GitHub上。（提示：git push）';
                        recordA.innerHTML += `- ${input}<br>`;
                    } else {
                        if (currentBranch.localA.dataset.branch === 'main') {
                            suggestion.innerHTML = '你不應該直接在主分支提交commit，請先建立一個分支。（提示：git branch）';
                        }
                    }
                } else if (currentLocal === 'B') {
                    if (enableLocalBCommit) {
                        await commitLocalB();
                        suggestion.innerHTML = '你可以持續在這個分支下提交commit，並隨時同步到GitHub上。（提示：git push）';
                        recordB.innerHTML += `- ${input}<br>`;
                    } else {
                        if (currentBranch.localB.dataset.branch === 'main') {
                            suggestion.innerHTML = '你不應該直接在主分支提交commit，請先建立一個分支。（提示：git branch）';
                        }
                    }
                }
            } else if (input.startsWith('git checkout')) {
                if (input === 'git checkout ') {
                    suggestion.innerHTML = '請輸入完整的指令。（提示：git checkout 後面要加上要切換的分支名稱）';
                } else {
                    const array = input.split(' ');
                    const branch = array[array.length - 1];
                    if (currentLocal === 'A') {
                        if (!branches.localA.get(branch).deleted) {
                            await checkoutLocalA(branch);
                            suggestion.innerHTML = `你已切換到${branch}分支。`;
                            enableLocalACommit = true;
                            if (branch === 'main') {
                                enableLocalABranch = true;
                                enableLocalACommit = false;   // should not commit in main
                                suggestion.innerHTML = '你已切換到主分支，你可以建立新的分支或是將完成的分支合併進來。（提示：git merge）';
                            }
                            recordA.innerHTML += `- ${input}<br>`;
                        } else {
                            suggestion.innerHTML = '這個分支已合併到主分支，請切換到其他分支或是建立新分支。';
                        }
                    } else if (currentLocal === 'B') {
                        if (!branches.localB.get(branch).deleted) {
                            await checkoutLocalB(branch);
                            suggestion.innerHTML = `你已切換到${branch}分支。`;
                            enableLocalBCommit = true;
                            if (branch === 'main') {
                                enableLocalBBranch = true;
                                enableLocalBCommit = false;   // should not commit in main
                                suggestion.innerHTML = '你已切換到主分支，你可以建立新的分支或是將完成的分支合併進來。（提示：git merge）';
                            }
                            recordB.innerHTML += `- ${input}<br>`;
                        } else {
                            suggestion.innerHTML = '這個分支已合併到主分支，請切換到其他分支或是建立新分支。';
                        }
                    }
                }
            } else if (input.startsWith('git merge')) {
                if (input === 'git merge ') {
                    suggestion.innerHTML = '請輸入完整的指令。（提示：git merge 後面要加上要合併進來的分支名稱）';
                } else {
                    const array = input.split(' ');
                    const branch = array[array.length - 1];
                    if (window.confirm(`確定要合併${branch}分支進來嗎？`)) {
                        if ((currentLocal === 'A') && (branch !== currentBranch.localA.dataset.branch)) {
                            await mergeLocalA(branch);   // no exception handling
                            if (currentBranch.localA.dataset.branch === 'main') {
                                suggestion.innerHTML = `你已成功將${branch}分支的內容合併到主分支！現在請將此變更同步到GitHub上。（提示：git push）`;
                                pushInLocalA = true;
                            } else {
                                suggestion.innerHTML = '你已成功將主分支的內容合併到此分支。';
                            }
                            if (document.getElementById('local-b-diagram').innerHTML !== '') {
                                pullInLocalB = true;
                            }
                            recordA.innerHTML += `- ${input}<br>`;
                        } else if ((currentLocal === 'B') && (branch !== currentBranch.localB.dataset.branch)) {
                            await mergeLocalB(branch);   // no exception handling
                            if (currentBranch.localB.dataset.branch === 'main') {
                                suggestion.innerHTML = `你已成功將${branch}分支的內容合併到主分支！現在請將此變更同步到GitHub上。（提示：git push）`;
                                pushInLocalB = true;
                            } else {
                                suggestion.innerHTML = '你已成功將主分支的內容合併到此分支。';
                            }
                            if (document.getElementById('local-a-diagram').innerHTML !== '') {
                                pullInLocalA = true;
                            }
                            recordB.innerHTML += `- ${input}<br>`;
                        }
                    }
                }
            } else if (input === 'git pull') {
                if (currentLocal === 'A') {
                    await pullLocalA();
                    pullInLocalA = false;
                    recordA.innerHTML += `- ${input}<br>`;
                } else if (currentLocal === 'B') {
                    await pullLocalB();
                    pullInLocalB = false;
                    recordB.innerHTML += `- ${input}<br>`;
                }
            } else {
                suggestion.innerHTML = '輸入的指令無效。';
            }
            e.target.value = '';
        }
    });

    switchToBBtn.addEventListener('click', () => {
        localA.style.display = 'none';
        localB.style.display = 'inline-block';
        recordA.style.display = 'none';
        recordB.style.display = 'inline-block';
        currentLocal = 'B';
        if (document.getElementById('local-b-diagram').innerHTML === '') {
            suggestion.innerHTML = '請點選畫面右下方的按鈕來將GitHub儲存庫clone到本地端（B）。';
        } else if (pullInLocalB) {
            alert('GitHub的主分支有新的更新！');
            suggestion.innerHTML = '請輸入git pull指令來將GitHub上的主分支更新同步到你的本地端。';
        } else {
            suggestion.innerHTML = '你已切換到B本地端，你可以在下方輸入Git指令。';
        }
    });

    switchToABtn.addEventListener('click', () => {
        localB.style.display = 'none';
        localA.style.display = 'inline-block';
        recordB.style.display = 'none';
        recordA.style.display = 'inline-block';
        currentLocal = 'A';
        if (document.getElementById('local-a-diagram').innerHTML === '') {
            suggestion.innerHTML = '請點選畫面右下方的按鈕來將GitHub儲存庫clone到本地端（A）。';
        } else if (pullInLocalA) {
            alert('GitHub的主分支有新的更新！');
            suggestion.innerHTML = '請輸入git pull指令來將GitHub上的主分支更新同步到你的本地端。';
        } else {
            suggestion.innerHTML = '你已切換到A本地端，你可以在下方輸入Git指令。';
        }
    });
});