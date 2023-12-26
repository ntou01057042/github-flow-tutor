import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

mermaid.initialize({
    startOnLoad: false
});

const diagram = {};
const diagramSyntax = {};
export const currentBranch = {};

let pullLocalAButton;
let pullLocalBButton;

const commands = {};
export const branches = {};
const branchNumber = {
    origin: {},
    localA: 0,
    localB: 0,
};

function dfs(data, mode) {
    const commandMap = new Map();
    for (const command of data) {
        commandMap.set(command.timestamp, command);
    }
    // console.log('commandMap:', commandMap);

    const graph = new Map();
    for (const command of data) {
        graph.set(command.parentTimestamp, new Array(0));
    }
    for (const i in data) {
        // console.log(data[i]);
        const children = graph.get(data[i].parentTimestamp);
        if (children.length === 0 || data[i].syntax.includes('merge')) {
            children.push(data[i].timestamp);
        } else {
            children.push(0);
            for (let j = children.length - 2; j >= 0; --j) {
                const check = commandMap.get(children[j]);
                if (check.syntax.includes('merge')) {
                    children[j + 1] = check;
                } else {
                    children[j + 1] = data[i].timestamp;
                    break;
                }
            }
        }
    }
    // console.log('graph:', graph);

    const candidate = [];
    for (const command of data) {
        if (command.syntax.includes('checkout main\nmerge')) {
            candidate.push(command.timestamp);
        }
    }
    const start = [graph.get(0)[0]];
    // console.log('start:', start);
    const visited = new Set();
    const waiting = new Set();
    while (visited.size < commandMap.size) {
        // console.log('start:', start);
        // console.log('visited:', visited);
        // console.log('waiting:', waiting);
        const s = start.shift();
        // console.log('s:', s);
        const stack = [s];
        while (stack.length) {
            const command = stack.pop();
            // console.log('command:', command);
            if (!visited.has(command)) {
                if (commandMap.get(command).syntax.includes('merge') && command !== s) {
                    if (!waiting.has(command)) {
                        waiting.add(command);
                        start.push(candidate.shift());
                        start.push(command);
                        break;
                    } else {
                        waiting.delete(command);
                    }
                }
                visited.add(command);
                // console.log('dfs visiting:', commandMap.get(command));
                if (mode === 0) {
                    diagramSyntax.origin += `${commandMap.get(command).syntax}`;
                } else if (mode === 1) {
                    diagramSyntax.localA += `${commandMap.get(command).syntax}`;
                } else if (mode === 2) {
                    diagramSyntax.localB += `${commandMap.get(command).syntax}`;
                }
                if (graph.get(command)) {
                    for (let i = graph.get(command).length - 1; i >= 0; --i) {
                        stack.push(graph.get(command)[i]);
                    }
                }
            }
        }
    }
}

async function refreshDiagram(name, selector) {
    if (name === 'origin') {
        diagram.origin.removeAttribute('data-processed');
    } else if (name === 'localA') {
        diagram.localA.removeAttribute('data-processed');
    } else if (name === 'localB') {
        diagram.localB.removeAttribute('data-processed');
    }
    await mermaid.run({
        querySelector: selector,
    });
}

function renderOrigin() {
    // get all origin commands
    $.ajax({
        url: '/commands',
        success: async function (data) {
            console.log('/commands [GET] success!');
            // console.log('data:', data);
            // initialize
            commands.origin = data;
            // console.log('commands.origin:', commands.origin);
            diagramSyntax.origin = 'gitGraph';
            // render diagram
            dfs(commands.origin, 0);
            diagram.origin.innerHTML = diagramSyntax.origin;
            await refreshDiagram('origin', '#origin-diagram');
            // get all origin branches
            $.ajax({
                url: '/branches',
                success: function (data) {
                    console.log('/branches [GET] success!');
                    branches.origin = new Map();
                    for (const branch of data) {
                        branches.origin.set(branch.name, branch);
                    }
                    // console.log('branches.origin:', branches.origin);
                    // get branch numbers
                    $.ajax({
                        url: '/branches/count?local=a',
                        success: function (data) {
                            console.log('/branches/count?local=a [GET] success!');
                            branchNumber.origin.a = data;
                            // console.log('branchNumber.origin.a:', branchNumber.origin.a);
                            $.ajax({
                                url: '/branches/count?local=b',
                                success: function (data) {
                                    console.log('/branches/count?local=b [GET] success!');
                                    branchNumber.origin.b = data;
                                    // console.log('branchNumber.origin.b:', branchNumber.origin.b);
                                }
                            })
                        }
                    })
                }
            });
        },
    });
}

export function reset() {
    const timestamp = Date.now();
    // reset origin commands
    $.ajax({
        contentType: 'application/json',
        data: JSON.stringify({
            syntax: '\ncommit id:\"Initial commit\"',
            timestamp: timestamp,
            parentTimestamp: 0,
        }),
        method: 'DELETE',
        url: '/commands',
        success: function () {
            console.log('/commands [DELETE] success!');
            // reset origin branches
            $.ajax({
                contentType: 'application/json',
                data: JSON.stringify({
                    name: 'main',
                    lastTimestamp: timestamp,
                }),
                method: 'DELETE',
                url: '/branches',
                success: function () {
                    console.log('/branches [DELETE] success!');
                    location.reload();
                },
            });
        }
    });
}

export async function cloneLocalA() {
    // copy origin commands
    commands.localA = [...commands.origin];
    // console.log('commands.localA:', commands.localA);
    // copy origin branches
    branches.localA = new Map(branches.origin);
    // console.log('branches.localA:', branches.localA);
    // copy origin branch numbers
    branchNumber.localA = branchNumber.origin.a;
    // console.log('branchNumber.localA:', branchNumber.localA);
    // render diagram
    diagramSyntax.localA = diagramSyntax.origin;
    diagram.localA.innerHTML = diagramSyntax.localA;
    await refreshDiagram('localA', '#local-a-diagram');
    // set current branch text
    currentBranch.localA.innerHTML = '現在分支：main';
}

export async function cloneLocalB() {
    // copy origin commands
    commands.localB = [...commands.origin];
    // console.log('commands.localB:', commands.localB);
    // copy origin branches
    branches.localB = new Map(branches.origin);
    // console.log('branches.localB:', branches.localB);
    // copy origin branch numbers
    branchNumber.localB = branchNumber.origin.b;
    // console.log('branchNumber.localB:', branchNumber.localB);
    // render diagram
    diagramSyntax.localB = diagramSyntax.origin;
    diagram.localB.innerHTML = diagramSyntax.localB;
    await refreshDiagram('localB', '#local-b-diagram');
    // set current branch text
    currentBranch.localB.innerHTML = '現在分支：main';
}

export async function branchLocalA() {
    const newBranchName = `a${++branchNumber.localA}`;
    // console.log('branchNumber.localA:', branchNumber.localA);
    const timestamp = Date.now();
    // add new branch
    branches.localA.set(newBranchName, {
        name: newBranchName,
        lastTimestamp: timestamp,
    });
    // console.log('branches.localA:', branches.localA);
    // add new command
    commands.localA.push({
        syntax: `\ncheckout ${currentBranch.localA.dataset.branch}\nbranch a${branchNumber.localA}`,
        timestamp: timestamp,
        parentTimestamp: branches.localA.get(currentBranch.localA.dataset.branch).lastTimestamp,
    });
    // console.log('commands.localA', commands.localA);
    // render diagram
    diagramSyntax.localA += `\ncheckout ${currentBranch.localA.dataset.branch}`;
    diagramSyntax.localA += `\nbranch a${branchNumber.localA}`;
    diagram.localA.innerHTML = diagramSyntax.localA;
    await refreshDiagram('localA', '#local-a-diagram');
    // update current branch text
    currentBranch.localA.dataset.branch = newBranchName;
    currentBranch.localA.innerHTML = `現在分支：${newBranchName}`;
}

export async function branchLocalB() {
    const newBranchName = `b${++branchNumber.localB}`;
    // console.log('branchNumber.localB:', branchNumber.localB);
    const timestamp = Date.now();
    // add new branch
    branches.localB.set(newBranchName, {
        name: newBranchName,
        lastTimestamp: timestamp,
    });
    // console.log('branches.localB:', branches.localB);
    // add new command
    commands.localB.push({
        syntax: `\ncheckout ${currentBranch.localB.dataset.branch}\nbranch b${branchNumber.localB}`,
        timestamp: timestamp,
        parentTimestamp: branches.localB.get(currentBranch.localB.dataset.branch).lastTimestamp,
    });
    // console.log('commands.localB', commands.localB);
    // render diagram
    diagramSyntax.localB += `\ncheckout ${currentBranch.localB.dataset.branch}`;
    diagramSyntax.localB += `\nbranch b${branchNumber.localB}`;
    diagram.localB.innerHTML = diagramSyntax.localB;
    await refreshDiagram('localB', '#local-b-diagram');
    // update current branch text
    currentBranch.localB.dataset.branch = newBranchName;
    currentBranch.localB.innerHTML = `現在分支：${newBranchName}`;
}

export async function commitLocalA() {
    const localACurrentBranch = currentBranch.localA.dataset.branch;
    const timestamp = Date.now();
    // add new command
    commands.localA.push({
        syntax: `\ncheckout ${localACurrentBranch}\ncommit`,
        timestamp: timestamp,
        parentTimestamp: branches.localA.get(localACurrentBranch).lastTimestamp,
    });
    // console.log('commands.localA:', commands.localA);
    // update branch last timestamp
    branches.localA.get(localACurrentBranch).lastTimestamp = timestamp;
    // console.log('branches.localA:', branches.localA);
    // render diagram
    diagramSyntax.localA += `\ncheckout ${localACurrentBranch}`;
    diagramSyntax.localA += '\ncommit';
    diagram.localA.innerHTML = diagramSyntax.localA;
    await refreshDiagram('localA', '#local-a-diagram');
}

export async function commitLocalB() {
    const localBCurrentBranch = currentBranch.localB.dataset.branch;
    const timestamp = Date.now();
    // add new command
    commands.localB.push({
        syntax: `\ncheckout ${localBCurrentBranch}\ncommit`,
        timestamp: timestamp,
        parentTimestamp: branches.localB.get(localBCurrentBranch).lastTimestamp,
    });
    // console.log('commands.localB:', commands.localB);
    // update branch last timestamp
    branches.localB.get(localBCurrentBranch).lastTimestamp = timestamp;
    // console.log('branches.localB:', branches.localB);
    // render diagram
    diagramSyntax.localB += `\ncheckout ${localBCurrentBranch}`;
    diagramSyntax.localB += '\ncommit';
    diagram.localB.innerHTML = diagramSyntax.localB;
    await refreshDiagram('localB', '#local-b-diagram');
}

export async function pushLocalA() {
    // push commands
    $.ajax({
        contentType: 'application/json',
        data: JSON.stringify([...commands.localA, {
            syntax: '\ncheckout main',
            timestamp: Date.now(),
            parentTimestamp: branches.localA.get(currentBranch.localA.dataset.branch).lastTimestamp,
        }]),
        method: 'POST',
        url: '/commands/push',
        success: function () {
            console.log('/commands/push [POST] success!');
            // push branches
            $.ajax({
                contentType: 'application/json',
                data: JSON.stringify([...branches.localA.values()]),
                method: 'POST',
                url: '/branches/push',
                success: function (data) {
                    console.log('/branches/push [POST] success!');
                    renderOrigin();
                }
            });
        }
    });
}

export async function pushLocalB() {
    $.ajax({
        contentType: 'application/json',
        data: JSON.stringify([...commands.localB, {
            syntax: '\ncheckout main',
            timestamp: Date.now(),
            parentTimestamp: branches.localB.get(currentBranch.localB.dataset.branch).lastTimestamp,
        }]),
        method: 'POST',
        url: '/commands/push',
        success: function () {
            console.log('/commands/push [POST] success!');

            // push branches
            $.ajax({
                contentType: 'application/json',
                data: JSON.stringify([...branches.localB.values()]),
                method: 'POST',
                url: '/branches/push',
                success: function () {
                    console.log('/branches/push [POST] success!');
                    renderOrigin();
                }
            });
        }
    });
}

export async function checkoutLocalA(branch) {
    // add new command
    commands.localA.push({
        syntax: `\ncheckout ${currentBranch.localA.dataset.branch}\ncheckout ${branch}`,
        timestamp: Date.now(),
        parentTimestamp: branches.localA.get(currentBranch.localA.dataset.branch).lastTimestamp,
    });
    // console.log('commands.localA:', commands.localA);
    // render diagram
    diagramSyntax.localA += `\ncheckout ${currentBranch.localA.dataset.branch}`;
    diagramSyntax.localA += `\ncheckout ${branch}`;
    diagram.localA.innerHTML = diagramSyntax.localA;
    await refreshDiagram('localA', '#local-a-diagram');
    // update current branch text
    currentBranch.localA.dataset.branch = branch;
    currentBranch.localA.innerHTML = `現在分支：${branch}`;
}

export async function checkoutLocalB(branch) {
    // add new command
    commands.localB.push({
        syntax: `\ncheckout ${currentBranch.localB.dataset.branch}\ncheckout ${branch}`,
        timestamp: Date.now(),
        parentTimestamp: branches.localB.get(currentBranch.localB.dataset.branch).lastTimestamp,
    });
    // console.log('commands.localB:', commands.localB);
    // render diagram
    diagramSyntax.localB += `\ncheckout ${currentBranch.localB.dataset.branch}`;
    diagramSyntax.localB += `\ncheckout ${branch}`;
    diagram.localB.innerHTML = diagramSyntax.localB;
    await refreshDiagram('localB', '#local-b-diagram');
    // update current branch text
    currentBranch.localB.dataset.branch = branch;
    currentBranch.localB.innerHTML = `現在分支：${branch}`;
}

export async function mergeLocalA(branch) {
    const timestamp = Date.now();
    // add new command
    commands.localA.push({
        syntax: `\ncheckout ${currentBranch.localA.dataset.branch}\nmerge ${branch}`,
        timestamp: timestamp,
        parentTimestamp: branches.localA.get(currentBranch.localA.dataset.branch).lastTimestamp,
    });
    // console.log('commands.localA:', commands.localA);
    // update branch
    branches.localA.get(currentBranch.localA.dataset.branch).lastTimestamp = timestamp;
    if (branch !== 'main') {
        branches.localA.get(branch).deleted = true;
    }
    // render diagram
    diagramSyntax.localA += `\ncheckout ${currentBranch.localA.dataset.branch}`;
    diagramSyntax.localA += `\nmerge ${branch}`;
    diagram.localA.innerHTML = diagramSyntax.localA;
    await refreshDiagram('localA', '#local-a-diagram');
}

export async function mergeLocalB(branch) {
    const timestamp = Date.now();
    // add new command
    commands.localB.push({
        syntax: `\ncheckout ${currentBranch.localB.dataset.branch}\nmerge ${branch}`,
        timestamp: timestamp,
        parentTimestamp: branches.localB.get(currentBranch.localB.dataset.branch).lastTimestamp,
    });
    // console.log('commands.localB:', commands.localB);
    // update branch
    branches.localB.get(currentBranch.localB.dataset.branch).lastTimestamp = timestamp;
    if (branch !== 'main') {
        branches.localB.get(branch).deleted = true;
    }
    // render diagram
    diagramSyntax.localB += `\ncheckout ${currentBranch.localB.dataset.branch}`;
    diagramSyntax.localB += `\nmerge ${branch}`;
    diagram.localB.innerHTML = diagramSyntax.localB;
    await refreshDiagram('localB', '#local-b-diagram');
}

export async function pullLocalA() {
    // pull origin commands
    for (const c1 of commands.origin) {
        let flag = true;
        for (const c2 of commands.localA) {
            if (c2.timestamp === c1.timestamp) {
                flag = false;
            }
        }
        if (flag) {
            commands.localA.push(c1);
        }
    }
    // console.log('commands.localA:', commands.localA);
    // pull origin branches
    for (const [key, value] of branches.origin) {
        branches.localA.set(key, value);
    }
    // console.log('branches.localA:', branches.localA);
    // pull branch number
    branchNumber.localA = branchNumber.origin.a;
    // render diagram
    diagramSyntax.localA = 'gitGraph';
    dfs(commands.localA, 1);
    diagram.localA.innerHTML = diagramSyntax.localA;
    await refreshDiagram('localA', '#local-a-diagram');
}

export async function pullLocalB() {
    // pull origin commands
    for (const c1 of commands.origin) {
        let flag = true;
        for (const c2 of commands.localB) {
            if (c2.timestamp === c1.timestamp) {
                flag = false;
            }
        }
        if (flag) {
            commands.localB.push(c1);
        }
    }
    // console.log('commands.localB:', commands.localB);
    // pull origin branches
    for (const [key, value] of branches.origin) {
        branches.localB.set(key, value);
    }
    // console.log('branches.localB:', branches.localB);
    // pull branch number
    branchNumber.localB = branchNumber.origin.b;
    // render diagram
    diagramSyntax.localB = 'gitGraph';
    dfs(commands.localB, 2);
    diagram.localB.innerHTML = diagramSyntax.localB;
    await refreshDiagram('localB', '#local-b-diagram');
}

window.addEventListener('load', () => {
    diagram.origin = document.getElementById('origin-diagram');
    diagram.localA = document.getElementById('local-a-diagram');
    diagram.localB = document.getElementById('local-b-diagram');
    currentBranch.localA = document.getElementById('local-a-current-branch');
    currentBranch.localB = document.getElementById('local-b-current-branch');

    pullLocalAButton = document.getElementById('pull-local-a-button');
    pullLocalBButton = document.getElementById('pull-local-b-button');

    renderOrigin();
});