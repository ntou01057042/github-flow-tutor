import { reset } from "./diagrams.js";
import { cloneLocalA } from "./diagrams.js";
import { cloneLocalB } from "./diagrams.js";
import { branchLocalA } from "./diagrams.js";
import { branchLocalB } from "./diagrams.js";
import { commitLocalA } from "./diagrams.js";
import { commitLocalB } from "./diagrams.js";
import { pushLocalA } from "./diagrams.js";
import { pushLocalB } from "./diagrams.js";

let suggestion;

let resetButton;

let cloneLocalAButton;
let cloneLocalBButton;

let currentLocal;

let commandList;
let commandInput;

let switchToABtn;
let switchToBBtn;

let localA;
let localB;

window.addEventListener('load', () => {
    suggestion = document.getElementById('suggestion');

    resetButton = document.getElementById('reset-button');

    cloneLocalAButton = document.getElementById('clone-local-a-button');
    cloneLocalBButton = document.getElementById('clone-local-b-button');

    commandList = document.getElementById('git-commands');
    commandInput = document.getElementById('command-input');

    resetButton.addEventListener('click', reset);

    switchToABtn = document.getElementById('switch-to-a');
    switchToBBtn = document.getElementById('switch-to-b');

    localA = document.getElementById('local-a-div');
    localB = document.getElementById('local-b-div');

    cloneLocalAButton.addEventListener('click', async (e) => {
        e.target.style.display = 'none';
        await cloneLocalA();
        currentLocal = 'A';
        suggestion.innerHTML = '你可以在A本地端建立一個新的分支來開始提交commit。';
        suggestion.innerHTML += '\n（提示：git branch）';
        commandList.innerHTML += '<option value="git branch"></option>';
    });

    cloneLocalBButton.addEventListener('click', async (e) => {
        e.target.style.display = 'none';
        await cloneLocalB();
        currentLocal = 'B';
        suggestion.innerHTML = '你可以在B本地端建立一個新的分支來開始提交commit。';
        suggestion.innerHTML += '\n（提示：git branch）';
        commandList.innerHTML += '<option value="git branch"></option>';
    });

    commandInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const input = e.target.value;
            if (input === 'git branch') {
                if (currentLocal === 'A') {
                    await branchLocalA();
                } else if (currentLocal === 'B') {
                    await branchLocalB();
                }
                e.target.value = '';
                suggestion.innerHTML = '你可以在新建立的分支內提交commit。';
                suggestion.innerHTML += '\n（提示：git commit）';
                if (!commandList.innerHTML.includes('<option value="git commit"></option>')) {
                    commandList.innerHTML += '<option value="git commit"></option>';
                }
            } else if (input === 'git commit') {
                if (currentLocal === 'A') {
                    await commitLocalA();
                } else if (currentLocal === 'B') {
                    await commitLocalB();
                }
                e.target.value = '';
                suggestion.innerHTML = '你可以持續地提交commit，並隨時將本地端的內容同步到GitHub上。';
                suggestion.innerHTML += '\n（提示：git push）';
                if (!commandList.innerHTML.includes('<option value="git push"></option>')) {
                    commandList.innerHTML += '<option value="git push"></option>';
                }
            } else if (input.startsWith('git checkout')) {
                if (currentLocal === 'A') {
                    e.target.value = '';
                } else if (currentLocal === 'B') {
                    e.target.value = '';
                }
            } else if (input === 'git push') {
                if (currentLocal === 'A') {
                    await pushLocalA();
                } else if (currentLocal === 'B') {
                    await pushLocalB();
                }
                e.target.value = '';
                if (document.getElementById('local-a-diagram').innerHTML === '' ||
                    document.getElementById('local-b-diagram').innerHTML === '') {
                    suggestion.innerHTML = '現在請你將GitHub上的內容clone到另一個本地端，你可以把它視為是另一個團隊成員的本地端內容。';
                } else {
                    suggestion.innerHTML = '現在請你回到一開始的本地端。';
                }
            }
        }
    });

    switchToBBtn.addEventListener('click', async () =>{
        localA.style.display = 'none';
        localB.style.display = 'unset';
        currentLocal = 'B';
    });

    switchToABtn.addEventListener('click', async () =>{
        localB.style.display = 'none';
        localA.style.display = 'unset';
        currentLocal = 'A';
    });
});