import {reset} from "./diagrams.js";
import {cloneLocalA} from "./diagrams.js";
import {cloneLocalB} from "./diagrams.js";
import {branchLocalA} from "./diagrams.js";
import {branchLocalB} from "./diagrams.js";
import {commitLocalA} from "./diagrams.js";
import {commitLocalB} from "./diagrams.js";
import {pushLocalA} from "./diagrams.js";
import {pushLocalB} from "./diagrams.js";

let suggestion;

let resetButton;

let cloneLocalAButton;
let cloneLocalBButton;

let currentLocal;

let commandList;
let commandInput;

window.addEventListener('load', () => {
    suggestion = document.getElementById('suggestion');

    resetButton = document.getElementById('reset-button');

    cloneLocalAButton = document.getElementById('clone-local-a-button');
    cloneLocalBButton = document.getElementById('clone-local-b-button');

    commandList = document.getElementById('git-commands');
    commandInput = document.getElementById('command-input');

    resetButton.addEventListener('click', reset);

    cloneLocalAButton.addEventListener('click', async () => {
        await cloneLocalA();
        currentLocal = 'A';
        suggestion.innerHTML = '你可以在A本地端建立一個新的分支來開始提交commit。';
        suggestion.innerHTML += '\n（提示：git branch）';
        commandList.innerHTML += '<option value="git branch"></option>';
    });

    cloneLocalBButton.addEventListener('click', async () => {
        await cloneLocalB();
        currentLocal = 'B';
        suggestion.innerHTML = '你可以在B本地端建立一個新的分支來開始提交commit。';
        suggestion.innerHTML += '\n（提示：git branch）';
        commandList.innerHTML += '<option value="git branch"></option>';
    });

    commandInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const input = e.target.value;
            console.log(input);
            if (input === 'git branch') {
                if (currentLocal === 'A') {
                    await branchLocalA();
                    e.target.value = '';
                    suggestion.innerHTML = '你可以在新建立的分支內提交commit。';
                    suggestion.innerHTML += '\n（提示：git commit）';
                    if (!commandList.innerHTML.includes('<option value="git commit"></option>')) {
                        commandList.innerHTML += '<option value="git commit"></option>';
                    }
                } else if (currentLocal === 'B') {
                    await branchLocalB();
                    e.target.value = '';
                    suggestion.innerHTML = '你可以在新建立的分支內提交commit。';
                    suggestion.innerHTML += '\n（提示：git commit）';
                    if (!commandList.innerHTML.includes('<option value="git commit"></option>')) {
                        commandList.innerHTML += '<option value="git commit"></option>';
                    }
                }
            } else if (input === 'git commit') {
                if (currentLocal === 'A') {
                    await commitLocalA();
                    e.target.value = '';
                    suggestion.innerHTML = '你可以隨時將本地端的內容同步到GitHub上。';
                    suggestion.innerHTML += '\n（提示：git push）';
                    if (!commandList.innerHTML.includes('<option value="git push"></option>')) {
                        commandList.innerHTML += '<option value="git push"></option>';
                    }
                } else if (currentLocal === 'B') {
                    await commitLocalB();
                    e.target.value = '';
                    suggestion.innerHTML = '你可以隨時將本地端的內容同步到GitHub上。';
                    suggestion.innerHTML += '\n（提示：git push）';
                    if (!commandList.innerHTML.includes('<option value="git push"></option>')) {
                        commandList.innerHTML += '<option value="git push"></option>';
                    }
                }
            } else if (input === 'git commit') {
                if (currentLocal === 'A') {
                    await commitLocalA();
                    e.target.value = '';
                    suggestion.innerHTML = '你可以隨時將本地端的內容同步到GitHub上。';
                    suggestion.innerHTML += '\n（提示：git push）';
                    if (!commandList.innerHTML.includes('<option value="git push"></option>')) {
                        commandList.innerHTML += '<option value="git push"></option>';
                    }
                } else if (currentLocal === 'B') {
                    await commitLocalB();
                    e.target.value = '';
                    suggestion.innerHTML = '你可以隨時將本地端的內容同步到GitHub上。';
                    suggestion.innerHTML += '\n（提示：git push）';
                    if (!commandList.innerHTML.includes('<option value="git push"></option>')) {
                        commandList.innerHTML += '<option value="git push"></option>';
                    }
                }
            } else if (input.startsWith('git checkout')) {
                if (currentLocal === 'A') {
                    e.target.value = '';
                } else if (currentLocal === 'B') {
                    e.target.value = '';
                }
            } else if (input === 'git push') {
                console.log('test')
                if (currentLocal === 'A') {
                    await pushLocalA();
                    e.target.value = '';
                } else if (currentLocal === 'B') {
                    await pushLocalB();
                    e.target.value = '';
                }
            }
        }
    });
});